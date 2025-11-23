# Remaining Tasks for Ignite Migration

## 🔴 Critical Tasks (Must Complete)

### 1. **Move Components to `app/components/`** ⚠️
**Status**: Components still in root `components/` directory

**Action Required**:
```powershell
# Move components directory
Move-Item components app/components -Force
```

**Files to move**:
- `components/chat/` → `app/components/chat/`
- `components/mcp/` → `app/components/mcp/`
- `components/ui/` → `app/components/ui/`
- `components/ErrorBoundary.tsx` → `app/components/ErrorBoundary.tsx`
- `components/LoadingScreen.tsx` → `app/components/LoadingScreen.tsx`
- `components/PWAInstallButton.tsx` → `app/components/PWAInstallButton.tsx`

**Import Updates Needed**:
- `components/chat/ProviderSelector.tsx`: Change `@/lib/constants` → `@/services/constants`
- All component files using `@/types/mcp` should work (types stay in root)

---

### 2. **Move Hooks to `app/utils/hooks/`** ⚠️
**Status**: Hooks still in root `hooks/` directory

**Action Required**:
```powershell
# Create directory and move hooks
New-Item -ItemType Directory -Force -Path app/utils/hooks
Move-Item hooks/* app/utils/hooks/ -Force
```

**Files to move**:
- `hooks/useChat.ts` → `app/utils/hooks/useChat.ts`
- `hooks/useConversations.ts` → `app/utils/hooks/useConversations.ts`
- `hooks/useMCPServers.ts` → `app/utils/hooks/useMCPServers.ts`
- `hooks/useServiceWorker.ts` → `app/utils/hooks/useServiceWorker.ts`
- `hooks/useServiceWorker.web.ts` → `app/utils/hooks/useServiceWorker.web.ts`

**Import Updates Needed in Hooks**:
- `useChat.ts`: 
  - `@/lib/api-client` → `@/services/api-client`
  - `@/lib/constants` → `@/services/constants`
  - `@/components/chat/Message` → `@/components/chat/Message` (will work after components move)
- `useConversations.ts`:
  - `@/lib/api-client` → `@/services/api-client`
  - `@/lib/constants` → `@/services/constants`
- `useMCPServers.ts`:
  - `@/lib/api-client` → `@/services/api-client`
  - `@/lib/constants` → `@/services/constants`
  - `@/types/mcp` → `@/types/mcp` (stays same)

---

### 3. **Update package.json Dependencies** ⚠️
**Status**: Still using old dependencies

**Action Required**:
1. **Remove**:
   - `expo-router` (no longer needed)
   - `@react-native-async-storage/async-storage` (replaced by MMKV)

2. **Add**:
   - `react-native-mmkv` (required for storage)

3. **Update** (if needed for Ignite compatibility):
   - React Navigation versions (already have v7, should be fine)
   - Expo SDK version (currently ~54.0.0, check Ignite requirements)

**Command**:
```powershell
npm uninstall expo-router @react-native-async-storage/async-storage
npx expo install react-native-mmkv
```

---

### 4. **Update app.json** ⚠️
**Status**: Still has `expo-router` plugin

**Action Required**:
1. Remove `expo-router` from plugins array
2. Update web config to match `app.json.ignite`:
   - Change `"output": "single"` → `"output": "static"`
   - Remove `"manifest": "./public/manifest.webmanifest"` (or keep if needed)
   - Remove `"experiments": { "typedRoutes": true }`
   - Remove `"extra.router"` config

---

### 5. **Update tsconfig.json Paths** ⚠️
**Status**: Paths still point to old structure

