# Moodly : lance tout ce qu'il faut pour la demo locale (base de donnees, API,
# application, visualiseur de base) et affiche les adresses a ouvrir sur le PC
# et sur un telephone connecte au meme Wi-Fi.
#
# Utilisation, depuis la racine du projet :
#   powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1          (lance tout)
#   powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -Reset   (remet aussi les donnees de demo)
#   powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -Check   (affiche l'adresse du PC, ne lance rien)
# (avec "/" la commande marche dans PowerShell comme dans Git Bash)

param(
  [switch]$Reset,
  [switch]$Check
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$firewallRule = 'Moodly (demo locale)'

function Write-Step($text) { Write-Host "`n> $text" -ForegroundColor Magenta }

# Local IP of the PC on the Wi-Fi (the address the phone must use, never localhost)
function Get-LanIp {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
    $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and
    $_.InterfaceAlias -notmatch 'vEthernet|Loopback|WSL|VirtualBox|VMware|Bluetooth'
  }
  $wifi = $candidates | Where-Object { $_.InterfaceAlias -match 'Wi-?Fi|sans fil|Wireless|WLAN' } | Select-Object -First 1
  if ($wifi) { return $wifi.IPAddress }
  return ($candidates | Select-Object -First 1).IPAddress
}

$ip = Get-LanIp
if (-not $ip) {
  Write-Host "Aucune connexion reseau trouvee. Connecte le PC au Wi-Fi, puis relance." -ForegroundColor Red
  exit 1
}
Write-Host "Adresse du PC sur le reseau : $ip" -ForegroundColor Green
if ($Check) { exit 0 }

# 1. Free the ports (asks before stopping anything)
Write-Step 'Verification des ports'
$ports = [ordered]@{ '3000' = 'API'; '5173' = 'application'; '5555' = 'Prisma Studio' }
foreach ($port in $ports.Keys) {
  $connection = Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($connection) {
    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    $answer = Read-Host "Le port $port ($($ports[$port])) est deja utilise par '$($process.ProcessName)'. L'arreter ? (o/n)"
    if ($answer -ne 'o') { Write-Host 'Lancement annule.'; exit 1 }
    Stop-Process -Id $connection.OwningProcess -Force
  }
}

# 2. Windows firewall: let the phone reach the API and the app (asked only once)
if (-not (Get-NetFirewallRule -DisplayName $firewallRule -ErrorAction SilentlyContinue)) {
  Write-Step 'Ouverture des ports 3000 et 5173 dans le pare-feu (Windows va demander une confirmation)'
  $command = "New-NetFirewallRule -DisplayName '$firewallRule' -Direction Inbound -Protocol TCP -LocalPort 3000,5173 -Action Allow -Profile Any"
  try {
    Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile', '-Command', $command
  } catch {
    Write-Host 'Pare-feu non modifie : le telephone ne pourra peut-etre pas se connecter.' -ForegroundColor Yellow
  }
}

# 3. Database (starts Docker Desktop if needed)
Write-Step 'Base de donnees'
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Demarrage de Docker Desktop...'
  Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  }
  if (-not $ready) { Write-Host 'Docker ne repond pas. Lance Docker Desktop a la main, puis relance.' -ForegroundColor Red; exit 1 }
}
docker compose -f "$root\docker-compose.yml" up -d --wait
if ($LASTEXITCODE -ne 0) { Write-Host 'La base ne demarre pas.' -ForegroundColor Red; exit 1 }

# 4. Dependencies, migrations and (optionally) demo data
Write-Step 'API : dependances et migrations'
Push-Location "$root\backend"
if (-not (Test-Path 'node_modules')) { npm install }
if (-not (Test-Path '.env')) {
  Write-Host 'Fichier backend\.env manquant : copie-le depuis .env.example et remplace JWT_SECRET.' -ForegroundColor Red
  Pop-Location; exit 1
}
npx prisma migrate deploy
if ($Reset) {
  Write-Step 'Remise a zero des donnees de demo'
  npm run seed
}
Pop-Location
if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Step 'Application : dependances'
  Push-Location "$root\frontend"; npm install; Pop-Location
}

