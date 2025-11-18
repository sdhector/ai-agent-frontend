import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/constants';
import { fetchCSRFToken } from '@/lib/csrf';
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
        console.log('[AUTH] No token found, skipping auth check');
        setIsLoading(false);
        setUser(null);
        return;
      }

      console.log('[AUTH] Token found, checking auth status');

      // Try to get cached user data first
      const userId = await getUserId();
      const userEmail = await getUserEmail();
      const userName = await getUserName();
      const userPicture = await getUserPicture();

      // Try to fetch CSRF token from backend (this sets the cookie)
      // Only on web platform where CSRF tokens are needed
      // Use a single retry with timeout
      if (Platform.OS === 'web') {
        try {
          // Add timeout to CSRF fetch (5 seconds max)
          const csrfPromise = fetchCSRFToken(API_BASE_URL);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('CSRF fetch timeout')), 5000)
          );

          await Promise.race([csrfPromise, timeoutPromise]);
          console.log('[AUTH] CSRF token fetched successfully');
        } catch (csrfError) {
          console.warn('[AUTH] CSRF token fetch failed, will use cached data if available:', csrfError);

          // If we have cached user data, use it and continue
          if (userId && userEmail && userName) {
            setUser({
              id: userId,
              email: userEmail,
              name: userName,
              picture: userPicture || undefined,
            });
            setIsLoading(false);
            console.log('[AUTH] Using cached user data (backend unreachable)');
            return;
          } else {
            // No cached data and backend unreachable - clear and show login
            console.warn('[AUTH] No cached data and backend unreachable - showing login');
            await clearUserData();
            setUser(null);
            setIsLoading(false);
            return;
          }
        }
      }

      // Try to verify with backend (with timeout)
      try {
        console.log('[AUTH] Fetching user data from backend:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.STATUS}`);

        // Add 10 second timeout to auth status check
        const authPromise = apiClient.get(API_ENDPOINTS.AUTH.STATUS);
        const timeoutPromise = new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Auth status timeout')), 10000)
        );

        const response = await Promise.race([authPromise, timeoutPromise]);
        console.log('[AUTH] Auth status response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[AUTH] Auth status response data:', data);

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

            console.log('[AUTH] User data verified and saved to storage');
          } else {
            console.warn('[AUTH] No user data in response');
            await clearUserData();
            setUser(null);
          }
        } else if (response.status === 401 || response.status === 403) {
          // Only clear on actual auth failures
          console.warn('[AUTH] Auth check failed with 401/403 - token invalid, clearing data');
          await clearUserData();
          setUser(null);
        } else {
          // Other errors (5xx, network) - use cached data if available
          console.warn('[AUTH] Auth status check failed with status:', response.status);
          if (userId && userEmail && userName) {
            console.log('[AUTH] Using cached user data due to backend error');
            setUser({
              id: userId,
              email: userEmail,
              name: userName,
              picture: userPicture || undefined,
            });
          } else {
            await clearUserData();
            setUser(null);
          }
        }
      } catch (fetchError) {
        console.warn('[AUTH] Backend fetch error:', fetchError);

        // Use cached data if available
        if (userId && userEmail && userName) {
          console.log('[AUTH] Using cached user data due to fetch error');
          setUser({
            id: userId,
            email: userEmail,
            name: userName,
            picture: userPicture || undefined,
          });
        } else {
          console.log('[AUTH] No cached data available, clearing auth data');
          await clearUserData();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[AUTH] Unexpected error in checkAuthStatus:', error);
      // Always clear on unexpected errors to prevent hanging
      await clearUserData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (Platform.OS === 'web') {
      // Web: Use full page redirect
      // The backend should redirect to the root URL with a token parameter
      // Our index.tsx will catch it and process the token
      const callbackUrl = `${window.location.origin}`;
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
