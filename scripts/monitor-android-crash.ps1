# Android Crash Monitor Script
# Monitors device logs for app crashes and errors

param(
    [string]$PackageName = "com.hectorsanchez.aiagent",
    [int]$Lines = 100
)

$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$ADB = "$ANDROID_HOME\platform-tools\adb.exe"

if (-not (Test-Path $ADB)) {
    Write-Host "❌ ADB not found at: $ADB" -ForegroundColor Red
    Write-Host "Please ensure Android SDK is installed." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Android Crash Monitor ===" -ForegroundColor Cyan
Write-Host "Package: $PackageName" -ForegroundColor Yellow
Write-Host "`nMonitoring device logs... (Press Ctrl+C to stop)`n" -ForegroundColor Green

# Clear logcat buffer
& $ADB logcat -c

# Monitor logs with filters for crashes and React Native errors
& $ADB logcat -v time | Select-String -Pattern "ReactNative|AndroidRuntime|FATAL|$PackageName|Error|Exception|Crash" -Context 2,5

