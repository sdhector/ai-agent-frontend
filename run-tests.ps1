# Ignite Migration Testing Script
# Run this script to test the migration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ignite Migration - Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean Install
Write-Host "[1/3] Cleaning old dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed package-lock.json" -ForegroundColor Green
}

# Step 2: Install Dependencies
Write-Host ""
Write-Host "[2/3] Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Installation failed!" -ForegroundColor Red
    Write-Host "  Please check the error messages above." -ForegroundColor Red
    exit 1
}

# Step 3: Start Web Server
Write-Host ""
Write-Host "[3/3] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Instructions:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Wait for the server to start" -ForegroundColor White
Write-Host "2. Open browser (usually http://localhost:8081)" -ForegroundColor White
Write-Host "3. Test the following:" -ForegroundColor White
Write-Host "   - Login screen appears" -ForegroundColor Gray
Write-Host "   - OAuth login works" -ForegroundColor Gray
Write-Host "   - Navigation to all tabs" -ForegroundColor Gray
Write-Host "   - No console errors (F12)" -ForegroundColor Gray
Write-Host "4. Press Ctrl+C to stop the server" -ForegroundColor White
Write-Host ""
Write-Host "Starting web server..." -ForegroundColor Yellow
Write-Host ""

npx expo start --web

