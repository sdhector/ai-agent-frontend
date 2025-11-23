# Build Documentation - Expo SDK 54 Migration

**Date**: November 18, 2025  
**Branch**: `feature/expo-sdk-54-migration`  
**Status**: Migration Complete, Android Build In Progress

---

## Overview

This document outlines the Expo SDK 54 migration, build process, obstacles encountered, and future improvements needed for building both PWA and Android APK from a single codebase.

---

## ✅ Completed Tasks

### 1. Expo SDK 54 Migration
- **Upgraded Expo**: `~52.0.0` → `~54.0.0`
- **Upgraded React**: `18.3.1` → `19.1.0`
- **Upgraded React Native**: `0.76.5` → `0.81.5`
- **Upgraded Expo Router**: `~4.0.0` → `~6.0.15`
- **Updated all Expo packages** to SDK 54 compatible versions
- **Fixed TypeScript errors** for React 19 compatibility
- **Removed outdated patches** (expo-modules-core patch no longer needed)

### 2. PWA Build
- ✅ **PWA build successful** - `npm run build:web` works correctly
- ✅ **PWA tested locally** - App runs and connects to backend
- ✅ **401 error handling fixed** - Invalid tokens are handled gracefully

### 3. EAS Project Setup
- ✅ **EAS project created**: `@sdhector21/ai-agent`
- ✅ **Project ID**: `942c3376-7855-43ec-bb98-9bcb8a29facc`
- ✅ **Android keystore generated** on EAS servers

---

## 🚧 Current Obstacles & Issues

### 1. Windows Path with Spaces Issue
**Problem**: EAS Build fails on Windows when project path contains spaces (`C:\Users\Hector's PC\...`)

**Error**:
```
git clone --no-checkout --no-hardlinks --depth 1 file:///C:/Users/Hector's PC/...
exited with non-zero code: 128
```

**⚠️ IMPORTANT - Fix Priority**:
1. **FIRST**: Attempt to fix/build from the original location (`C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`)
2. **ONLY IF** the path with spaces is confirmed as an obstacle, then consider the workaround location

**Workaround Location (Last Resort Only)**:
- Copy of project at `C:\dev\ai-agent-frontend` (no spaces)
- Use `EAS_NO_VCS='1'` environment variable to bypass git clone
- **Note**: This is a temporary workaround, only use if original location cannot be fixed

**Status**: ⚠️ Workaround available but should be avoided - fix original location first

### 2. Android Local Build - NDK Version Incompatibility ⭐ **PRIMARY BLOCKER**
**Problem**: React Native 0.81.5 requires NDK 27 for C++20 support, but build system is using NDK 25, causing C++ compilation errors.

**Errors Encountered**:
```
error: no member named 'regular' in namespace 'std'
error: no type named 'identity' in namespace 'std'
error: expected concept name with optional arguments
error: unknown type name 'Hashable'
```

**Root Cause**: 
- React Native 0.81.5 uses C++20 features (concepts, `std::regular`, `std::identity`) that require NDK 27+
- Installed NDK versions: 25.1.8937393 and 27.1.12297006
- Build system is defaulting to or cached with NDK 25
- CMake cache in `node_modules/*/android/.cxx/` directories persists NDK 25 configuration
- Even after removing `ndk.dir` from `local.properties` and setting `ndkVersion` in `build.gradle`, CMake continues using NDK 25

**Attempts Made**:
1. ✅ Created `android/local.properties` with SDK path
2. ✅ Removed `.git` from `C:\dev\ai-agent-frontend` to avoid path resolution issues
3. ✅ Attempted to force NDK 25 in `build.gradle` - failed with C++20 errors
4. ✅ Attempted to force NDK 27 in `build.gradle` - CMake cache still uses NDK 25
5. ✅ Tried deep cleaning `.cxx` directories - build still uses cached NDK 25 paths

**Current State**:
- Build location: `C:\dev\ai-agent-frontend\android`
- `local.properties`: Contains only `sdk.dir` (no `ndk.dir` specified)
- `build.gradle`: No explicit `ndkVersion` set (should default to 27.1.12297006)
- CMake build logs show: `C:\Users\HECTOR~1\AppData\Local\Android\Sdk\ndk\251~1.893\...` (NDK 25)

**Status**: 🔴 **BLOCKING** - NDK version mismatch preventing C++ compilation

### 3. Android Local Build - Path Length Issues (Original Location)
**Problem**: When building from original location with spaces, CMake encounters path length warnings:
- Paths exceed 250 characters (Windows limit)
- Warnings: "The object file directory has 203 characters. The maximum full path to an object file is 250 characters"

