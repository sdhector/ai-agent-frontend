# AI Assistant Frontend

**React Native + Expo application that builds both PWA and Android APK from a single codebase**

This repository contains the frontend for the AI Assistant application. The backend API is in a separate repository.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This is a React Native application built with Expo that can deploy to:
- **Web (PWA)**: Progressive Web App for browsers
- **Android**: Native Android APK for mobile devices

**Key Architecture Decision**: ONE codebase builds BOTH targets, maximizing code reuse (90%+) while handling platform-specific differences via `Platform.OS` checks.

**Technology Stack**:
- **Framework**: React Native 0.81.5 + Expo 54.0.0
- **Language**: TypeScript 5
- **Styling**: NativeWind 4.x (Tailwind CSS for React Native)
- **Navigation**: React Navigation (Stack + Tabs)
- **State Management**: React Hooks + Context API
- **Storage**: MMKV (synchronous storage)

---

## Features

### Current Features (Phase 5 Complete)
- ✅ **Authentication**: Google OAuth login with platform-specific flows
- ✅ **AI Chat**: Real-time streaming chat with Claude models (Sonnet 4.5, Opus 4.1, Haiku 3.5)
- ✅ **Conversations**: Save, load, and delete chat history
- ✅ **MCP Integration**: Connect to external tools (Gmail, Drive, Calendar, Tasks)
  - OAuth-based server connections
  - Tool discovery and execution
  - Dynamic form generation
- ✅ **4-Tab Navigation**: Chat, History, MCP, Settings
- ✅ **Platform-specific Storage**: localStorage (web) / SecureStore (Android)
- ✅ **Responsive UI**: NativeWind/Tailwind styling
- ✅ **API Client**: Fetch wrapper with JWT + CSRF token authentication
- ✅ **PWA Support**: Complete Progressive Web App implementation
  - Web app manifest with install prompts
  - Service worker with offline support
  - Intelligent caching (cache-first for assets, network-first for API)
  - Install button component
  - iOS and Android PWA compatibility

### In Progress
- 🚧 **Android APK**: Local build via WSL + Gradle (see `LLM_BUILD_ANDROID_APK.md`)

### Planned Features
- 📋 **Push Notifications**: Web Push API and expo-notifications (optional)
- 📋 **Advanced Features**: File uploads, voice input, etc.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (This Repository)            │
│  ├── PWA Build → npm run build:web     │
│  │   └── Deploys to Firebase Hosting   │
│  │                                      │
│  └── Android APK → npm run build:android│
│      └── Built via EAS Build            │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS REST API
               │
┌──────────────▼──────────────────────────┐
│  Backend API (Separate Repository)     │
│  https://ai-assistant-backend.run.app  │
└─────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 10+
- **Expo CLI**: Installed globally or use `npx`
- **Android Studio**: For Android development (optional)
- **Backend API**: Running at `http://localhost:8080` (development) or production URL

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/sdhector/ai-agent-frontend.git
cd ai-agent-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend URL

Edit `lib/constants.ts` and update `API_BASE_URL`:

```typescript
export const API_BASE_URL = Platform.select({
  web: 'http://localhost:8080',  // Local backend
  default: 'http://localhost:8080',
  // For Android emulator:
  // android: 'http://10.0.2.2:8080',
});
```

Or update `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8080"
    }
  }
}
```

### 4. Run Development Server

```bash
# Start Expo dev server
npm start

# Run on web (PWA)
npm run web

# Run on Android emulator
npm run android
```

**Expected output**:
```
Metro waiting on exp://localhost:8081
› Press w │ open web
› Press a │ open Android
```

### 5. Test Backend Connection

1. Open app in browser or Android emulator
2. Navigate to Chat tab
3. Click "Test Backend Connection" button
4. Should see "✅ Connected" status

---

## Development

### Project Structure (Ignite Boilerplate)

```
ai-agent-frontend/
├── app/                      # Main application code
│   ├── app.tsx              # Root component
│   ├── navigators/
│   │   └── AppNavigator.tsx # React Navigation config
│   ├── screens/             # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ConversationsScreen.tsx
│   │   ├── MCPScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/          # UI components
│   │   ├── ui/              # Reusable UI components
│   │   ├── chat/            # Chat-specific components
│   │   └── mcp/             # MCP-specific components
│   ├── services/            # Business logic
│   │   ├── api-client.ts    # Fetch wrapper
│   │   ├── storage.ts       # MMKV storage
│   │   ├── constants.ts     # API URLs, config
│   │   └── csrf.ts          # CSRF token handling
│   ├── contexts/            # React context providers
│   └── utils/hooks/         # Custom React hooks
├── index.js                 # Entry point
├── assets/                  # Icons, images
├── public/                  # PWA assets (manifest, service worker)
├── android/                 # Native Android project (generated)
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build config
├── package.json
├── tsconfig.json
└── tailwind.config.js       # NativeWind config
```

