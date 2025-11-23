# Migration to Ignite Boilerplate - Step by Step Guide

## Overview
This document outlines the migration from the current Expo Router setup to Ignite Boilerplate.

## Phase 1: Initialize Ignite (Run Manually)

### Step 1: Backup Current Code
```powershell
# Create backup of business logic
New-Item -ItemType Directory -Force -Path "backup-migration"
Copy-Item -Path "components" -Destination "backup-migration\components" -Recurse
Copy-Item -Path "hooks" -Destination "backup-migration\hooks" -Recurse
Copy-Item -Path "lib" -Destination "backup-migration\lib" -Recurse
Copy-Item -Path "contexts" -Destination "backup-migration\contexts" -Recurse
Copy-Item -Path "app" -Destination "backup-migration\app" -Recurse
Copy-Item -Path "assets" -Destination "backup-migration\assets" -Recurse
```

### Step 2: Initialize Ignite
```powershell
# Navigate to parent directory
cd ..
# Initialize Ignite in a temp folder
npx ignite-cli@latest new ai-agent-ignite --yes
# Copy Ignite structure back
# (We'll do this manually in the migration)
```

## Phase 2: Dependency Migration

### Libraries to Keep (Business Logic)
- `axios` (if used) - Install via `npx expo install axios`
- Custom business logic libraries

### Libraries to Remove (Ignite Provides)
- `@react-navigation/*` - Ignite has its own navigation
- `@react-native-async-storage/async-storage` - Ignite uses MMKV
- `expo-router` - Ignite uses React Navigation

### Libraries to Migrate
- `expo-auth-session` - Keep for OAuth
- `expo-web-browser` - Keep for OAuth
- `react-native-markdown-display` - Keep if needed

## Phase 3: Code Structure Migration

### Screens Migration
- `app/(tabs)/index.tsx` → `app/screens/ChatScreen.tsx`
- `app/(tabs)/conversations.tsx` → `app/screens/ConversationsScreen.tsx`
- `app/(tabs)/mcp.tsx` → `app/screens/MCPScreen.tsx`
- `app/(tabs)/settings.tsx` → `app/screens/SettingsScreen.tsx`
- `app/(auth)/login.tsx` → `app/screens/LoginScreen.tsx`
- `app/index.tsx` → Handle in `app/app.tsx` or navigation

### Components Migration
- `components/` → `app/components/`
- Keep all chat, mcp, and ui components

### Hooks & Services Migration
- `hooks/` → `app/utils/hooks/` or `app/services/`
- `lib/` → `app/services/`

### State Management
- Current: React Context (`contexts/AuthContext.tsx`)
- Option 1: Keep Context (simpler migration)
- Option 2: Migrate to MobX-State-Tree (Ignite's preference)

## Phase 4: Storage Migration

### AsyncStorage → MMKV
Ignite uses `react-native-mmkv` instead of AsyncStorage. We need to:
1. Update `lib/storage.ts` to use MMKV
2. Update all storage calls

## Phase 5: Navigation Migration

### Expo Router → React Navigation
- Remove file-based routing
- Configure screens in `app/navigators/AppNavigator.tsx`
- Set up tab navigation manually

## Next Steps
1. Run the initialization script
2. Follow the migration steps in order
3. Test each phase before proceeding