**Attempts Made**:
1. ✅ Attempted build from original location - encountered path length warnings
2. ✅ Tried using `subst` to map to drive B: - failed (settings.gradle couldn't resolve paths)
3. ✅ Moved to workaround location `C:\dev\ai-agent-frontend` - path length issue resolved

**Status**: ⚠️ Resolved by using workaround location, but NDK issue is blocking builds

### 4. EAS Cloud Build Failures
**Problem**: Builds upload successfully but fail on EAS servers with:
```
Unknown error. See logs of the Build complete hook build phase for more information.
```

**Status**: ⚠️ Needs investigation - check build logs on Expo dashboard

---

## 📋 Build Strategy

### Current Approach: Local Android Build First

**Priority Order**:
1. ✅ **PWA Build** - Working (`npm run build:web`)
2. 🔄 **Android Local Build** - In progress (Gradle)
3. ⏳ **EAS Cloud Build** - After local build succeeds

**Rationale**: 
- Local builds are faster for iteration
- Easier to debug issues
- No dependency on EAS infrastructure
- Once local build works, EAS should work too

### Build Commands

#### PWA Build
```bash
npm run build:web
# Output: dist/
```

#### Android Local Build
```bash
# From project root
npx expo prebuild --platform android --clean
cd android
.\gradlew.bat assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### Android EAS Build (Future)
```bash
# FIRST: Try from original location
cd "C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend"
npx eas-cli build --platform android --profile preview

# ONLY IF that fails due to path issues, use workaround:
# cd C:\dev\ai-agent-frontend
# $env:EAS_NO_VCS='1'
# npx eas-cli build --platform android --profile preview
```

---

## 📁 Project Locations

### Primary Location (Original)
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend
```
- **Status**: ⚠️ Has path with spaces - causes EAS build issues
- **Git**: Main repository
- **Use for**: Development, PWA builds

### Workaround Location (No Spaces) - CURRENTLY IN USE
```
C:\dev\ai-agent-frontend
```
- **Status**: ✅ Currently being used for Android builds
- **Git**: `.git` folder renamed to `.git_bak` to avoid path resolution issues
- **Use for**: Android local builds (path length issue resolved)
- **Configuration**:
  - `android/local.properties`: Contains `sdk.dir` only
  - `android/build.gradle`: No explicit `ndkVersion` (should default to 27)
  - CMake cache directories: `.cxx` folders in `node_modules/*/android/` still reference NDK 25
- **Note**: This location resolved path length issues but NDK version problem persists

---

## 🔧 Required Fixes

### High Priority

1. **Fix Android Build from Original Location** ⭐ **DO THIS FIRST**
   - **Goal**: Make Android builds work from `C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`
   - **Approach**: 
     - Attempt local Gradle build from original location
     - If path length issues occur, try workarounds (shortened paths, etc.)
     - Only use workaround location if original location is confirmed as unfixable
   - **Status**: ⏳ Primary goal - fix original location first

2. **Verify PWA Still Works**
   - **Action**: Test PWA build and runtime after all Android build troubleshooting
   - **Command**: `npm run build:web` then test locally
   - **Status**: ⏳ Pending verification

3. **Fix NDK Version Mismatch** ⭐ **CURRENT PRIORITY**
   - **Goal**: Force build system to use NDK 27 instead of NDK 25
   - **Problem**: CMake cache persists NDK 25 configuration despite Gradle settings
   - **Approach**: 
     - Clear all CMake cache directories (`node_modules/*/android/.cxx/`)
     - Ensure `build.gradle` explicitly sets `ndkVersion = "27.1.12297006"`
     - Verify `local.properties` doesn't specify `ndk.dir`
     - May need to delete entire `.cxx` directories and rebuild
   - **Status**: 🔴 **BLOCKING** - Current primary blocker

### Medium Priority

4. **Investigate EAS Cloud Build Failures**
   - **Action**: Review build logs on Expo dashboard
   - **Check**: Build complete hook errors
   - **Status**: ⏳ Needs investigation

5. **Fix Git Repository in Workaround Location** ✅ **COMPLETED**
   - **Issue**: `C:\dev\ai-agent-frontend` git still pointed to original location
   - **Solution Applied**: 
     - Renamed `.git` to `.git_bak` in `C:\dev\ai-agent-frontend`
     - This prevents build tools from resolving paths relative to original git root
   - **Status**: ✅ Resolved - path resolution issue fixed

6. **Create Robust Build Scripts**
   - **Goal**: Single command to build both PWA and Android
   - **Requirements**:
     - Handle path issues automatically
     - Work from any location
     - Clear error messages
   - **Status**: ⏳ Future task

### Low Priority

7. **App Rename: "AI Agent" → "SanDi"**
   - **Files to update**:
     - `app.json` - name, slug
     - `package.json` - name, description
     - `README.md` - all references
     - Android package name (if needed)
     - iOS bundle identifier (if needed)
   - **Status**: ⏳ Future change

---

## 🎯 Goal: Robust Build Solution

### Requirements

After making a code change, we should be able to:

1. **Build PWA**: `npm run build:web` ✅ (Working)
2. **Build Android Locally**: `npm run build:android:local` ⏳ (Needs script)
3. **Build Android via EAS**: `npm run build:android` ⏳ (Needs fixing)

**No manual workarounds, path switching, or environment variables should be required.**

### Proposed Solution

1. **Fix git repository** in workaround location OR
2. **Move project** to a path without spaces permanently OR
3. **Create build scripts** that handle path issues automatically

**Recommendation**: Option 3 - Create robust build scripts that work regardless of location.

---

## 📝 Build Scripts to Create

### Proposed package.json Scripts

```json
{
  "scripts": {
    "build:web": "npx expo export --platform web",
    "build:android:local": "npx expo prebuild --platform android --clean && cd android && gradlew.bat assembleRelease",
    "build:android": "eas build --platform android --profile preview",
    "build:all": "npm run build:web && npm run build:android:local"
  }
}
```

**Status**: ⏳ To be implemented

---

## 🧹 Document Cleanup

### Documents to Review/Update

1. ✅ **MIGRATION_REQUIREMENTS.md** - Keep (documents SDK 54 requirements)
2. ⚠️ **DEPLOYMENT_ISSUE.md** - Review (may be outdated)
3. ⚠️ **FIX_SUMMARY.md** - Review (may be outdated)
4. ⚠️ **TROUBLESHOOTING.md** - Review (may be outdated)
5. ⚠️ **TROUBLESHOOTING_PLAN.md** - Review (may be outdated)
6. ✅ **BUILD_DOCUMENTATION.md** - This document (new)

**Action**: Review old troubleshooting docs and consolidate/remove outdated information.

---

## 🔄 Workflow After Fixes

### Ideal Development Workflow

1. **Make code changes** in original location
2. **Test PWA**: `npm run build:web` → `npm run preview:web`
3. **Test Android Locally**: `npm run build:android:local` → Install APK on device
4. **Commit changes**: `git add .` → `git commit` → `git push`
5. **Build for Distribution**: `npm run build:android` (EAS) when ready

**No manual path switching, environment variables, or workarounds needed.**

---

## 📚 Related Documentation

- [MIGRATION_REQUIREMENTS.md](./MIGRATION_REQUIREMENTS.md) - SDK 54 migration requirements
- [README.md](./README.md) - Project overview and setup
- [EAS Build Logs](https://expo.dev/accounts/sdhector21/projects/ai-agent/builds) - Cloud build history

---

## 🎯 Next Steps

### Priority Order

1. ✅ Document current state (this document) - **DONE**
2. ⭐ **Test local Android build from original location** - **DO THIS FIRST**
   - Try building from `C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`
   - Document any errors
   - Attempt to fix issues in original location
3. ⏳ Complete local Android build successfully (from original location if possible)
4. ⏳ Verify PWA still works
5. ⏳ Fix EAS cloud builds (from original location if possible)
6. ⏳ Create robust build scripts
7. ⏳ Clean up old documentation - **DONE**
8. ⏳ Rename app to "SanDi"

### Workaround Location (Only if needed)

- ⚠️ **ONLY** if original location is confirmed as unfixable:
  - Fix git repository in `C:\dev\ai-agent-frontend`
  - Use workaround location for builds

---

## 📝 Recent Build Attempts (November 18, 2025)

### Attempt 1: Original Location
- **Location**: `C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`
- **Result**: Path length warnings (250+ character paths)
- **Action**: Moved to workaround location

### Attempt 2: Workaround Location with Subst
- **Location**: `C:\dev\ai-agent-frontend` (mapped to B:)
- **Result**: Failed - `settings.gradle` couldn't resolve paths from subst drive
- **Action**: Abandoned subst approach

### Attempt 3: Workaround Location (Direct)
- **Location**: `C:\dev\ai-agent-frontend`
- **Actions Taken**:
  1. Renamed `.git` to `.git_bak` to avoid path resolution
  2. Created `android/local.properties` with SDK path
  3. Ran `npx expo prebuild --platform android --clean`
  4. Attempted `.\gradlew.bat assembleRelease`
- **Result**: 
  - ✅ Path length issues resolved
  - ❌ NDK version mismatch discovered
  - Build fails with C++20 compilation errors (NDK 25 doesn't support C++20)

### Attempt 4: Force NDK 25
- **Action**: Set `ndkVersion = "25.1.8937393"` in `build.gradle`
- **Result**: Confirmed C++20 errors - NDK 25 incompatible with React Native 0.81.5

### Attempt 5: Force NDK 27
- **Action**: Set `ndkVersion = "27.1.12297006"` in `build.gradle`, removed `ndk.dir` from `local.properties`
- **Result**: CMake still uses NDK 25 from cache (paths in error logs show `ndk\251~1.893\`)

### Current Blocker (As of Nov 18)
- **Issue**: CMake cache in `node_modules/*/android/.cxx/` directories persists NDK 25 configuration
- **Next Steps Needed**: 
  - Delete all `.cxx` directories in `node_modules`
  - Ensure `build.gradle` explicitly sets NDK 27
  - Rebuild from scratch

---

## 🧪 Follow-up Build Attempts (November 19, 2025)

### Attempt 6: Original Repo (NDK 27 + Cache Purge)
- **Location**: `C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`
- **Actions**:
  1. Added `ndkVersion "27.1.12297006"` to `android/app/build.gradle`.
  2. Deleted every `node_modules/**/.cxx` directory and reran `npx expo prebuild --platform android`.
  3. Ran `./gradlew.bat clean assembleRelease`.
- **Result**:
  - ✅ Toolchain now picks up NDK 27 (CMake logs show `ndk\27.1.12297006` paths).
  - ❌ Build still fails, but only due to Ninja `CMAKE_OBJECT_PATH_MAX` warnings when generating `react-native-worklets` objects inside the deep path with spaces.

### Attempt 7: Short-Path Mirror (`C:\dev\ai-agent-frontend`)
- **Actions**:
  1. Mirrored the repo via `robocopy` (excluding `.git`) into `C:\dev\ai-agent-frontend`.
  2. Regenerated native code with `npx expo prebuild --platform android`.
  3. Ran `./gradlew.bat clean assembleRelease`.
- **Result**:
  - ✅ Path-length warnings from Windows (250 char limit) are gone.
  - ❌ NDK 27 is honored, but the `.cxx/RelWithDebInfo/.../CMakeFiles/*.dir` staging folders for `react-native-screens` and `react-native-worklets` still exceed Ninja’s internal object-path limit.

### Attempt 8: Force Shorter CMake Object Paths
- **Actions**:
  1. Injected `CMAKE_OBJECT_PATH_MAX 128` into `node_modules/react-native-screens/android/CMakeLists.txt` and `node_modules/react-native-worklets/android/CMakeLists.txt`.
  2. Captured the tweaks via `patches/react-native-screens+4.16.0.patch` and `patches/react-native-worklets+0.5.1.patch` so they reapply after installs.
  3. Removed all `.cxx` folders again, reran `expo prebuild`, and reattempted `./gradlew.bat clean assembleRelease` from both repo locations.
- **Result**:
  - ⚠️ CMake now warns the directories exceed the new 128-character ceiling (rather than 250), proving the clamp works.
  - ❌ Ninja still aborts because even 128 characters isn’t short enough once the repo path includes `C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend`.

### Updated Blocker
- **Issue**: `react-native-worklets` (and, to a lesser degree, `react-native-screens`) generate extremely long intermediate object paths under `.cxx/.../CMakeFiles`. Even with NDK 27 and `CMAKE_OBJECT_PATH_MAX` set to 128, Ninja refuses to build when the root path contains spaces and ~100 characters before `node_modules`.
- **Observations**:
  - The failure now occurs regardless of repo location, but the original path hits the limit sooner due to spaces (`Hector's PC`) and nested directories.
  - Removing `react-native-worklets` is not currently an option—it's listed in `package.json`. If it is unused, uninstalling it would sidestep these native builds entirely.
- **Potential Next Steps**:
  1. Move the *git-tracked* repo to a truly short path (e.g., `C:\src\ai`). Running Gradle from such a path should keep `.cxx/.../CMakeFiles` under 128 chars.
  2. Override `android.externalNativeBuild.cmake.buildStagingDirectory` or `android.ndkPath` to point at a short custom directory (e.g., `C:\android\.cxx`) so the generated object directories shrink.
  3. Evaluate whether `react-native-worklets` can be removed or replaced—disabling it removes the deepest native tree.

---


---

**Last Updated**: November 19, 2025  
**Next Review**: After CMake/Ninja path length issue is resolved

