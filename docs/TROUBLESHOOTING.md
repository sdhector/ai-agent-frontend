# Frontend Deployment Troubleshooting Guide

## Problem
The frontend doesn't load when deployed to Firebase Hosting, but works locally.

## Diagnostic Checklist

### 1. Verify Build Output

Run the diagnostic script to check the build:
```bash
cd ai-agent-frontend
npm run build:web
node scripts/diagnose-build.js
```

**What to check:**
- ✅ `dist/index.html` exists
- ✅ JavaScript bundle files exist
- ✅ CSS files exist
- ✅ All asset paths in `index.html` are correct
- ✅ Root div (`<div id="root">`) exists in HTML

### 2. Test Build Locally

Test the production build locally to compare with production:
```bash
cd ai-agent-frontend
bash scripts/test-build-local.sh
```

This will:
1. Clean previous builds
2. Set production environment variables
3. Build for production
4. Run diagnostics
5. Serve locally on http://localhost:3000

**Compare:**
- Does the local build work?
- Are there differences between local and production?
- Check browser console for errors

### 3. Check Firebase Hosting Configuration

**Verify `firebase.json`:**
- `public: "dist"` - correct output directory
- Rewrite rules configured for SPA routing
- Headers configured correctly

**Current configuration:**
```json
{
  "hosting": {
    "site": "ai-agent-frontend-462321",
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

**Potential issue:** The `**` rewrite might be too aggressive and catch static assets. Should be:
```json
{
  "rewrites": [
    {
      "source": "**/*.@(js|css|jpg|jpeg|gif|png|svg|webp|woff|woff2|ttf|eot|ico)",
      "destination": "/404.html"
    },
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Check Browser Console

**In production (Firebase Hosting):**
1. Open DevTools (F12)
2. Go to **Console** tab
3. Check for JavaScript errors:
   - Missing files (404)
   - CORS errors
   - Network errors
   - JavaScript syntax errors

4. Go to **Network** tab:
   - Check failed requests (red)
   - Verify all assets load (200 status)
   - Check for blocked requests

### 5. Verify Environment Variables

**During build:**
Environment variables must be set **during the build** (not runtime) for Expo.

Check `cloudbuild.yaml`:
```yaml
env:
  - 'EXPO_PUBLIC_API_URL=${_API_URL}'
  - 'EXPO_PUBLIC_ENV=production'
  - 'NODE_ENV=production'
```

**Verify in browser:**
1. Open DevTools Console
2. Check `lib/constants.ts` - it should log the API URL
3. Verify it's not `localhost` or undefined

### 6. Check Expo Router Configuration

**Current config in `app.json`:**
```json
{
  "web": {
    "bundler": "metro",
    "output": "single",
    ...
  },
  "extra": {
    "router": {
      "origin": false
    }
  }
}
```

**Potential issues:**
- `output: "single"` might not work correctly with Expo Router
- Missing `baseUrl` configuration for static hosting

### 7. Check Asset Paths

**In `dist/index.html`:**
- All script tags should have correct `src` paths
- All link tags should have correct `href` paths
- Paths should be relative (e.g., `./index.js`) not absolute (e.g., `/index.js`)

**If using absolute paths:**
- Firebase Hosting serves from root
- Should work, but verify in browser Network tab

### 8. Check Service Worker

**Service worker might be blocking resources:**
1. Open DevTools → **Application** tab
2. Check **Service Workers**
3. Unregister service worker if needed
4. Clear cache and reload

### 9. Common Issues and Solutions

#### Issue: White Screen / Blank Page

**Causes:**
1. JavaScript bundle not loading (404)
2. JavaScript error preventing app from rendering
3. Missing root div in HTML
4. Environment variables not set correctly

**Solution:**
1. Check browser console for errors
2. Verify all assets load in Network tab
3. Check if React is mounting correctly
4. Verify API URL is set correctly

#### Issue: 404 Errors for Assets

**Causes:**
1. Wrong base path in build
2. Firebase Hosting rewrite rules too aggressive
3. Assets not copied to `dist/`

**Solution:**
1. Check asset paths in `index.html`
2. Verify assets exist in `dist/`
3. Adjust Firebase Hosting rewrite rules
4. Check if Expo export is working correctly

#### Issue: CORS Errors

**Causes:**
1. Backend not configured for Firebase Hosting origin
2. Missing credentials in requests

**Solution:**
1. Verify backend CORS configuration
2. Check if frontend origin is allowed
3. Verify `credentials: 'include'` in API requests

#### Issue: Environment Variables Not Set

**Causes:**
1. Variables not set during build
2. Variables not prefixed with `EXPO_PUBLIC_`
3. Variables not accessible at build time

**Solution:**
1. Verify variables in `cloudbuild.yaml`
2. Check build logs for variable values
3. Ensure `EXPO_PUBLIC_` prefix for client-side vars

## Quick Diagnostic Commands

```bash
# 1. Build and diagnose
cd ai-agent-frontend
npm run build:web
node scripts/diagnose-build.js

# 2. Test locally
bash scripts/test-build-local.sh

# 3. Check Firebase logs
bash scripts/check-firebase-logs.sh

# 4. Deploy manually to test
firebase deploy --only hosting:ai-agent-frontend-462321
```

## Next Steps

1. ✅ Run diagnostic scripts
2. ✅ Compare local vs production builds
3. ✅ Check browser console for errors
4. ✅ Verify all assets load correctly
5. ✅ Check environment variables
6. ✅ Review Firebase Hosting logs

## Getting Help

If issues persist:
1. Collect browser console errors
2. Collect Network tab failures
3. Check Firebase Hosting logs
4. Compare working local build with production build
5. Check Expo Router documentation for static exports

