# Android APK Build - Lessons Learned & Best Practices

**Date**: November 19, 2025
**Status**: Build in progress - awaiting verification
**Document Purpose**: Capture learnings to avoid repeating this painful process

---

## Executive Summary

Building an Android APK from this React Native/Expo codebase taught us critical lessons about dependency management, path handling on Windows, and build system configuration. The primary issue wasn't code quality—it was **accumulated technical debt in unused dependencies and misconfigured native build paths**.

**Key Insight**: One unused package (`react-native-worklets`) added 500+ characters to CMake paths, exceeding Windows limits and blocking the entire build.

---

## 🚨 Problems Encountered

### Problem 1: Unused Dependencies in the Build Chain
**What Happened**: `react-native-worklets@0.5.1` was in package.json but completely unused in the codebase.

**Why It Was A Problem**:
- Expo's auto-linking system automatically registers ALL native modules
- Worklets compiled deep C++ code with extremely long intermediate paths
- These paths combined with Windows' 250-char limit = build failure
- Removing it freed ~500 characters from CMake paths

**Root Cause**: No audit process for unused dependencies during migration. Package was likely added for future features but never implemented.

**Prevention**:
```bash
# Regular audit for unused packages
npm ls  # shows dependency tree
npm audit  # checks for vulnerabilities
npx depcheck  # identifies unused dependencies
```

---

### Problem 2: Babel Plugin Auto-Detection Issues
**What Happened**: After removing react-native-worklets from package.json, the build still failed because:
1. `node_modules/expo/bundledNativeModules.json` still referenced it
2. babel-preset-expo auto-detects plugins from this file
3. Build tried to load a plugin that no longer existed

**Why It Was A Problem**:
- Hidden configuration file (in node_modules, not version controlled)
- Auto-detection magic made it hard to diagnose
- Complete cache clear required to fully resolve

**Prevention**: Version-control a copy of critical configs:
```bash
# In your project root, document Expo's bundled modules:
cp node_modules/expo/bundledNativeModules.json ./config/expo-modules-baseline.json

# Add to .gitignore exception:
# config/expo-modules-baseline.json
```

---

### Problem 3: Windows Path Length Limitations
**What Happened**: Even with worklets removed, paths like:
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\node_modules\react-native-screens\android\.cxx\RelWithDebInfo\...
```
exceeded 250 characters, blocking Ninja build.

**Why It Was A Problem**:
- Windows has historical 260-char MAX_PATH limit
- Node.js and build tools deeply nest modules
- Creating 100+ character paths for each package adds up fast
- Long paths with spaces make it worse (each space-containing component takes extra characters)

**Prevention**:
1. **Project Location**: Place projects at root-level short paths
   - ✅ Good: `C:\dev\myapp` (14 chars)
   - ❌ Bad: `C:\Users\[Name]\Documents\Github\[Org]\[Project]\[App]` (100+ chars)

2. **Enable Long Paths** (Already done, but document it):
   ```powershell
   # Run as Administrator once per machine
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
     -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

3. **Configure Custom CMake Staging Directory** (Already done in build.gradle):
   ```gradle
   externalNativeBuild {
       cmake {
           buildStagingDirectory = "C:/android-builds/.cxx"  // Short path!
       }
   }
   ```

---

### Problem 4: CMake Object Path Limits
**What Happened**: Even with Windows long paths enabled, Ninja complained about CMake object file paths exceeding limits.

