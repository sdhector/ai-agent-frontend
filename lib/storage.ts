import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// Platform-specific storage interface
interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web storage implementation
const webStorage: StorageInterface = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

// Native storage implementation using AsyncStorage only (SecureStore causes web bundle issues)
const nativeStorage: StorageInterface = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

// Select storage based on platform
const storage: StorageInterface = Platform.OS === 'web' 
  ? webStorage 
  : nativeStorage;

// Helper functions for common storage operations
export const saveToken = (token: string) => storage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
export const getToken = () => storage.getItem(STORAGE_KEYS.JWT_TOKEN);
export const removeToken = () => storage.removeItem(STORAGE_KEYS.JWT_TOKEN);

export const saveUserId = (userId: string) => storage.setItem(STORAGE_KEYS.USER_ID, userId);
export const getUserId = () => storage.getItem(STORAGE_KEYS.USER_ID);
export const removeUserId = () => storage.removeItem(STORAGE_KEYS.USER_ID);

export const saveUserEmail = (email: string) => storage.setItem(STORAGE_KEYS.USER_EMAIL, email);
export const getUserEmail = () => storage.getItem(STORAGE_KEYS.USER_EMAIL);

export const saveUserName = (name: string) => storage.setItem(STORAGE_KEYS.USER_NAME, name);
export const getUserName = () => storage.getItem(STORAGE_KEYS.USER_NAME);

export const saveUserPicture = (picture: string) => storage.setItem(STORAGE_KEYS.USER_PICTURE, picture);
export const getUserPicture = () => storage.getItem(STORAGE_KEYS.USER_PICTURE);

export const clearUserData = async () => {
  await removeToken();
  await removeUserId();
  await storage.removeItem(STORAGE_KEYS.USER_EMAIL);
  await storage.removeItem(STORAGE_KEYS.USER_NAME);
  await storage.removeItem(STORAGE_KEYS.USER_PICTURE);
};

// Export storage for direct use if needed
export default storage;
