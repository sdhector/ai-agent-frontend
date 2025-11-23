/**
 * Storage Service - MMKV Implementation (Ignite Standard)
 * 
 * Migrated from AsyncStorage to MMKV for better performance and stability.
 * MMKV is Ignite's preferred storage solution.
 */
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from './constants';

// Create MMKV instance
// On web, MMKV falls back to localStorage automatically
const storage = new MMKV({
  id: 'ai-agent-storage',
  // On web, this will use localStorage
  // On native, this uses native MMKV
});

// Platform-specific storage interface
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Web storage implementation (MMKV handles this automatically, but we keep for compatibility)
const webStorage: StorageInterface = {
  getItem(key: string): string | null {
    try {
      if (Platform.OS === 'web') {
        // MMKV on web uses localStorage, but we can access directly if needed
        return storage.getString(key) || null;
      }
      return storage.getString(key) || null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem(key: string): void {
    try {
      storage.delete(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

// Use MMKV storage (works on both web and native)
const storageImpl: StorageInterface = webStorage;

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

// Export storage for direct use if needed
export default storageImpl;

