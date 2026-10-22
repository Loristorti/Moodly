# Moodly : arrete tout ce que scripts/start-demo.ps1 a lance
# (API, application, Prisma Studio et base de donnees).
#
# Utilisation, depuis la racine du projet :
#   powershell -ExecutionPolicy Bypass -File scripts/stop-demo.ps1

$root = Split-Path -Parent $PSScriptRoot

# API, application and Prisma Studio: stop whatever listens on their ports
$ports = [ordered]@{ 3000 = 'API'; 5173 = 'Application'; 5555 = 'Prisma Studio' }
foreach ($port in $ports.Keys) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($connections) {
    $connections | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "$($ports[$port]) arretee (port $port)" -ForegroundColor Green
  } else {
    Write-Host "$($ports[$port]) deja arretee"
  }
}

# The "Moodly - ..." windows left open
Get-Process powershell -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -like 'Moodly -*' } |
  ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }

# Database (the data is kept: it is only stopped)
docker info *> $null
if ($LASTEXITCODE -eq 0) {
  docker compose -f "$root\docker-compose.yml" stop
  Write-Host 'Base de donnees arretee (les donnees sont conservees)' -ForegroundColor Green
} else {
  Write-Host 'Docker est deja eteint'
}

Write-Host "`nTout est arrete. Pour relancer : powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1"