**Action Required**:
Update `tsconfig.json` paths section:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./app/components/*"],
      "@screens/*": ["./app/screens/*"],
      "@services/*": ["./app/services/*"],
      "@hooks/*": ["./app/utils/hooks/*"],
      "@contexts/*": ["./app/contexts/*"]
    }
  }
}
```

---

### 6. **Update package.json main entry** ⚠️
**Status**: Still points to `expo-router/entry`

**Action Required**:
Change in `package.json`:
```json
{
  "main": "index.js"  // Changed from "expo-router/entry"
}
```

---

### 7. **Handle OAuth Callback** ⚠️
**Status**: OAuth callback logic in `app/index.tsx` needs integration

**Action Required**:
1. Create `app/screens/OAuthCallbackScreen.tsx` to handle token extraction
2. Add route in `AppNavigator.tsx`:
   ```typescript
   <Stack.Screen name="OAuthCallback" component={OAuthCallbackScreen} />
   ```
3. Update `AuthContext` to handle OAuth redirects
4. Or integrate OAuth handling directly in `LoginScreen` for web

---

## 🟡 Important Tasks (Should Complete)

### 8. **Update All Import Paths**
After moving files, update imports throughout codebase:
- Search for `@/lib/` → replace with `@/services/`
- Verify all `@/components/`, `@/hooks/`, `@/contexts/` paths work

---

### 9. **Update Storage Calls to Synchronous**
**Status**: Some code may still use `await` with storage

**Action Required**:
Search codebase for:
- `await getToken()` → `getToken()`
- `await saveToken()` → `saveToken()`
- `await clearUserData()` → `clearUserData()`

**Files to check**:
- `app/contexts/AuthContext.tsx` (already updated ✅)
- Any other files using storage functions

---

### 10. **Test Builds**
**Status**: Not tested yet

**Action Required**:
```powershell
# Install dependencies first
npm install

# Test web build
npx expo start --web

# Test Android build
npx expo run:android
```

---

## 🟢 Cleanup Tasks (After Testing)

### 11. **Remove Old Expo Router Structure**
**Status**: Old structure still exists

**Action Required** (after verifying new structure works):
```powershell
# Remove old Expo Router files
Remove-Item app/(tabs) -Recurse -Force
Remove-Item app/(auth) -Recurse -Force
Remove-Item app/_layout.tsx -Force
Remove-Item app/_layout.native.tsx -Force
Remove-Item app/index.tsx -Force  # OAuth handler (if moved to screen)
```

---

### 12. **Remove Old lib/ Directory**
**Status**: Old lib/ still exists (migrated to app/services/)

**Action Required** (after verifying services work):
```powershell
Remove-Item lib -Recurse -Force
```

---

### 13. **Remove Old hooks/ Directory**
**Status**: Old hooks/ still exists (migrated to app/utils/hooks/)

**Action Required** (after verifying hooks work):
```powershell
Remove-Item hooks -Recurse -Force
```

---

### 14. **Remove Old components/ Directory**
**Status**: Old components/ still exists (migrated to app/components/)

**Action Required** (after verifying components work):
```powershell
Remove-Item components -Recurse -Force
```

---

## 📋 Summary Checklist

### Critical (Do First):
- [ ] Move `components/` → `app/components/`
- [ ] Move `hooks/` → `app/utils/hooks/`
- [ ] Update all import paths in moved files
- [ ] Update `package.json` (remove expo-router, add MMKV)
- [ ] Update `app.json` (remove expo-router plugin)
- [ ] Update `tsconfig.json` paths
- [ ] Update `package.json` main entry
- [ ] Handle OAuth callback screen

### Important (Do Next):
- [ ] Update storage calls to synchronous (remove await)
- [ ] Test web build
- [ ] Test Android build

### Cleanup (Do Last):
- [ ] Remove old `app/(tabs)/` directory
- [ ] Remove old `app/(auth)/` directory
- [ ] Remove old `app/_layout*.tsx` files
- [ ] Remove old `app/index.tsx`
- [ ] Remove old `lib/` directory
- [ ] Remove old `hooks/` directory
- [ ] Remove old `components/` directory

---

## 🚨 Breaking Changes to Watch For

1. **Storage is now synchronous** - Remove all `await` from storage calls
2. **Navigation API changed** - Use `navigation.navigate()` instead of `router.push()`
3. **Import paths changed** - `@/lib/*` → `@/services/*`
4. **Entry point changed** - `expo-router/entry` → `index.js`

---

## 📝 Quick Start Commands

```powershell
# 1. Move directories
Move-Item components app/components -Force
New-Item -ItemType Directory -Force -Path app/utils/hooks
Move-Item hooks/* app/utils/hooks/ -Force

# 2. Update dependencies
npm uninstall expo-router @react-native-async-storage/async-storage
npx expo install react-native-mmkv

# 3. Update config files (manual edits needed)
# - package.json: change main to "index.js"
# - app.json: remove expo-router plugin
# - tsconfig.json: update paths

# 4. Test
npm install
npx expo start --web
```