**Why It Was A Problem**:
- Ninja (Android's build system) has internal path length limits separate from Windows
- Individual object files get crazy-long paths like: `CMakeFiles/module.dir/subdirectory/nested/cpp/file.cpp.o`
- The patch we applied set `CMAKE_OBJECT_PATH_MAX` to force shorter paths

**Prevention**: Add to ALL native CMakeLists.txt files early:
```cmake
cmake_minimum_required(VERSION 3.16)

# Windows-specific path handling
if(WIN32)
    if(NOT DEFINED CMAKE_OBJECT_PATH_MAX OR CMAKE_OBJECT_PATH_MAX GREATER 128)
        set(CMAKE_OBJECT_PATH_MAX 128)
    endif()
endif()

project(MyNativeModule)
```

---

## 📋 Design Decisions to Avoid This Pain

### 1. **Dependency Minimalism**
**Decision**: Only add packages with active implementation, never "just in case"

**Implementation**:
```json
{
  "name": "ai-agent-frontend",
  "scripts": {
    "audit:unused": "npx depcheck --ignores=expo,@expo/*",
    "pre-release": "npm run audit:unused && npm audit"
  }
}
```

**Rationale**: Each dependency adds to:
- Bundle size
- Build time
- Attack surface
- Path complexity (especially on Windows)

---

### 2. **Native Module Auditing**
**Decision**: Maintain an inventory of what auto-links to native

**Implementation**: Create `android/NATIVE_MODULES.md`:
```markdown
# Auto-Linked Native Modules (from expo)

## In Use:
- react-native-screens (navigation)
- @react-native-async-storage/async-storage (data)
- expo-modules-core (Expo foundation)

## Verified Unused:
- ~~react-native-worklets~~ (REMOVED Nov 19)

## Monitoring:
- Run: `npx expo prebuild --dry-run` before each major version bump
- Check: Generated android/settings.gradle to see what's being linked
```

---

### 3. **Build Path Configuration**
**Decision**: Enforce short project paths from day one

**Implementation**: Add to README.md:
```markdown
## ⚠️ Installation Path Requirements (Windows)

**CRITICAL**: Windows has path length limits. Install at a SHORT path:

✅ Good:
- C:\dev\ai-agent
- C:\projects\ai-agent
- D:\work\ai-agent

❌ Bad (will cause build failures):
- C:\Users\[Name]\Documents\Github\[Org]\[Projects]\[App]...
- Anything nested more than 3-4 levels deep

If you're already in a deep path:
1. Move project to shallow path
2. Enable Windows long paths (see ANDROID_BUILD_ISSUES.md)
3. Configure custom CMake staging directory
```

---

### 4. **CMakeLists.txt Standard Template**
**Decision**: All native modules get Windows-aware CMake config

**Implementation**: Create `cmake-template/CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.16)

# Platform-specific optimizations
if(WIN32)
    # Windows 10+ supports long paths - but Ninja still has limits
    if(NOT DEFINED CMAKE_OBJECT_PATH_MAX OR CMAKE_OBJECT_PATH_MAX GREATER 128)
        set(CMAKE_OBJECT_PATH_MAX 128)
    endif()

    # Use forward slashes for CMake
    string(REPLACE "\\" "/" CMAKE_SOURCE_DIR_NORMALIZED "${CMAKE_SOURCE_DIR}")
endif()

project(${MODULE_NAME})

# Rest of your config...
```

**Apply to**: All native modules when created

---

### 5. **Patch Management**
**Decision**: Document WHY patches exist

**Implementation**: Add comments in patches and create `patches/README.md`:
```markdown
# Patches Applied by patch-package

## react-native-screens+4.16.0.patch
**Why**: Windows CMake path length limit workaround
**What**: Adds CMAKE_OBJECT_PATH_MAX 128 to CMakeLists.txt
**Needed**: Yes (required for Windows builds)
**Can remove if**: Paths shortened or long paths fully working

## expo-modules-core+3.0.26.patch
**Why**: Same as above
**Needed**: Yes
**Can remove if**: Same as above

Last updated: Nov 19, 2025
```

---

## 📁 Build Artifacts Location

### APK Output Location
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\android\app\build\outputs\apk\release\app-release.apk
```

### Gradle Build Cache (can delete to force clean rebuild)
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\android\app\build\
```

### Metro Bundler Cache (JavaScript)
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\.metro-cache
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\.cache
```

### Native Build Cache (CMake/Ninja)
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\node_modules/**/.cxx
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\node_modules/**/build/
```

### PWA Build Output
```
C:\Users\Hector's PC\Documents\Github\01-websites\applications\ai-agent\ai-agent-frontend\dist\
```

---

## 🔧 Build Scripts for package.json

**Add these to your package.json** to make builds easier:

```json
{
  "scripts": {
    "build:web": "npx expo export --platform web",
    "build:web:production": "npx expo export --platform web --minify",
    "build:android:local": "npx expo prebuild --platform android --clean && cd android && ./gradlew assembleRelease",
    "build:android:eas": "npx eas-cli build --platform android --profile production",
    "build:android:preview": "npx eas-cli build --platform android --profile preview",
    "clean:cache": "rm -rf .metro-cache .cache .expo && npm cache clean --force",
    "clean:android": "rm -rf android/build android/app/build node_modules/**/.cxx node_modules/**/build && npm install",
    "prebuild:check": "npx expo prebuild --platform android --clean --dry-run"
  }
}
```

---

## 🚀 Future Improvements to Implement

### Short-Term (Next Release)
- [ ] Add `npm run audit:unused` to CI/CD
- [ ] Add Windows path check to build script
- [ ] Document in README where APK is located
- [ ] Create `android/NATIVE_MODULES.md` inventory

### Medium-Term (Next Quarter)
- [ ] Consider moving to EAS-only builds (avoids all local path issues)
- [ ] Evaluate replacing react-native-screens if possible
- [ ] Set up GitHub Actions to build APK automatically
- [ ] Cache gradle/node_modules between CI runs to speed builds

### Long-Term (Next Year)
- [ ] Evaluate Expo Router alternatives that don't require screens
- [ ] Monitor React Native releases for dependency simplification
- [ ] Consider monorepo structure for better path management
- [ ] Implement automated dependency health checks

---

## 🎓 Key Learnings

### 1. Read the Error Messages Carefully
We spent time on path length "dirty manifest" errors when the real issue was Babel plugins. Reading full stack traces helped.

### 2. Use `--dry-run` Before Real Builds
```bash
npx expo prebuild --platform android --clean --dry-run
```
This shows what WILL be auto-linked without actually building. Would have caught the worklets issue immediately.

### 3. Separate Concerns: Bundle vs Native
- JS bundling issues (Babel, Metro) are separate from native build issues (CMake, Ninja)
- Clean each layer independently when debugging

### 4. Document "Why" Not Just "What"
The patches had comments about WHAT they did, but not WHY. Future developers (including yourself in 6 months) will benefit from knowing WHY something exists.

### 5. Windows Has Different Rules
Mac developers often don't hit these path issues. Windows path limits are a real constraint. Every Windows build needs consideration.

---

## ✅ Verification Checklist

**Once the APK build completes, verify:**

- [ ] APK file exists at `android/app/build/outputs/apk/release/app-release.apk`
- [ ] APK file size is reasonable (< 50MB for app-only)
- [ ] PWA build still works: `npm run build:web`
- [ ] Install APK on device/emulator
- [ ] App launches without crashes
- [ ] Navigation works
- [ ] API calls to backend work
- [ ] All core features functional

**If build fails**, check:
1. Full build output (see background build process)
2. Look for first ERROR in the output
3. Check if it's one of the known issues above
4. If new error, document it in this file

---

## 📞 Support & Troubleshooting

### Common Errors & Fixes

**Error**: `Cannot find module 'react-native-worklets/plugin'`
- **Cause**: bundledNativeModules.json still references old package
- **Fix**: Remove line from `node_modules/expo/bundledNativeModules.json`

**Error**: `ninja: error: manifest 'build.ninja' still dirty after 100 tries`
- **Cause**: Path length limit exceeded
- **Fix**:
  1. Enable Windows long paths (registry change)
  2. Add CMAKE_OBJECT_PATH_MAX to CMakeLists.txt
  3. Move project to shorter path

**Error**: `Could not read '[...].bin': While parsing a protocol message...`
- **Cause**: Corrupted CMake cache
- **Fix**: `npm run clean:android` (clean build)

---

## 📚 References

- [React Native Windows Build Docs](https://reactnative.dev/docs/windows-build-setup)
- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [CMake Documentation](https://cmake.org/)
- [Gradle Build System](https://gradle.org/)
- [Windows Long Paths Issue](https://stackoverflow.com/questions/57349017/)

---

**Last Updated**: November 19, 2025
**Next Review**: After first successful APK deployment
**Assigned To**: Development Team

---

## 🎯 TL;DR - The Essentials

1. **Keep dependencies minimal** - audit unused packages regularly
2. **Install in short paths** - Windows path limits are real
3. **Enable long paths globally** - Set registry key once per machine
4. **Configure CMake properly** - Add CMAKE_OBJECT_PATH_MAX to all native modules
5. **Document native modules** - Maintain inventory of auto-linked packages
6. **Use --dry-run first** - Check what will be built before actual build
7. **Keep patches documented** - Explain WHY patches exist, not just WHAT they do
