/**
 * Storage Service - MMKV Implementation with Lazy Initialization
 * 
 * Fixed: MMKV crash on app startup caused by creating instance before JSI bridge is ready.
 * Solution: Lazy initialization - only create MMKV instance when first accessed.
 */
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from './constants';

// Lazy MMKV instance - only created when first accessed
let _storage: MMKV | null = null;
let _initializationFailed = false;

/**
 * Get or create the MMKV storage instance.
 * Uses lazy initialization to avoid crash when JSI bridge isn't ready.
 */
function getStorage(): MMKV | null {
  if (_storage) {
    return _storage;
  }

  if (_initializationFailed) {
    return null;
  }

  try {
    _storage = new MMKV({
      id: 'ai-agent-storage',
    });
    console.log('[Storage] MMKV initialized successfully');
    return _storage;
  } catch (error) {
    console.error('[Storage] MMKV initialization failed:', error);
    _initializationFailed = true;
    return null;
  }
}

// Platform-specific storage interface
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Storage implementation with MMKV and localStorage fallback for web
 */
const storageImpl: StorageInterface = {
  getItem(key: string): string | null {
    try {
      // On web, try localStorage as fallback if MMKV fails
      if (Platform.OS === 'web') {
        const storage = getStorage();
        if (storage) {
          return storage.getString(key) || null;
        }
        // Fallback to localStorage on web
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      }

      // On native, use MMKV
      const storage = getStorage();
      if (!storage) {
        console.warn('[Storage] getItem: Storage not available');
        return null;
      }
      return storage.getString(key) || null;
    } catch (error) {
      console.error('[Storage] getItem error:', error);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      // On web, try localStorage as fallback if MMKV fails
      if (Platform.OS === 'web') {
        const storage = getStorage();
        if (storage) {
          storage.set(key, value);
          return;
        }
        // Fallback to localStorage on web
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return;
      }

      // On native, use MMKV
      const storage = getStorage();
      if (!storage) {
        console.warn('[Storage] setItem: Storage not available');
        return;
      }
      storage.set(key, value);
    } catch (error) {
      console.error('[Storage] setItem error:', error);
    }
  },

  removeItem(key: string): void {
    try {
      // On web, try localStorage as fallback if MMKV fails
      if (Platform.OS === 'web') {
        const storage = getStorage();
        if (storage) {
          storage.delete(key);
          return;
        }
        // Fallback to localStorage on web
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return;
      }

      // On native, use MMKV
      const storage = getStorage();
      if (!storage) {
        console.warn('[Storage] removeItem: Storage not available');
        return;
      }
      storage.delete(key);
    } catch (error) {
      console.error('[Storage] removeItem error:', error);
    }
  },
};

// Helper functions for common storage operations
export const saveToken = (token: string) => storageImpl.setItem(STORAGE_KEYS.JWT_TOKEN, token);
export const getToken = () => storageImpl.getItem(STORAGE_KEYS.JWT_TOKEN);
export const removeToken = () => storageImpl.removeItem(STORAGE_KEYS.JWT_TOKEN);

export const saveUserId = (userId: string) => storageImpl.setItem(STORAGE_KEYS.USER_ID, userId);
export const getUserId = () => storageImpl.getItem(STORAGE_KEYS.USER_ID);
export const removeUserId = () => storageImpl.removeItem(STORAGE_KEYS.USER_ID);

export const saveUserEmail = (email: string) => storageImpl.setItem(STORAGE_KEYS.USER_EMAIL, email);
export const getUserEmail = () => storageImpl.getItem(STORAGE_KEYS.USER_EMAIL);

export const saveUserName = (name: string) => storageImpl.setItem(STORAGE_KEYS.USER_NAME, name);
export const getUserName = () => storageImpl.getItem(STORAGE_KEYS.USER_NAME);

export const saveUserPicture = (picture: string) => storageImpl.setItem(STORAGE_KEYS.USER_PICTURE, picture);
export const getUserPicture = () => storageImpl.getItem(STORAGE_KEYS.USER_PICTURE);

export const clearUserData = () => {
  removeToken();
  removeUserId();
  storageImpl.removeItem(STORAGE_KEYS.USER_EMAIL);
  storageImpl.removeItem(STORAGE_KEYS.USER_NAME);
  storageImpl.removeItem(STORAGE_KEYS.USER_PICTURE);
};

/**
 * Check if storage is available and initialized
 */
export const isStorageAvailable = (): boolean => {
  return getStorage() !== null;
};

// Export storage for direct use if needed
export default storageImpl;
