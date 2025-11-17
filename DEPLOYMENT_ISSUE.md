# Frontend Deployment Issue - Observable Problem Report

## Overview

The frontend application deploys successfully to Firebase Hosting, but fails to load in production. The application works correctly in local development environments but encounters a JavaScript error when accessed via the deployed URL.

## Problem Statement

**Status**: Frontend is not loading after successful deployment to Firebase Hosting

**Deployment Target**: Firebase Hosting (via Google Cloud Build)
**Deployment URL**: https://ai-agent-frontend-462321.web.app
**Local Status**: Works correctly when run locally
**Production Status**: Fails to load with JavaScript error

## Latest Investigation (2025-11-17)

### Manual redeploy via Firebase CLI
- Command: `firebase deploy --only hosting:ai-agent-frontend-462321 --project professional-website-462321 --message "Manual deploy from Cursor"`
- Result: Deployment succeeded, Firebase CLI uploaded the freshly built `dist/` artifacts (CLI reported 12 files because `_expo/static/...` entries are bundled inside hashed directories). New release is live at `https://ai-agent-frontend-462321.web.app`.

### Cloud Build status
- `gcloud builds list --project professional-website-462321 --limit=5` shows:
  - `283b25c8-798d-4f5b-8727-2de28da71997` (2025-11-17 23:10 UTC, commit `6252c4c` “fix: remove expo-status-bar from web layout...”) – **SUCCESS**
  - `a00674f8-0e57-40ba-921f-b11072fc66cd` (2025-11-17 22:56 UTC, commit `5761361`) – **SUCCESS**
  - `eb4a6faf-8fe9-4156-b560-5f82f30f854c` (2025-11-17 22:50 UTC, commit `ed064ca`) – **SUCCESS**
  - `c2ed2ffd-f26c-4c05-9ca9-cbd6f584308c` (2025-11-17 22:47 UTC) – **FAILURE**
  - `944b6987-0069-4473-be40-264df547b80a` (2025-11-17 22:35 UTC) – **FAILURE**
- `gcloud builds log 283b25c8-...` confirms the build used the hard-coded production `EXPO_PUBLIC_API_URL`, verified `index.html`, JS bundles, and deployed via Firebase CLI with no warnings other than the missing `_sitemap.html` notice.

### Cloud Run backend health
- `gcloud run services logs read ai-agent-backend --region us-central1 --project professional-website-462321 --limit 50` shows:
  - Secrets loading successfully from Secret Manager (30 loaded, 0 skipped, 2 intentionally absent).
  - Database connection established against Neon (`ep-wild-flower-adjqruyd...`).
  - Server initialization completed in ~3.3s and CORS explicitly allows the Firebase Hosting origins.
  - Later log entries capture graceful shutdown at 22:52 UTC with clean DB disconnection, indicating no crash loops.

### Post-deploy browser verification
- Opened `https://ai-agent-frontend-462321.web.app` in the Cursor browser after the manual deploy.
- Browser console still logs the blocking error:
  ```
  Error: Module implementation must be a class
      at e.registerWebModule (/_expo/static/js/web/entry-cad9a668f81563b7cd4ccb78c76aede9.js:637:177)
      at /_expo/static/js/web/entry-cad9a668f81563b7cd4ccb78c76aede9.js:763:1790
      ...
  ```
- The UI remains stuck on the white loading screen that renders `<LoadingScreen message="Loading AI Agent..." />`, so the redeploy did not resolve the runtime crash.

### Fix Attempt 2 – Patch Expo `registerWebModule` fallback (2025-11-17, 23:40 UTC)

- Hypothesis: Expo’s `registerWebModule` expects every module implementation to provide a class name, but minification can strip the name even though Expo still passes a fallback string (e.g., `'ExpoFontUtils'`). When `.name` is empty, the helper throws before React mounts.
- Changes implemented:
  1. Added `patch-package` to devDependencies and hooked it into `postinstall`.
  2. Patched `node_modules/expo-modules-core/src/registerWebModule.ts` so the helper accepts an optional second argument (`moduleIdentifier`) and falls back to it when `moduleImplementation.name` is falsy. Updated the `.d.ts` and generated `patches/expo-modules-core+2.2.3.patch` to keep CI/builds consistent.
  3. Rebuilt (`npm run build:web`) and redeployed with `firebase deploy --only hosting:ai-agent-frontend-462321 --project professional-website-462321 --message "Patched registerWebModule fallback"`.

- Results:
  - Fetching `https://ai-agent-frontend-462321.web.app/index.html` now references `_expo/static/js/web/entry-f70dc80f0ba7c75fd17f87697b9fb080.js`.
  - Loading `https://ai-agent-frontend-462321.web.app/?flush=1` (to bypass any cached HTML) renders the Google-login screen and the console shows normal logs—no `registerWebModule` exception.
  - Existing clients that still see the blank page should **hard refresh or append a cache-busting query parameter** because their service worker may serve the older HTML that references `entry-cad9...`. Increasing `CACHE_NAME` in `public/service-worker.js` on the next change will force a cache refresh.
  - Noted new console warnings about vector-icon fonts failing OTS validation; these do not block rendering but should be tracked separately.

