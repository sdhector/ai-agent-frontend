# Ignite Migration Test Script
# Run this script to install dependencies and test the migration

Write-Host "🚀 Starting Ignite Migration Test..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Test web build
Write-Host "🌐 Starting web build test..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npx expo start --web

