# Frontend Deployment Troubleshooting Plan

## Summary

The frontend works locally but doesn't load when deployed to Firebase Hosting (deployed via Cloud Build). This document outlines a comprehensive troubleshooting plan.

## Current Setup

- **Framework**: Expo Router (React Native) with web support
- **Build Tool**: Expo export with Metro bundler
- **Build Command**: `npx expo export --platform web --output-dir dist`
- **Deployment**: Firebase Hosting (via Cloud Build)
- **Configuration**: `app.json` with `output: "single"` for web

## Potential Issues Identified

### 1. Expo Router Static Export Configuration ⚠️

**Issue**: Expo Router with `output: "single"` might not export correctly for static hosting.

**Evidence**:
- `app.json` has `"output": "single"` 
- `"extra.router.origin": false` might cause path issues
- Expo Router may need explicit base URL configuration

**Solution**: 
- Test if removing `output: "single"` helps (uses default export)
- Add explicit base path if needed
- Verify asset paths in built `index.html`

### 2. Firebase Hosting Rewrite Rules ✅

**Status**: **FIXED** - Rewrite rules are correct. The `**` catch-all works correctly - Firebase only applies rewrites when no file matches.

### 3. Environment Variables ✅

**Status**: **VERIFIED** - Environment variables are set correctly in `cloudbuild.yaml`:
- `EXPO_PUBLIC_API_URL` is set during build
- Variables are prefixed with `EXPO_PUBLIC_` (required for client-side)
- Build logs verify variables are set

### 4. Build Output Verification ✅

**Status**: **ADDED** - Added build verification steps in `cloudbuild.yaml`:
- Checks for `dist/index.html`
- Verifies JavaScript files exist
- Checks for Expo Router sitemap

### 5. Asset Path Resolution ⚠️

**Potential Issue**: Assets might use absolute paths that don't resolve correctly on Firebase Hosting.

**Solution**: 
- Run diagnostic script to check asset paths
- Verify all assets load in browser Network tab
- Check if paths are relative vs absolute

## Diagnostic Tools Created

### 1. `scripts/diagnose-build.js`
Analyzes build output and checks for common issues:
- Verifies critical files exist
- Checks asset paths in HTML
- Validates Expo Router structure

**Usage**:
```bash
cd ai-agent-frontend
npm run build:web
node scripts/diagnose-build.js
```

### 2. `scripts/test-build-local.sh`
Tests production build locally:
- Sets production environment variables
- Builds with same config as production
- Serves locally for comparison

**Usage**:
```bash
cd ai-agent-frontend
bash scripts/test-build-local.sh
```

### 3. `scripts/check-firebase-logs.sh`
Helps check Firebase Hosting deployment status.

**Usage**:
```bash
cd ai-agent-frontend
bash scripts/check-firebase-logs.sh
```

## Step-by-Step Troubleshooting Process

### Step 1: Run Diagnostic Script ✅

```bash
cd ai-agent-frontend
npm run build:web
node scripts/diagnose-build.js
```

**What to look for**:
- ✅ All critical files exist
- ✅ Asset paths are correct
- ✅ JavaScript bundle exists
- ✅ CSS files exist

### Step 2: Test Build Locally ✅

```bash
cd ai-agent-frontend
bash scripts/test-build-local.sh
```

**What to check**:
- Does the local build work?
- Compare with production behavior
- Check browser console for errors

### Step 3: Check Browser Console in Production