### Development Workflow

1. **Make changes** to code
2. **Hot reload** automatically updates
3. **Test on web**: `npm run web`
4. **Test on Android**: `npm run android`
5. **Type check**: `npm run type-check`
6. **Commit**: `git commit -m "feat: your changes"`

### Adding New Screens

Using Expo Router (file-based routing):

```bash
# Create new screen
touch app/(tabs)/new-screen.tsx

# Screen automatically available at /new-screen
```

### Platform-Specific Code

```typescript
import { Platform } from 'react-native';

// Conditional code
if (Platform.OS === 'web') {
  // Web-only code (PWA)
} else if (Platform.OS === 'android') {
  // Android-only code
}

// Platform-specific values
const apiUrl = Platform.select({
  web: 'http://localhost:8080',
  android: 'http://10.0.2.2:8080',
});
```

### Styling with NativeWind

```tsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-bold text-primary-500">
        Hello World
      </Text>
    </View>
  );
}
```

---

## Building

### Build PWA (Progressive Web App)

```bash
# Build static web files
npm run build:web

# Output: dist/ folder
```

**Test locally**:
```bash
npx serve dist
# Visit http://localhost:3000
```

### Build Android APK

**Prerequisites**:
1. Create Expo account at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`

**Build APK**:

```bash
# Configure (first time only)
eas build:configure

# Build production APK
npm run build:android

# Or directly:
eas build --platform android --profile production
```

**Build process**:
1. EAS uploads your code to cloud
2. Builds APK in ~10-15 minutes
3. Provides download link

**Download APK**:
```bash
# Get build status
eas build:list

# Download APK
# Visit URL from build:list or check https://expo.dev/accounts/[username]/projects/ai-assistant/builds
```

### Build Profiles

Edit `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Deployment

### PWA Deployment (Firebase Hosting) - READY FOR PRODUCTION ✅

**Quick Start**:

```bash
# 1. Configure environment
cp .env.example .env.production
# Edit .env.production with your backend URL

# 2. Configure Firebase project
# Edit .firebaserc with your Firebase project ID

# 3. Deploy (automated)
npm run deploy:web
```

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Complete setup instructions
- CI/CD with GitHub Actions
- Environment configuration
- Custom domain setup
- Lighthouse audit
- Troubleshooting

**Result**: PWA available at `https://your-project.web.app`

### Android APK Distribution

**Option 1: Direct Download** (Recommended for now)

1. Build APK: `npm run build:android`
2. Download from EAS Build dashboard
3. Host on website (e.g., hectorsanchez.work/apps/ai-assistant.apk)
4. Share download link

**Option 2: Google Play Store** (Future)

Can use same APK for Play Store with minor config changes.

---

## Configuration

### Environment Variables

Create `.env` (not tracked by git):

```bash
# Backend API URL
EXPO_PUBLIC_API_URL=https://ai-assistant-backend-xyz.run.app

# Feature flags
EXPO_PUBLIC_ENABLE_MCP=true
```

Access in code:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

### App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "AI Assistant",
    "slug": "ai-assistant",
    "version": "1.0.0",
    "android": {
      "package": "com.hectorsanchez.aiassistant"
    },
    "extra": {
      "apiUrl": "http://localhost:8080"
    }
  }
}
```

### NativeWind Configuration

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0284c7',  // Brand color
        },
      },
    },
  },
};
```

---

## Troubleshooting

### Issue: Backend Connection Failed

**Error**: "Backend Connection Failed" alert

**Solution**:
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check `API_BASE_URL` in `lib/constants.ts`
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. Check CORS configuration in backend

### Issue: Expo Dependency Warnings

**Error**: Peer dependency warnings during `npm install`

**Solution**:
```bash
npx expo install --fix
```

### Issue: Metro Bundler Cache

**Error**: Stale imports or old code running

**Solution**:
```bash
npx expo start -c
# Or: npm start -- --clear
```

