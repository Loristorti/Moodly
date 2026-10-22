# Moodly : arrete tout ce que scripts/start-demo.ps1 a lance
# (API, application, Prisma Studio et base de donnees).
#
# Utilisation, depuis la racine du projet :
#   powershell -ExecutionPolicy Bypass -File scripts/stop-demo.ps1

$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $env:TEMP 'moodly-logs'

# 1. The processes started by start-demo.ps1, with all their children
if (Test-Path "$logs\pids.txt") {
  foreach ($processId in Get-Content "$logs\pids.txt") {
    taskkill /T /F /PID $processId 2>$null | Out-Null
  }
  Remove-Item "$logs\pids.txt"
}

# 2. Anything still listening on the demo ports (e.g. started another way)
$ports = [ordered]@{ '3000' = 'API'; '5173' = 'Application'; '5555' = 'Prisma Studio' }
foreach ($port in $ports.Keys) {
  $connections = Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    taskkill /T /F /PID $connection.OwningProcess 2>$null | Out-Null
  }
}
Start-Sleep -Seconds 1
foreach ($port in $ports.Keys) {
  $stillUp = Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue
  if ($stillUp) {
    Write-Host "$($ports[$port]) : toujours active sur le port $port" -ForegroundColor Yellow
  } else {
    Write-Host "$($ports[$port]) arretee" -ForegroundColor Green
  }
}

# 3. Database (the data is kept: it is only stopped)
docker info *> $null
if ($LASTEXITCODE -eq 0) {
  docker compose -f "$root\docker-compose.yml" stop 2>$null | Out-Null
  Write-Host 'Base de donnees arretee (les donnees sont conservees)' -ForegroundColor Green
} else {
  Write-Host 'Docker est deja eteint'
}

Write-Host "`nTout est arrete. Pour relancer : powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1"
