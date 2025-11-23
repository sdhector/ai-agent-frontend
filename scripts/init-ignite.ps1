# Ignite Boilerplate Initialization Script
# Run this script to initialize Ignite in a temporary location

Write-Host "🚀 Starting Ignite Boilerplate Migration..." -ForegroundColor Cyan

# Step 1: Create backup
Write-Host "📦 Creating backup of current code..." -ForegroundColor Yellow
$backupDir = "backup-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$itemsToBackup = @("components", "hooks", "lib", "contexts", "app", "assets", "types")
foreach ($item in $itemsToBackup) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination "$backupDir\$item" -Recurse -Force
        Write-Host "  ✓ Backed up $item" -ForegroundColor Green
    }
}

# Step 2: Navigate to parent and initialize Ignite
Write-Host "`n🔧 Initializing Ignite Boilerplate..." -ForegroundColor Yellow
$parentDir = Split-Path -Parent $PWD
$tempIgniteDir = Join-Path $parentDir "ai-agent-ignite-temp"

if (Test-Path $tempIgniteDir) {
    Write-Host "  ⚠️  Temp directory exists, removing..." -ForegroundColor Yellow
    Remove-Item -Path $tempIgniteDir -Recurse -Force
}

Write-Host "  Running: npx ignite-cli@latest new ai-agent-ignite-temp --yes" -ForegroundColor Gray
Set-Location $parentDir
npx ignite-cli@latest new ai-agent-ignite-temp --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Ignite initialized successfully" -ForegroundColor Green
    Write-Host "`n✅ Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review the Ignite structure in: $tempIgniteDir" -ForegroundColor White
    Write-Host "  2. Copy Ignite's package.json and app structure" -ForegroundColor White
    Write-Host "  3. Run the migration script to move code" -ForegroundColor White
} else {
    Write-Host "  ❌ Failed to initialize Ignite" -ForegroundColor Red
    Write-Host "  Please run manually: npx ignite-cli@latest new ai-agent-ignite-temp --yes" -ForegroundColor Yellow
}

Set-Location $PWD

Write-Host "`n📝 Backup location: $backupDir" -ForegroundColor Cyan
Write-Host "📝 Ignite temp location: $tempIgniteDir" -ForegroundColor Cyan

