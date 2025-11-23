# Quick Testing Prompt for LLM

## Task
Test the Ignite Boilerplate migration of a React Native app. The migration from Expo Router to Ignite is complete but needs verification.

## Steps

1. **Install**: Run `npm install`
2. **Test Web**: Run `npx expo start --web` 
3. **Verify**: Check app loads, login works, navigation works, no errors
4. **Fix Issues**: Fix any import errors, storage errors (remove `await` from storage calls), or navigation errors
5. **Report**: Document what works and what was fixed

## Key Changes
- Storage: MMKV (synchronous) - use `getToken()` not `await getToken()`
- Navigation: React Navigation - use `navigation.navigate()` not `router.push()`
- Imports: Use `@/services/*`, `@/components/*`, `@/hooks/*` paths

## Critical Files
- `app/navigators/AppNavigator.tsx` - Navigation config
- `app/services/storage.ts` - MMKV storage (synchronous)
- `app/app.tsx` - Root component
- `index.js` - Entry point

## Common Fixes
- Import errors → Update paths in `tsconfig.json` or fix imports
- Storage errors → Remove `await` from storage functions
- Navigation errors → Check screen registration in `AppNavigator.tsx`

**Start testing now and fix any issues you find.**