### Issue: NativeWind Styles Not Applying

**Error**: Tailwind classes not rendering

**Solution**:
1. Verify `babel.config.js` includes NativeWind preset
2. Restart Metro bundler: `npm start -- --clear`
3. Check `tailwind.config.js` content paths

### Issue: CSRF Token Error (403 Forbidden)

**Error**: `API Error 403: {"success":false,"error":"Invalid CSRF token"}`

**Solution**:
The app implements CSRF protection for state-changing requests (POST/PUT/DELETE). The CSRF token is automatically extracted from cookies set by the backend.

1. **Verify backend sets CSRF cookie**:
   - Open DevTools → Application → Cookies
   - Look for: `csrf_token`, `XSRF-TOKEN`, or `_csrf`

2. **Check cookie attributes**:
   - Must have `HttpOnly: false` (so JavaScript can read it)
   - Must have correct `Domain` and `Path`

3. **Verify CORS configuration**:
   - Backend must allow credentials: `Access-Control-Allow-Credentials: true`
   - Frontend origin must be in `Access-Control-Allow-Origin`

**Implementation details**: See `lib/csrf.ts` and `lib/api-client.ts`

### Issue: PWA Not Installing

**Error**: No install button appears in browser

**Solution**:
1. Verify HTTPS (PWA requires secure context)
2. Check manifest file is served: `/manifest.webmanifest`
3. Check service worker registered: DevTools → Application → Service Workers
4. Verify icons exist: `/icon-192.png`, `/icon-512.png`
5. Try clearing cache and reload

### Issue: Android Build Fails

**Error**: EAS build fails

**Solution**:
1. Check build logs: `eas build:list`
2. View detailed log: Click build ID on expo.dev
3. Common issues:
   - Invalid `app.json` configuration
   - Missing Android package name
   - Invalid version format

### Issue: Can't Run on Android Emulator

**Error**: "No Android devices found"

**Solution**:
1. Start Android Studio
2. Open AVD Manager
3. Create/start an emulator
4. Run `npm run android` again

---

## Deployment

### PWA Deployment (Firebase Hosting)

1. **Configure environment**:
   ```bash
   # Update .env.production with your backend URL
   EXPO_PUBLIC_API_URL=https://your-backend.run.app
   ```

2. **Build the PWA**:
   ```bash
   npm run build:web:production
   ```

3. **Deploy to Firebase**:
   ```bash
   firebase deploy --only hosting
   # Or use the deployment script:
   ./scripts/deploy-pwa.sh
   ```

4. **Verify PWA installation**:
   - Open deployed URL in Chrome/Edge
   - Look for install icon in address bar
   - Click to install as app

### Cloud Build CI/CD (Optional)

The repository includes `.github/workflows/deploy-pwa.yml` and `cloudbuild.yaml` for automated deployments on push to main branch.

---

## Scripts

```json
{
  "start": "expo start",
  "web": "expo start --web",
  "android": "expo start --android",
  "build:web": "expo export:web",
  "build:web:production": "expo export --platform web",
  "build:android": "eas build --platform android --profile production",
  "deploy:web": "./scripts/deploy-pwa.sh",
  "type-check": "tsc --noEmit",
  "lint": "eslint .",
  "test": "jest"
}
```

---

## Testing

### Manual Testing

**Web (PWA)**:
1. Run `npm run web`
2. Test in Chrome, Firefox, Safari
3. Test responsive design (mobile view)
4. Test offline mode (after PWA install)

**Android**:
1. Run `npm run android`
2. Test on emulator and real device
3. Test different screen sizes
4. Test Android-specific features

### Automated Testing

```bash
# Run tests (when implemented)
npm test
```

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test on both web and Android
4. Commit changes: `git commit -m "feat: add your feature"`
5. Push to branch: `git push origin feature/your-feature`
6. Create Pull Request

---

## License

This project is licensed under the ISC License.

---

## Related Repositories

- **Backend**: https://github.com/sdhector/ai-agent-backend (Express.js API)

---

## Support

For issues, questions, or contributions:
- **GitHub Issues**: https://github.com/sdhector/ai-agent-frontend/issues
- **Migration Guide**: See `/react-native-migration-guide/` in original repository

---

**Current Status**: Ignite Migration Complete - PWA Working, Android Build Ready
**Next Steps**: Build Android APK using WSL environment (see `LLM_BUILD_ANDROID_APK.md`)

**Last Updated**: November 25, 2025
