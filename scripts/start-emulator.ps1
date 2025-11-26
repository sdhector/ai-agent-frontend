# Start Android Emulator Script
# Lists available emulators and starts one

$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$EMULATOR = "$ANDROID_HOME\emulator\emulator.exe"
$ADB = "$ANDROID_HOME\platform-tools\adb.exe"

if (-not (Test-Path $EMULATOR)) {
    Write-Host "❌ Android Emulator not found at: $EMULATOR" -ForegroundColor Red
    Write-Host "`nPlease install Android Studio and create an AVD (Android Virtual Device)" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Tools > Device Manager" -ForegroundColor White
    Write-Host "3. Create Virtual Device" -ForegroundColor White
    Write-Host "4. Choose a device (e.g., Pixel 5)" -ForegroundColor White
    Write-Host "5. Download a system image (e.g., Android 13)" -ForegroundColor White
    Write-Host "6. Finish setup`n" -ForegroundColor White
    exit 1
}

Write-Host "`n=== Available Android Emulators ===" -ForegroundColor Cyan
$avds = & $EMULATOR -list-avds

if ($avds.Count -eq 0) {
    Write-Host "❌ No emulators found!" -ForegroundColor Red
    Write-Host "`nCreate one in Android Studio:" -ForegroundColor Yellow
    Write-Host "Tools > Device Manager > Create Virtual Device`n" -ForegroundColor White
    exit 1
}

Write-Host ""
for ($i = 0; $i -lt $avds.Count; $i++) {
    Write-Host "$($i + 1). $($avds[$i])" -ForegroundColor Green
}
Write-Host ""

# Check if any emulator is already running
$running = & $ADB devices | Select-String "emulator"
if ($running) {
    Write-Host "✅ Emulator already running:" -ForegroundColor Green
    & $ADB devices
    Write-Host ""
    exit 0
}

# If only one emulator, start it automatically
if ($avds.Count -eq 1) {
    Write-Host "Starting emulator: $($avds[0])" -ForegroundColor Yellow
    Write-Host "This may take a minute...`n" -ForegroundColor Yellow
    Start-Process $EMULATOR -ArgumentList "-avd", $avds[0]
    Write-Host "✅ Emulator starting in background" -ForegroundColor Green
    Write-Host "Wait for it to boot, then check: adb devices`n" -ForegroundColor Yellow
} else {
    Write-Host "Multiple emulators found. Please specify which one to start:" -ForegroundColor Yellow
    Write-Host "Example: .\scripts\start-emulator.ps1 -AvdName `"Pixel_5_API_33`"`n" -ForegroundColor White
    Write-Host "Or start manually:" -ForegroundColor Yellow
    Write-Host "  $EMULATOR -avd `"$($avds[0])`"`n" -ForegroundColor Green
}