# 5. Compile the API once (a few seconds), then start everything in the background,
#    without windows. Each service writes its logs to a file.
Write-Step 'Compilation de l API'
Push-Location "$root\backend"
npm run build | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host 'La compilation de l API a echoue : lance "npm run build" dans backend pour voir l erreur.' -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location

Write-Step 'Lancement de l API, de l application et de Prisma Studio (en arriere-plan)'
$logs = Join-Path $env:TEMP 'moodly-logs'
New-Item -ItemType Directory -Force $logs | Out-Null

# CORS and API URL are set for these processes only: the .env files are not modified
$env:CORS_ORIGINS = "http://localhost:5173,http://localhost,capacitor://localhost,http://${ip}:5173"
$env:VITE_API_URL = "http://${ip}:3000/api"
$env:VITE_USE_MOCK = 'false'

function Start-MoodlyProcess($name, $file, $arguments, $folder) {
  $process = Start-Process -FilePath $file -ArgumentList $arguments -WorkingDirectory $folder -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput "$logs\$name.log" -RedirectStandardError "$logs\$name-erreurs.log"
  # Remembered so that stop-demo.ps1 can stop the whole process tree
  Add-Content -Path "$logs\pids.txt" -Value $process.Id
}

Remove-Item "$logs\pids.txt" -ErrorAction SilentlyContinue
Start-MoodlyProcess 'api' 'node' 'dist/main.js' "$root\backend"
Start-MoodlyProcess 'application' 'npx.cmd' 'vite --host --port 5173 --strictPort' "$root\frontend"
Start-MoodlyProcess 'prisma-studio' 'npx.cmd' 'prisma studio --port 5555 --browser none' "$root\backend"

# 127.0.0.1 and not localhost: on Windows, "localhost" first tries IPv6, where the API does not listen
Write-Host 'Attente de l API...'
$apiUp = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  try {
    Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 'http://127.0.0.1:3000/api/health' | Out-Null
    $apiUp = $true; break
  } catch { }
}
if (-not $apiUp) { Write-Host "L'API ne repond pas : regarde $logs\api-erreurs.log" -ForegroundColor Yellow }

# 6. Summary
$app = "http://${ip}:5173"
Write-Host ''
Write-Host '==================== MOODLY EST LANCE ====================' -ForegroundColor Green
Write-Host ''
Write-Host '  Sur le PC'
Write-Host '    Application ........ http://localhost:5173'
Write-Host '    API (Swagger) ...... http://localhost:3000/api/docs'
Write-Host '    Base de donnees .... http://localhost:5555  (Prisma Studio)'
Write-Host ''
Write-Host '  Sur le telephone (meme Wi-Fi que le PC)'
Write-Host "    Application ........ $app"
Write-Host "    Test de l'API ...... http://${ip}:3000/api/health"
Write-Host ''
Write-Host '  Comptes (mot de passe : Moodly2026!)'
Write-Host '    alice@moodly.dev ............. employee, n a pas encore repondu'
Write-Host '    manager.produit@moodly.dev ... tableau de bord'
Write-Host '    manager.support@moodly.dev ... tableau de bord (autre equipe)'
Write-Host ''
Write-Host '  QR code : une image s ouvre, a scanner avec l appareil photo du telephone.'
Write-Host "  Logs (en cas d erreur) : $logs"
Write-Host '  Pour tout arreter : powershell -ExecutionPolicy Bypass -File scripts/stop-demo.ps1'
Write-Host '==========================================================' -ForegroundColor Green

Start-Process 'http://localhost:5173'
Start-Process 'http://localhost:3000/api/docs'
Start-Process 'http://localhost:5555'

# QR code of the phone address, as an image (the address changes with the network)
$qrImage = Join-Path $env:TEMP 'moodly-qr.png'
npx -y qrcode@1.5.4 -o $qrImage -w 480 -m 2 $app | Out-Null
if (Test-Path $qrImage) { Start-Process $qrImage }
