# Testing Instructions for Ignite Migration

## Quick Start

Since terminal commands are having issues, please run these commands manually in your terminal:

### 1. Install Dependencies

```powershell
npm install
```

This will:
- Remove old dependencies (expo-router, async-storage)
- Install new dependencies (react-native-mmkv)
- Update all packages

### 2. Test Web Build

```powershell
npx expo start --web
```

This will:
- Start the Expo development server
- Open the app in your browser
- Show any compilation errors

### 3. Test Android Build (Optional)

```powershell
npx expo run:android
```

This will:
- Generate native Android code
- Build and install the app on your device/emulator

## Alternative: Use the Test Script

You can also run the provided PowerShell script:

```powershell
.\test-migration.ps1
```

## What to Check

### ✅ Web Build Should:
1. Load without errors
2. Show the login screen
3. Allow OAuth login
4. Navigate to chat screen after login
5. All tabs should work (Chat, History, MCP, Settings)

### ✅ Android Build Should:
1. Build without Gradle errors
2. Install on device/emulator
3. Show login screen
4. Allow OAuth login
5. All navigation should work

## Common Issues

### Issue: "Cannot find module 'react-native-mmkv'"
**Solution**: Run `npm install` again

### Issue: "Cannot find module '@/services/...'"
**Solution**: Check that `tsconfig.json` paths are correct

### Issue: "Navigation error"
**Solution**: Make sure `app/navigators/AppNavigator.tsx` is properly configured

### Issue: "Storage error"
**Solution**: Make sure all storage calls are synchronous (no `await`)

## If Everything Works

Once you've verified the builds work:
1. Remove old Expo Router files (see MIGRATION_COMPLETE.md)
2. Commit your changes
3. Create a pull request

## Need Help?

Check these files:
- `MIGRATION_COMPLETE.md` - Full migration summary
- `REMAINING_TASKS.md` - Detailed task list
- `IGNITE_MIGRATION_COMPLETE.md` - Implementation details