**In production (https://ai-agent-frontend-462321.web.app)**:

1. Open DevTools (F12)
2. **Console Tab**: Check for JavaScript errors
   - Missing files (404)
   - Syntax errors
   - Network errors
3. **Network Tab**: Check for failed requests
   - Red entries (failed)
   - 404 errors
   - CORS errors
4. **Sources Tab**: Verify JavaScript files load

**Common errors to look for**:
- `Failed to load resource: 404` - Missing files
- `CORS error` - Backend CORS configuration
- `Cannot read property 'X' of undefined` - JavaScript errors
- `Failed to execute 'replaceState'` - Routing errors

### Step 4: Verify Build Output Structure

**Check the built `dist/index.html`**:
1. Open `dist/index.html` in a text editor
2. Look for script tags - verify paths are correct
3. Look for link tags (CSS) - verify paths exist
4. Check for root div (`<div id="root">` or `<div id="__root">`)

**Expected structure**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- CSS links -->
  <link rel="stylesheet" href="./path/to/css" />
</head>
<body>
  <div id="root"></div>
  <!-- Script tags -->
  <script src="./path/to/js"></script>
</body>
</html>
```

### Step 5: Check Firebase Hosting Logs

**Via Firebase Console**:
1. Go to https://console.firebase.google.com
2. Select project: `professional-website-462321`
3. Go to **Hosting** section
4. Check **Deployments** for recent builds
5. View deployment logs for errors

**Via CLI**:
```bash
bash scripts/check-firebase-logs.sh
```

### Step 6: Compare Local vs Production

**If local build works but production doesn't**:

1. **Check environment variables**:
   - Local: Check what API URL is used
   - Production: Verify API URL in browser console
   - Compare - should both use production backend URL

2. **Check asset paths**:
   - Local: Check Network tab for asset requests
   - Production: Check Network tab for asset requests
   - Compare paths - should be same structure

3. **Check service worker**:
   - Local: Check if service worker is registered
   - Production: Check if service worker is registered
   - Try unregistering service worker in production

## Common Issues and Solutions

### Issue: White Screen / Blank Page

**Possible causes**:
1. JavaScript bundle not loading (404)
2. JavaScript error preventing render
3. Missing root div in HTML
4. Environment variables not set

**Solution**:
1. Check browser console for errors
2. Verify JavaScript files load in Network tab
3. Check if React is mounting correctly
4. Verify API URL is set correctly

### Issue: 404 Errors for Assets

**Possible causes**:
1. Wrong base path in build
2. Assets not copied to dist/
3. Expo export not working correctly

**Solution**:
1. Run diagnostic script
2. Check asset paths in `index.html`
3. Verify assets exist in `dist/` directory
4. Try rebuilding with `--clear` flag

### Issue: CORS Errors

**Possible causes**:
1. Backend not configured for Firebase Hosting origin
2. Missing credentials in API requests

**Solution**:
1. Verify backend CORS configuration
2. Check if frontend origin is allowed
3. Verify `credentials: 'include'` in API requests

### Issue: Environment Variables Not Working

**Possible causes**:
1. Variables not set during build
2. Missing `EXPO_PUBLIC_` prefix
3. Variables not accessible at build time

**Solution**:
1. Verify variables in `cloudbuild.yaml`
2. Check build logs for variable values
3. Ensure `EXPO_PUBLIC_` prefix for client-side vars

## Next Steps

1. ✅ **Run diagnostic scripts** (created)
2. ✅ **Test build locally** (created script)
3. ⏳ **Check browser console in production** (manual)
4. ⏳ **Verify build output structure** (run diagnostics)
5. ⏳ **Check Firebase Hosting logs** (created script)
6. ⏳ **Compare local vs production** (manual comparison)

## Expected Findings

Based on common Expo Router static export issues, the likely causes are:

1. **Expo Router static export issue** (most likely)
   - `output: "single"` might not work correctly
   - Missing base URL configuration
   - Asset paths incorrect

2. **Asset path resolution** (possible)
   - Absolute paths don't work on static hosting
   - Missing assets in build output

3. **Environment variables** (less likely)
   - Variables are set correctly in build
   - But verify they're actually used in code

## Recommendation

**Priority 1**: Check browser console in production - this will immediately reveal the issue (404, JavaScript error, etc.)

**Priority 2**: Run diagnostic scripts locally to verify build output structure

**Priority 3**: If issues persist, consider trying alternative Expo export configuration:
- Remove `output: "single"` 
- Add explicit base path if needed
- Verify Expo Router static export documentation

## Getting Help

If issues persist after running all diagnostics:

1. Collect browser console errors
2. Collect Network tab failures
3. Run diagnostic scripts and share output
4. Check Expo Router documentation for static exports
5. Review Firebase Hosting documentation

