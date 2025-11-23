# LLM Prompt: Complete Ignite Migration Testing

## Context

You are helping to complete the testing phase of a React Native app migration from Expo Router to Ignite Boilerplate. The migration has been completed, but needs testing and verification.

## What Has Been Done

A React Native application has been successfully migrated from Expo Router to Ignite Boilerplate structure:

1. **File Structure Migration**:
   - Components moved: `components/` → `app/components/`
   - Hooks moved: `hooks/` → `app/utils/hooks/`
   - Services created: `lib/` → `app/services/` (with MMKV storage)
   - Screens created: All screens in `app/screens/`
   - Navigation configured: `app/navigators/AppNavigator.tsx`

2. **Dependencies Updated**:
   - Removed: `expo-router`, `@react-native-async-storage/async-storage`
   - Added: `react-native-mmkv`
   - Updated: `package.json` main entry to `index.js`

3. **Configuration Updated**:
   - `app.json`: Removed expo-router plugin, updated web config
   - `tsconfig.json`: Updated paths for new structure
   - Storage: Migrated from AsyncStorage (async) to MMKV (synchronous)

4. **Key Changes**:
   - Navigation: React Navigation instead of Expo Router
   - Storage: MMKV (synchronous) instead of AsyncStorage (async)
   - Entry point: `app/app.tsx` instead of `expo-router/entry`

## Your Task

Complete the testing phase by:

1. **Installing Dependencies**
   - Run `npm install` to install all dependencies including `react-native-mmkv`
   - Verify installation completes without errors

2. **Testing Web Build**
   - Run `npx expo start --web`
   - Verify the app loads in the browser
   - Test the following:
     - Login screen appears
     - OAuth login works (or at least redirects properly)
     - After login, navigation to main app works
     - All tabs are accessible (Chat, History, MCP, Settings)
     - No console errors

3. **Testing Android Build** (if possible)
   - Run `npx expo run:android`
   - Verify the app builds and installs
   - Test navigation and core functionality

4. **Fixing Any Issues**
   - If you encounter import errors, fix the import paths
   - If you encounter storage errors, ensure all storage calls are synchronous (no `await`)
   - If you encounter navigation errors, check `app/navigators/AppNavigator.tsx`
   - If you encounter type errors, check `tsconfig.json` paths

5. **Verifying Key Functionality**
   - Authentication flow works
   - Navigation between screens works
   - Storage operations work (MMKV is synchronous)
   - API calls work
   - No runtime errors

## Important Notes

### Storage Changes
- **MMKV is synchronous** - All storage functions no longer use `await`
- Example: `const token = getToken();` (NOT `await getToken()`)
- If you see `await getToken()` or similar, remove the `await`

### Navigation Changes
- Use `navigation.navigate('ScreenName')` instead of `router.push()`
- Navigation is configured in `app/navigators/AppNavigator.tsx`

### Import Paths
- Components: `@/components/*` or `../components/*`
- Services: `@/services/*` or `../services/*`
- Hooks: `@/hooks/*` or `../utils/hooks/*`
- Screens: `@/screens/*` or `../screens/*`

## Common Issues to Watch For

1. **"Cannot find module 'react-native-mmkv'"**
   - Solution: Run `npm install` again

2. **"Cannot find module '@/services/...'"**
   - Solution: Check `tsconfig.json` paths are correct
   - Path should be: `"@services/*": ["./app/services/*"]`

3. **"Storage function is not async"**
   - Solution: Remove `await` from storage calls
   - Example: Change `await getToken()` to `getToken()`

4. **"Navigation error: Screen not found"**
   - Solution: Check `app/navigators/AppNavigator.tsx` has all screens registered

5. **"OAuth callback not working"**
   - Solution: Check `app/screens/OAuthCallbackScreen.tsx` handles token extraction
   - Verify navigation includes OAuthCallback route

## Files to Check

### Critical Files
- `package.json` - Should have `react-native-mmkv`, no `expo-router`
- `app.json` - Should not have `expo-router` in plugins
- `index.js` - Entry point should exist
- `app/app.tsx` - Root component
- `app/navigators/AppNavigator.tsx` - Navigation configuration

### Storage Files
- `app/services/storage.ts` - MMKV implementation (synchronous)
- `app/contexts/AuthContext.tsx` - Should use synchronous storage

### Screen Files
- `app/screens/LoginScreen.tsx`
- `app/screens/ChatScreen.tsx`
- `app/screens/ConversationsScreen.tsx`
- `app/screens/MCPScreen.tsx`
- `app/screens/SettingsScreen.tsx`
- `app/screens/OAuthCallbackScreen.tsx`

## Testing Checklist

- [ ] `npm install` completes without errors
- [ ] `npx expo start --web` starts successfully
- [ ] App loads in browser without errors
- [ ] Login screen appears
- [ ] OAuth login flow works (or redirects properly)
- [ ] Navigation to main app works after login
- [ ] All tabs are accessible
- [ ] No console errors
- [ ] Storage operations work (check auth persistence)
- [ ] API calls work (check network tab)
- [ ] Android build works (if testing Android)

## Expected Behavior

1. **On Web**:
   - App loads showing login screen
   - Clicking "Sign in with Google" redirects to OAuth
   - After OAuth, redirects back with token
   - OAuthCallbackScreen processes token
   - User is navigated to main app (Chat tab)
   - All tabs work: Chat, History, MCP, Settings

2. **On Android**:
   - App builds without Gradle errors
   - App installs on device/emulator
   - Login screen appears
   - OAuth flow works via expo-auth-session
   - Navigation works correctly

## Success Criteria

The migration is successful when:
1. ✅ Web build runs without errors
2. ✅ App loads and displays correctly
3. ✅ Authentication flow works
4. ✅ Navigation works between all screens
5. ✅ No runtime errors in console
6. ✅ Storage operations work correctly
7. ✅ Android build works (if tested)

## If Everything Works

Once testing is complete and everything works:
1. Document any issues found and how they were fixed
2. Note any remaining warnings (non-critical)
3. Optionally remove old Expo Router files:
   - `app/(tabs)/` directory
   - `app/(auth)/` directory
   - `app/_layout*.tsx` files
   - `app/index.tsx` (old entry)
   - `lib/` directory (if not needed)

## Your Approach

1. Start by running `npm install` and checking for errors
2. Run the web build and observe any errors
3. Fix errors systematically:
   - Import path errors → Fix imports
   - Storage errors → Remove await from storage calls
   - Navigation errors → Check navigation configuration
   - Type errors → Check TypeScript paths
4. Test each screen and feature
5. Document what works and what doesn't
6. Fix any remaining issues
7. Verify everything works end-to-end

## Additional Context

- The app uses NativeWind (Tailwind CSS) for styling
- The app uses Expo SDK ~54.0.0
- The app needs to work on both Web (PWA) and Android
- OAuth is handled via Google OAuth
- The app has chat functionality, conversation history, and MCP server integration

## Output Expected

After completing testing, provide:
1. Summary of what was tested
2. Any errors found and how they were fixed
3. Verification that all functionality works
4. Any recommendations for improvements
5. Confirmation that the migration is complete and ready for production

---

**Start by running `npm install` and then `npx expo start --web` to begin testing.**