- Screenshot evidence (2025-11-17 23:42 UTC):
  - Login screen loads with PWA install prompt logs; captured via the Cursor testing browser (attached in investigation notes).

## Observable Symptoms

### 1. Deployment Status
- ✅ Cloud Build completes successfully
- ✅ All static files are generated in `dist/` directory
- ✅ Firebase Hosting deployment succeeds
- ✅ All assets are accessible via HTTP (no 404 errors)

### 2. Runtime Behavior
- ✅ HTML loads successfully (`index.html`)
- ✅ CSS loads successfully (`web-[hash].css`)
- ✅ JavaScript bundle loads successfully (`entry-[hash].js`)
- ✅ Manifest and icons load successfully
- ❌ Application does not render beyond initial loading screen
- ❌ JavaScript error appears in browser console
- ❌ React application never mounts

### 3. Browser Console Error

**Error Message**:
```
Error: Module implementation must be a class
    at e.registerWebModule (entry-[hash].js:637:177)
    at entry-[hash].js:763:1790
    ...
```

**Error Details**:
- Occurs in bundled JavaScript file: `_expo/static/js/web/entry-[hash].js`
- Function: `registerWebModule`
- Line: Approximately 637 (varies with build)
- Timing: During JavaScript execution, before React initialization
- Frequency: Consistent - occurs every time the page loads

### 4. Visual Behavior

**Initial State**:
- Loading screen appears: "Loading AI Agent..."
- Loading spinner visible

**After Load**:
- Loading screen remains visible indefinitely
- No content renders beyond initial HTML loading state
- Application appears "frozen" in loading state

### 5. Network Requests

All network requests succeed:
- ✅ `GET /` → 200 OK (HTML)
- ✅ `GET /_expo/static/css/web-[hash].css` → 200 OK
- ✅ `GET /_expo/static/js/web/entry-[hash].js` → 200 OK
- ✅ `GET /manifest.webmanifest` → 200 OK
- ✅ `GET /icon-192.png` → 200 OK

No failed requests or network errors observed.

## Technical Stack

- **Framework**: Expo Router (~52.0.0) with React Native
- **Platform**: Web (PWA deployment)
- **Build Command**: `npx expo export --platform web --output-dir dist --clear --max-workers 4`
- **Build Configuration**: `app.json` with `web.output: "single"` and `web.bundler: "metro"`
- **Deployment**: Firebase Hosting via Cloud Build CI/CD

## Observed Symptoms

### Browser Console Error

When accessing the deployed application, the browser console shows:

```
Error: Module implementation must be a class
    at e.registerWebModule (entry-[hash].js:637:177)
    at entry-[hash].js:763:1790
    ...
```

This error occurs during module registration in Expo's module system and prevents the React application from initializing.

### Network Requests

All static assets load successfully:
- ✅ HTML file (`index.html`) - loads correctly
- ✅ CSS file (`web-[hash].css`) - loads correctly
- ✅ JavaScript bundle (`entry-[hash].js`) - loads correctly
- ✅ Manifest and icons - load correctly

However, JavaScript execution fails during module registration, preventing the app from rendering.

### Visual Behavior

- Initial loading screen appears ("Loading AI Agent...")
- Loading screen remains visible indefinitely
- React application never mounts
- No content renders beyond the initial HTML loading state

## Technical Context

### Build Configuration

**Expo Router Static Export**:
- Uses Metro bundler to create static web output
- Command: `npx expo export --platform web --output-dir dist --clear --max-workers 4`
- Configuration: `app.json` with `web.output: "single"` and `web.bundler: "metro"`

**Deployment Pipeline**:
1. Cloud Build triggers on git push to master
2. Dependencies installed with `npm install --legacy-peer-deps`
3. Production build with `expo export --platform web`
4. Files deployed to Firebase Hosting from `dist/` directory

### Error Analysis

**Error Location**:
- File: `_expo/static/js/web/entry-[hash].js`
- Function: `e.registerWebModule`
- This is part of Expo's module registration system
- Error occurs during JavaScript execution, before React mounts

**Possible Interpretations**:
1. A module being registered doesn't match Expo's expected format (not a class)
2. Module registration system encounters an incompatible module during static export
3. There may be a mismatch between build-time and runtime module expectations
4. Could be related to how Expo Router handles module registration in static exports

**Important Note**: The exact cause is unknown. The error indicates a module registration failure, but the specific module or reason is not identified in the error message.

## Environment Comparison

### Local Development (Working)

**Configuration**:
- Command: `expo start --web` or `expo start --web --clear`
- Uses Expo development server
- Metro bundler runs in development mode
- Hot reloading enabled
- Dynamic module loading

**Behavior**:
- Application loads successfully
- React mounts and renders correctly
- All functionality works as expected
- No console errors
- No module registration issues observed

