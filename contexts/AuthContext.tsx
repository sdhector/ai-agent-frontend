import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/constants';
import {
  saveToken,
  getToken,
  removeToken,
  saveUserId,
  saveUserEmail,
  saveUserName,
  saveUserPicture,
  clearUserData,
  getUserId,
  getUserEmail,
  getUserName,
  getUserPicture,
} from '@/lib/storage';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log('No token found, skipping auth check');
        setIsLoading(false);
        setUser(null);
        return;
      }

      console.log('Token found, checking auth status');

      // Try to get user from storage first
      const userId = await getUserId();
      const userEmail = await getUserEmail();
      const userName = await getUserName();
      const userPicture = await getUserPicture();

      if (userId && userEmail && userName) {
        console.log('User data loaded from storage');
        setUser({
          id: userId,
          email: userEmail,
          name: userName,
          picture: userPicture || undefined,
        });
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      console.log('Fetching user data from backend:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.STATUS}`);
      const response = await apiClient.get(API_ENDPOINTS.AUTH.STATUS);
      
      console.log('Auth status response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth status response data:', data);
        
        if (data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            picture: data.user.picture,
          };
          setUser(userData);

          // Save to storage
          await saveUserId(userData.id);
          await saveUserEmail(userData.email);
          await saveUserName(userData.name);
          if (userData.picture) await saveUserPicture(userData.picture);
          
          console.log('User data saved to storage');
        } else {
          console.warn('No user data in response');
          await clearUserData();
          setUser(null);
        }
      } else {
        console.warn('Auth status check failed:', response.status);
        // Token invalid, clear it
        await clearUserData();
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Only clear data if we had a token but got an error
      const token = await getToken();
      if (token) {
        console.log('Clearing user data due to auth error');
        await clearUserData();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (Platform.OS === 'web') {
      // Web: Use full page redirect
      // Add the frontend callback URL so backend knows where to redirect
      const callbackUrl = `${window.location.origin}/(auth)/oauth-callback`;
      const authUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}?redirect_uri=${encodeURIComponent(callbackUrl)}`;
      
      console.log('Redirecting to auth URL:', authUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Callback URL:', callbackUrl);
      
      // Direct redirect to backend OAuth flow
      window.location.href = authUrl;
    } else {
      // Native: Use expo-auth-session
      try {
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'ai-agent',
          path: 'oauth/callback',
        });

        const authUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}?redirect_uri=${encodeURIComponent(redirectUri)}`;

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri
        );

        if (result.type === 'success' && result.url) {
          // Extract token from URL
          const url = new URL(result.url);
          const token = url.searchParams.get('token');

          if (token) {
            await saveToken(token);
            await checkAuthStatus();
          }
        }
      } catch (error) {
        console.error('Error during login:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint (optional)
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}).catch(() => {
        // Ignore errors, we're logging out anyway
      });
    } finally {
      // Clear local data
      await clearUserData();
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
