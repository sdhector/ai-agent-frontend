# Android APK Debugging Guide

## Quick Start: Using Android Emulator

### Option 1: Android Studio Emulator (Recommended)

1. **Open Android Studio**
2. **Tools > Device Manager**
3. **Create Virtual Device** (if you don't have one):
   - Choose a device (e.g., Pixel 5)
   - Select a system image (Android 13 recommended)
   - Finish setup
4. **Start the emulator** from Device Manager
5. **Install APK**:
   ```powershell
   adb install path\to\app-release.apk
   ```
6. **Monitor logs**:
   ```powershell
   .\scripts\get-crash-logs.ps1
   ```

### Option 2: Use Expo Go (Fastest for Development)

Instead of building APK, use Expo Go for faster iteration:

1. **Start emulator** (from Android Studio or script)
2. **Install Expo Go** on emulator:
   ```powershell
   adb install -r "path\to\Expo Go.apk"
   ```
   Or download from Play Store in emulator
3. **Start development server**:
   ```powershell
   npm start
   ```
4. **Press 'a'** to open on Android emulator

**Advantages**:
- ✅ Instant reload (no rebuild needed)
- ✅ See console logs in terminal
- ✅ Hot reload for fast iteration
- ✅ No APK build time

---

## Debugging APK Crashes

### Step 1: Get Crash Logs

**Method 1: Using Script (Easiest)**
```powershell
.\scripts\get-crash-logs.ps1
```

**Method 2: Manual ADB**
```powershell
$env:ANDROID_HOME = "C:\Users\Hector's PC\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"

# Get recent logs
adb logcat -d | Select-String -Pattern "ReactNative|FATAL|aiagent" | Select-Object -Last 50

# Get fatal errors only
adb logcat -d *:E | Select-Object -Last 30
```

**Method 3: Real-time Monitoring**
```powershell
.\scripts\monitor-android-crash.ps1
```

### Step 2: Common Crash Causes

1. **Missing Native Modules**
   - Error: "Unable to resolve module"
   - Fix: Ensure all dependencies are in `dependencies`, not `devDependencies`

2. **Web-only Code in Native**
   - Error: "window is not defined" or CSS import errors
   - Fix: Use `Platform.OS === 'web'` checks

3. **Missing Permissions**
   - Error: Permission denied
   - Fix: Check `AndroidManifest.xml`

4. **JavaScript Errors**
   - Error: "Cannot read property of undefined"
   - Fix: Check ErrorBoundary logs

5. **Native Module Initialization**
   - Error: "Module not found" or initialization errors
   - Fix: Run `npx expo prebuild --clean`

---

## Installing APK on Emulator

### Method 1: Direct Install
```powershell
adb install path\to\app-release.apk
```

### Method 2: Drag and Drop
- Drag APK file into emulator window
- Install when prompted

### Method 3: From EAS Build
```powershell
# Download APK from EAS
# Then install:
adb install downloaded-apk.apk
```

---

## Monitoring App Behavior

### View All Logs
```powershell
adb logcat
```

### Filter by App
```powershell
adb logcat | Select-String -Pattern "com.hectorsanchez.aiagent"
```

### Filter by Error Level
```powershell
# Errors only
adb logcat *:E

# React Native logs
adb logcat | Select-String -Pattern "ReactNativeJS"
```

### Clear Logs and Monitor Fresh
```powershell
adb logcat -c  # Clear
adb logcat     # Monitor
```

---

## Common Issues and Solutions

### Issue: Emulator Won't Start
**Solution**:
1. Check if HAXM/Virtualization is enabled in BIOS
2. Try a different system image
3. Increase emulator RAM in AVD settings

### Issue: ADB Can't Find Device
**Solution**:
```powershell
adb kill-server
adb start-server
adb devices
```

### Issue: App Crashes Immediately
**Check**:
1. Run `.\scripts\get-crash-logs.ps1` for error details
2. Look for "FATAL EXCEPTION" in logs
3. Check for missing native modules
4. Verify all dependencies are installed

### Issue: Can't See Console Logs
**Solution**:
- Use `adb logcat` to see all logs
- Filter for React Native: `adb logcat | Select-String "ReactNativeJS"`

---

## Development Workflow

### Fast Iteration (Recommended)
1. Use **Expo Go** on emulator
2. Run `npm start`
3. Press 'a' to open on emulator
4. See logs in terminal
5. Hot reload automatically

### Production Testing
1. Build APK: `eas build --platform android --profile production`
2. Install on emulator: `adb install app-release.apk`
3. Monitor: `.\scripts\monitor-android-crash.ps1`
4. Test all features

---

## Useful Commands

```powershell
# List devices
adb devices

# Install APK
adb install app-release.apk

# Uninstall app
adb uninstall com.hectorsanchez.aiagent

# Clear app data
adb shell pm clear com.hectorsanchez.aiagent

# Start app
adb shell am start -n com.hectorsanchez.aiagent/.MainActivity

# Get app logs
adb logcat | Select-String "aiagent"

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

## Next Steps

1. **Set up emulator** (if not already done)
2. **Install APK** on emulator
3. **Monitor logs** while app starts
4. **Identify crash cause** from logs
5. **Fix and rebuild**




