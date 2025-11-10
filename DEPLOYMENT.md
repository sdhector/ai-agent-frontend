# PWA Deployment Guide

This guide explains how to deploy the AI Assistant PWA to Firebase Hosting.

## Prerequisites

1. **Node.js** (v18 or later)
2. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
4. **Backend Deployed**: Your backend must be deployed and accessible (e.g., on Cloud Run)

## Initial Setup

### 1. Configure Firebase Project

Update `.firebaserc` with your Firebase project ID:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 2. Configure Production Environment

Update `.env.production` with your backend URL:
```bash
# Production Environment Configuration
EXPO_PUBLIC_API_URL=https://your-backend-url.run.app
EXPO_PUBLIC_APP_NAME=AI Assistant
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENV=production
```

### 3. Login to Firebase

```bash
firebase login
```

## Build Process

### Option 1: Automated Deployment (Recommended)

Run the deployment script which handles everything:
```bash
npm run deploy:web
```

This script will:
1. Install dependencies
2. Clean previous builds
3. Build PWA with production environment variables
4. Deploy to Firebase Hosting
5. Show deployment URL

### Option 2: Manual Deployment

#### Step 1: Build the PWA
```bash
npm run build:web:production
```

This creates a production-optimized build in the `dist/` directory.

#### Step 2: Test Locally (Optional)
```bash
npm run preview:web
```

Visit `http://localhost:3000` to test the built PWA.

#### Step 3: Deploy to Firebase
```bash
firebase deploy --only hosting
```

## Post-Deployment

### 1. Verify Deployment

Visit your Firebase Hosting URL:
```
https://your-project-id.web.app
```

Test all features:
- [ ] Login with Google OAuth
- [ ] Send and receive messages
- [ ] View conversation history
- [ ] Connect to MCP servers
- [ ] Execute MCP tools
- [ ] Logout

### 2. Run Lighthouse Audit

```bash
# With the preview running on localhost:3000
npm run audit
```

Target scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+
- **PWA**: 100

### 3. Configure Custom Domain (Optional)

#### In Firebase Console:
1. Go to Hosting → Add custom domain
2. Follow DNS configuration instructions
3. Wait for SSL certificate provisioning (can take up to 24 hours)

#### Or via CLI:
```bash
firebase hosting:channel:deploy production --expires 30d
```

## Continuous Deployment (CI/CD)

### GitHub Actions

Create `.github/workflows/deploy-pwa.yml`:

```yaml
name: Deploy PWA to Firebase

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build PWA
        run: npm run build:web:production
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-firebase-project-id
```

#### Setup Secrets in GitHub:
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `API_URL`: Your production backend URL
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON

To get Firebase service account:
```bash
firebase login:ci
```

## Monitoring

### Firebase Console

Monitor your PWA at:
```
https://console.firebase.google.com/project/your-project-id/hosting
```

Key metrics to watch:
- **Requests**: Total traffic
- **Data transfer**: Bandwidth usage
- **Errors**: 404s and other issues

### Analytics (Optional)

Add Google Analytics to track usage:

1. Enable Analytics in Firebase Console
2. Add to `app.json`:
```json
{
  "expo": {
    "web": {
      "config": {
        "firebase": {
          "measurementId": "G-XXXXXXXXXX"
        }
      }
    }
  }
}
```

## Troubleshooting

### Build Fails

**Issue**: `expo export:web` fails
- Check Node.js version (needs 18+)
- Clear cache: `npm run clean && rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### Deployment Fails

**Issue**: Firebase deployment rejected
- Verify Firebase CLI is logged in: `firebase login`
- Check `.firebaserc` has correct project ID
- Verify Firebase project exists and billing is enabled

### PWA Not Loading

**Issue**: White screen after deployment
- Check browser console for errors
- Verify `EXPO_PUBLIC_API_URL` is correct in `.env.production`
- Check Network tab - is backend accessible?
- Try hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### OAuth Not Working

**Issue**: OAuth redirect fails
- Update authorized redirect URIs in Google Cloud Console
- Add: `https://your-project-id.web.app`
- Add: `https://your-backend-url.run.app/api/auth/google/callback`

### Service Worker Issues

**Issue**: Service worker not updating
- Clear application cache in DevTools (Application → Storage → Clear site data)
- Service workers cache aggressively - may need to unregister old one

## Performance Optimization

### 1. Enable Gzip Compression

Firebase Hosting automatically compresses content, but verify:
```bash
curl -H "Accept-Encoding: gzip" -I https://your-project-id.web.app
```

### 2. Optimize Images

Before building, optimize images in `assets/`:
```bash
# Install image optimization tools
npm install -g imagemin-cli

# Optimize PNGs
imagemin assets/*.png --out-dir=assets

# Optimize JPEGs
imagemin assets/*.jpg --out-dir=assets --plugin=mozjpeg
```

### 3. Code Splitting

Expo automatically handles code splitting. Verify in build:
```bash
ls -lh dist/_expo/static/js/
```

Should see multiple JS chunks.

### 4. Cache Configuration

Firebase Hosting configuration in `firebase.json` already includes optimal caching:
- Static assets (JS/CSS/images): 1 year cache
- HTML/JSON: No cache (always fresh)
- Service worker: No cache

## Rollback

To rollback to a previous deployment:

```bash
# List previous deployments
firebase hosting:clone --list

# Rollback to specific deployment
firebase hosting:clone <source-site-id>:<source-deployment-id> <target-site-id>:live
```

## Security

### 1. Enable HTTPS Only

Firebase Hosting enforces HTTPS by default. Verify:
- All API calls use HTTPS URLs
- No mixed content warnings in browser console

### 2. Content Security Policy

Add CSP headers in `firebase.json`:
```json
{
  "headers": [{
    "source": "**",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    }]
  }]
}
```

### 3. Environment Variables

Never commit `.env.production` with real secrets to version control. Use:
- Firebase Functions config
- GitHub Secrets for CI/CD
- Environment variable management tools

## Cost Estimation

Firebase Hosting **Free Tier** includes:
- 10 GB storage
- 360 MB/day bandwidth
- Custom domain + SSL

Typical usage for moderate traffic:
- **Storage**: ~50 MB (PWA bundle)
- **Bandwidth**: ~1 GB/month (1000 users)
- **Cost**: $0 (within free tier)

## Support

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Expo Docs**: https://docs.expo.dev/distribution/publishing-websites/
- **GitHub Issues**: Report problems in your repository

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
