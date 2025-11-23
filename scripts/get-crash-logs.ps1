# Get Recent Crash Logs
# Extracts crash information from device logs

param(
    [string]$PackageName = "com.hectorsanchez.aiagent"
)

$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$ADB = "$ANDROID_HOME\platform-tools\adb.exe"

if (-not (Test-Path $ADB)) {
    Write-Host "❌ ADB not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Getting Crash Logs ===" -ForegroundColor Cyan
Write-Host "Package: $PackageName`n" -ForegroundColor Yellow

# Check if device is connected
$devices = & $ADB devices
if ($devices -notmatch "device$") {
    Write-Host "❌ No device connected. Please:" -ForegroundColor Red
    Write-Host "1. Connect device via USB" -ForegroundColor Yellow
    Write-Host "2. Enable USB debugging" -ForegroundColor Yellow
    Write-Host "3. Run: adb devices" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Device connected`n" -ForegroundColor Green

# Get recent logs
Write-Host "=== Recent App Logs ===" -ForegroundColor Cyan
& $ADB logcat -d -v time | Select-String -Pattern $PackageName | Select-Object -Last 50

Write-Host "`n=== Fatal Errors ===" -ForegroundColor Cyan
& $ADB logcat -d -v time | Select-String -Pattern "FATAL|AndroidRuntime" | Select-Object -Last 30

Write-Host "`n=== React Native Errors ===" -ForegroundColor Cyan
& $ADB logcat -d -v time | Select-String -Pattern "ReactNativeJS|Error|Exception" | Select-Object -Last 30

Write-Host "`n=== Full Crash Dump ===" -ForegroundColor Cyan
& $ADB logcat -d -v time *:E | Select-Object -Last 50

Write-Host "`n✅ Logs captured. Review above for errors." -ForegroundColor Green

