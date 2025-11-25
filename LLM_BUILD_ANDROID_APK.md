# Build Android APK - Instructions for LLM

## Goal
Build an Android APK for the ai-agent-frontend React Native/Expo application using the WSL build environment.

## Project Location
```
Windows: D:\projects\ai-agent-frontend
WSL: /mnt/d/projects/ai-agent-frontend
```

## WSL Environment Status ✅

The WSL Ubuntu environment has been fully configured with:

| Component | Version | Location |
|-----------|---------|----------|
| Java (OpenJDK) | 21.0.8 | `/usr/lib/jvm/java-21-openjdk-amd64` |
| Node.js | v22.21.0 | - |
| EAS CLI | 16.28.0 | Global npm |
| platform-tools | Latest | `~/Android/Sdk/platform-tools/` |
| platforms;android-36 | ✅ | `~/Android/Sdk/platforms/android-36/` |
| build-tools;36.0.0 | ✅ | `~/Android/Sdk/build-tools/36.0.0/` |
| ndk;27.1.12297006 | ✅ | `~/Android/Sdk/ndk/27.1.12297006/` |

Environment variables configured in `~/.profile` (source it first!):
- `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64`
- `ANDROID_HOME=/home/sdhector/Android/Sdk`
- `ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.1.12297006`

**Note**: Run `source ~/.profile` at the start of your WSL session to load these variables.

## Your Task

Build the Android APK using WSL. Follow these steps:

### Step 1: Verify WSL Environment

Open WSL terminal and verify the environment:

```bash
# IMPORTANT: Source .profile first (environment variables are set there)
source ~/.profile

# Verify environment variables
echo $JAVA_HOME
echo $ANDROID_HOME
echo $ANDROID_NDK_HOME

# Verify Java
java -version

# Verify Android SDK components
ls $ANDROID_HOME/platforms/
ls $ANDROID_HOME/build-tools/
ls $ANDROID_HOME/ndk/

# Verify EAS CLI
eas --version
```

**Expected output:**
- JAVA_HOME: `/usr/lib/jvm/java-21-openjdk-amd64`
- ANDROID_HOME: `/home/sdhector/Android/Sdk`
- Java version: 21.x
- Platforms: `android-36`
- Build tools: `36.0.0`
- NDK: `27.1.12297006`
- EAS CLI: 16.x

### Step 2: Navigate to Project

```bash
cd /mnt/d/projects/ai-agent-frontend
```

### Step 3: Install Dependencies (if needed)

```bash
npm install --legacy-peer-deps
```

### Step 4: Build Android APK

**Option A: Local Build with Gradle (Recommended)**

```bash
# Generate native Android project
npx expo prebuild --platform android --clean

# Navigate to android directory
cd android

# Make gradlew executable
chmod +x gradlew

# Build release APK
./gradlew assembleRelease

# APK location after successful build:
# android/app/build/outputs/apk/release/app-release.apk
```

**Option B: EAS Build (Cloud)**

```bash
# Preview APK (for testing)
eas build --platform android --profile preview --local

# Or use cloud build (uses EAS quota)
eas build --platform android --profile preview
```

### Step 5: Verify Build Output

```bash
# Check if APK was created
ls -la android/app/build/outputs/apk/release/

# Copy APK to Windows-accessible location (optional)
cp android/app/build/outputs/apk/release/app-release.apk /mnt/d/projects/
```

## Troubleshooting

### Issue: "JAVA_HOME not set" or "ANDROID_HOME not set"
```bash
# Source the profile to load environment variables
source ~/.profile
echo $JAVA_HOME
echo $ANDROID_HOME
```

### Issue: "NDK not found"
```bash
ls -la $ANDROID_HOME/ndk/
# Should show: 27.1.12297006
```

### Issue: "gradlew permission denied"
```bash
chmod +x android/gradlew
```

### Issue: "Build tools not found"
```bash
ls -la $ANDROID_HOME/build-tools/
# Should show: 36.0.0
```

### Issue: CMake or C++ errors
The WSL environment uses Linux, which typically handles native module compilation better than Windows. If you still encounter issues:
1. Ensure NDK 27.1.12297006 is being used
2. Check that `react-native-worklets` is installed (required by reanimated)
3. Try cleaning the build: `cd android && ./gradlew clean`

## Project Configuration

### Key Files
- `app.json` - Expo configuration
- `eas.json` - EAS build profiles
- `package.json` - Dependencies
- `android/` - Generated native Android project (after prebuild)

### Build Profiles (eas.json)
- `preview` - APK for testing
- `production` - Production APK

## Success Criteria

✅ Build completes without errors
✅ APK file exists at `android/app/build/outputs/apk/release/app-release.apk`
✅ APK can be installed on Android device/emulator

## Notes

- The project uses React Navigation (not Expo Router)
- Storage uses MMKV (synchronous, not async)
- The app is called "AI Agent" (package: `com.hectorsanchez.aiagent`)
- Web build also works: `npm run build:web`

## After Successful Build

1. Test the APK on a device or emulator
2. If working, commit any changes made during the build process
3. Document any issues encountered and how they were resolved

