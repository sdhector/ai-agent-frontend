# Android APK Build Guide - Post Ignite Migration

**Date**: Today  
**Status**: Ready for Build  
**Project Path**: `d:\projects\ai-agent-frontend` (clean path, no spaces)  
**Structure**: Ignite Boilerplate (React Navigation, not Expo Router)

---

## Prerequisites

✅ **Completed**:
- Ignite migration complete
- Dependencies installed (`npm install --legacy-peer-deps`)
- Web build working
- TypeScript compiles without errors
- `react-native-worklets` removed (not needed for Ignite)
- Clean project path (no spaces or special characters)

---

## Build Options

### Option 1: EAS Build (Cloud) ⭐

**Why**: Cloud-based build avoids local environment issues, path length problems, and NDK configuration.

**Commands**:
```bash
# Preview APK (for testing)
npm run build:android:preview
# or
eas build --platform android --profile preview

# Production APK
npm run build:android
# or
eas build --platform android --profile production
```

**Configuration**: Already set up in `eas.json`:
- Preview profile: APK build
- Production profile: APK build
- EAS Project ID: `942c3376-7855-43ec-bb98-9bcb8a29facc`

**Advantages**:
- ✅ No local Android SDK/NDK setup needed
- ✅ No path length issues
- ✅ Consistent build environment
- ✅ Automatic signing
- ✅ Works from any location

**Limitations**:
- ⚠️ 15 builds per month on free tier
- ⚠️ Requires internet connection
- ⚠️ Upload/download time

---

### Option 1.5: WSL Build (Recommended for Local) 🐧

**Why**: Linux build environment in Windows via WSL avoids Windows-specific C++ linking issues while allowing unlimited local builds.

**Setup**: See [WSL_ANDROID_BUILD_SETUP.md](./WSL_ANDROID_BUILD_SETUP.md) for complete setup instructions.

**Quick Start**:
```bash
# In WSL terminal
cd /mnt/d/projects/ai-agent-frontend
bash scripts/setup-wsl-android.sh    # First time only
bash scripts/build-apk-wsl.sh        # Build APK
```

**Advantages**:
- ✅ Unlimited builds (no EAS limits)
- ✅ Faster iteration (no upload/download)
- ✅ Linux environment (avoids Windows C++ issues)
- ✅ Full control and debugging
- ✅ Free (no quotas)

**Requirements**:
- WSL 2 with Ubuntu installed
- ~5GB disk space for Android SDK/NDK

---

### Option 2: Native Windows Build (Not Recommended)

**Prerequisites**:
- Android Studio installed
- Android SDK configured
- NDK 27 installed (if using native modules)
- Java JDK installed
- `react-native-worklets` installed as dev dependency (required by `react-native-reanimated`)

**Commands**:
```bash
# Install worklets (required for reanimated build)
npm install --save-dev react-native-worklets --legacy-peer-deps

# Generate native Android project
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew.bat assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

**Note**: Local builds may encounter issues on Windows:
- Path length issues if project path is very long
- C++ linker errors with native modules (NDK/CMake compatibility)
- Windows-specific NDK build configuration issues

**Known Issues**:
1. **react-native-reanimated requires worklets**: Since `nativewind` depends on `react-native-reanimated`, which requires `react-native-worklets`, you must install worklets as a dev dependency even if you're not using reanimated features directly.

2. **C++ Linking Errors**: Windows local builds may encounter C++ standard library linking errors with native modules (expo-modules-core, react-native-screens, etc.). These are Windows/NDK-specific issues that don't occur in EAS's Linux build environment.

**If you encounter build issues**:
1. **Path length issues**: Enable Windows Long Path Support (requires admin):
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
     -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
2. **C++ linking errors**: These are complex Windows/NDK issues. **Use EAS Build instead (strongly recommended)**.
3. **Worklets not found**: Ensure `react-native-worklets` is installed as a dev dependency.

**Why EAS/WSL Builds Succeed**:
- Uses Linux build environment (no Windows-specific issues)
- Pre-configured NDK/CMake setup
- Consistent build environment
- No path length limitations
- Proper C++ standard library linking configured

**Recommendation**: Use **WSL Build** (Option 1.5) for unlimited local builds, or **EAS Build** (Option 1) for cloud builds.

---

## Current Project State

### ✅ Dependencies
- **Removed**: `expo-router`, `@react-native-async-storage/async-storage`, `react-native-worklets`
- **Using**: `react-native-mmkv` (synchronous storage)
- **Navigation**: React Navigation (not Expo Router)
- **Entry Point**: `index.js` → `app/app.tsx`

### ✅ File Structure
```
app/
├── app.tsx                 # Root component
├── navigators/
│   └── AppNavigator.tsx    # React Navigation config
├── screens/                # All screens
├── components/             # UI components
├── services/               # Business logic (MMKV storage)
├── contexts/              # React contexts
└── utils/hooks/           # Custom hooks
```

### ✅ Configuration
- `app.json`: Web output set to `"single"` (not `"static"`)
- `package.json`: Main entry is `index.js`
- `tsconfig.json`: Paths configured for Ignite structure
- `eas.json`: Build profiles configured

---

## Build Steps (EAS Build - Recommended)

### Step 1: Verify EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Build Preview APK
```bash
eas build --platform android --profile preview
```

This will:
- Upload your code to EAS servers
- Build the APK in the cloud
- Provide download link when complete

### Step 3: Test Preview APK
- Download APK from EAS dashboard
- Install on Android device/emulator
- Test all functionality

### Step 4: Build Production APK
```bash
eas build --platform android --profile production
```

---

## Troubleshooting

### Issue: Build fails with "Cannot find module"
**Solution**: Ensure all dependencies are installed:
```bash
npm install --legacy-peer-deps
```

### Issue: EAS build fails
**Solution**: Check EAS project configuration:
```bash
eas project:info
```

### Issue: Local build path length errors
**Solution**: Use EAS Build instead (recommended) or enable Windows Long Path Support

### Issue: Native module errors
**Solution**: Run prebuild to regenerate native code:
```bash
npx expo prebuild --platform android --clean
```

---

## Post-Build

### Testing Checklist
- [ ] App installs on device
- [ ] Login flow works
- [ ] Navigation works (all tabs)
- [ ] Storage persists (MMKV)
- [ ] API calls work
- [ ] No runtime errors

### Distribution
- **Internal Testing**: Use preview APK
- **Production**: Use production APK or submit to Google Play Store

---

## Key Differences from Pre-Ignite

| Aspect | Before (Expo Router) | After (Ignite) |
|--------|---------------------|----------------|
| **Navigation** | File-based routing | React Navigation |
| **Storage** | AsyncStorage (async) | MMKV (synchronous) |
| **Entry Point** | `expo-router/entry` | `index.js` → `app/app.tsx` |
| **Web Output** | `"static"` | `"single"` |
| **Dependencies** | Included worklets | Worklets removed |

---

## Success Criteria

✅ **Build completes without errors**  
✅ **APK installs on device**  
✅ **App runs and all features work**  
✅ **No runtime errors**  

---

## Next Steps After Successful Build

1. Test APK on real devices
2. Set up CI/CD for automated builds
3. Configure app signing for production
4. Prepare for Google Play Store submission (if needed)

---

**RECOMMENDATION**: Use EAS Build for the most reliable and consistent build experience.