### Production Build (Failing)

**Configuration**:
- Command: `expo export --platform web --output-dir dist`
- Static export mode
- Production optimizations enabled
- All code bundled into static files
- No development server

**Behavior**:
- Application does not load
- React never mounts
- Module registration error occurs
- Application stuck in loading state

**Key Difference**: The primary difference is static export vs development server, which changes how modules are loaded and registered.

## Additional Context

### Build Configuration

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "single"
    }
  }
}
```

The `output: "single"` configuration creates a single-page application with all routes bundled into one output. This configuration may interact differently with module registration compared to other export modes.

### Expo Router Version

Using Expo Router ~4.0.0 with Expo SDK ~52.0.0. Different versions may handle module registration differently.

### Dependencies

The application uses several Expo packages. Relevant packages include:
- `expo-router` (~4.0.0)
- `expo-font` (^14.0.9)
- `expo-status-bar` (^2.0.0)
- `expo-splash-screen` (^31.0.10)
- `@expo/vector-icons` (^14.0.0)
- `expo` (~52.0.0)
- Other React Native/Expo dependencies

**Note**: It is unknown which, if any, of these packages are causing the issue. All are compatible with web in development mode, but static export compatibility may vary.

## Expected vs Actual Behavior

### Expected

- Application loads successfully after deployment
- React application mounts and renders
- User can interact with the application
- No console errors

### Actual

- Application deploys successfully
- Static files are served correctly
- JavaScript bundle loads
- Module registration error prevents app initialization
- Application remains in loading state indefinitely
- Console shows module registration error

## Impact

- **User Experience**: Complete failure - application is unusable
- **Deployment**: Build succeeds, but deployment is non-functional
- **Development**: Blocks production deployment despite working locally

## Diagnostic Information

### Build Logs

- Cloud Build completes successfully
- No build-time errors reported
- All verification steps pass (index.html exists, JavaScript files found, etc.)

### Browser Environment

- Error occurs in modern browsers (Chrome, Firefox, etc.)
- Error is consistent across browsers
- Error occurs immediately on page load
- No network failures or CORS issues

### Error Location

The error originates from:
- File: `_expo/static/js/web/entry-[hash].js`
- Function: `registerWebModule`
- Line: ~637 (may vary with build)
- Timing: During module initialization, before React mount

## Investigation Areas

### Unknown Factors

1. **Which module(s) are failing?**
   - The error doesn't specify which module is causing the issue
   - Could be any imported Expo module
   - Could be a combination of modules
   - Could be an internal Expo Router module

2. **Why does it work locally but not in production?**
   - Development mode vs static export differences
   - Module loading mechanisms differ
   - Build-time vs runtime module registration

3. **Is this configuration-specific?**
   - `output: "single"` configuration
   - Metro bundler settings
   - Expo Router version compatibility
   - Expo SDK version compatibility

4. **Are there known issues?**
   - Expo Router static export limitations
   - Module registration in static builds
   - Compatibility with specific Expo modules

### Investigation Approach

To identify the root cause, consider:
1. Analyzing the bundled JavaScript to identify which module is failing registration
2. Testing with minimal module imports to isolate the problematic module(s)
3. Reviewing Expo Router and Expo SDK documentation for static export limitations
4. Checking for known issues in Expo Router static export compatibility
5. Comparing working local builds with failing production builds
6. Reviewing Metro bundler configuration for web static exports

## Next Steps for Investigation

1. Identify the exact module(s) causing the registration error
2. Check Expo Router documentation for static export module compatibility
3. Review Expo module web support documentation
4. Consider module exclusion strategies for web builds
5. Investigate Metro bundler configuration for web static exports
6. Review Expo Router static export known issues and limitations

## Relevant Files

- `app/_layout.tsx` - Root layout component (entry point)
- `app.json` - Expo configuration including web settings
- `metro.config.js` - Metro bundler configuration
- `package.json` - Dependencies including all Expo packages
- `cloudbuild.yaml` - Cloud Build configuration for deployment
- `firebase.json` - Firebase Hosting configuration

## Summary

### What We Know

1. ✅ Build succeeds - all static files generated correctly
2. ✅ Deployment succeeds - files deployed to Firebase Hosting
3. ✅ Assets load - all HTTP requests succeed
4. ❌ Application fails to initialize - stuck in loading state
5. ❌ JavaScript error: "Module implementation must be a class"
6. ❌ Error occurs in Expo's module registration system
7. ✅ Local development works correctly

### What We Don't Know

1. ❓ Which specific module is causing the registration failure
2. ❓ Why the error only occurs in production static export
3. ❓ If this is a configuration issue, module compatibility issue, or Expo Router limitation
4. ❓ The exact mechanism causing the module registration to fail

### Next Steps

The issue requires investigation to:
1. Identify the specific module causing the registration error
2. Determine why it fails in static export but works in development
3. Find a solution that maintains functionality while allowing successful static export

The error message suggests a module registration issue, but the root cause and solution need to be determined through investigation.

