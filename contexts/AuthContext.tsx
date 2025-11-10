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
        console.log('No token found, skipping auth check');
        setIsLoading(false);
        setUser(null);
        return;
      }

      console.log('Token found, checking auth status');

      // Try to fetch CSRF token from backend (this sets the cookie)
      // Only on web platform where CSRF tokens are needed
      // Use retry logic for CSRF token fetch
      if (Platform.OS === 'web') {
        let csrfSuccess = false;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            await fetchCSRFToken(API_BASE_URL);
            csrfSuccess = true;
            break;
          } catch (csrfError) {
            console.warn(`[AUTH] CSRF token fetch failed (attempt ${attempt}/${maxRetries}):`, csrfError);

            if (attempt < maxRetries) {
              // Wait before retrying (exponential backoff: 1s, 2s, 4s)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
            }
          }
        }

        // If all retries failed, try to use cached user data
        if (!csrfSuccess) {
          console.warn('[AUTH] Backend not reachable after retries, using cached auth data');
          const userId = await getUserId();
          const userEmail = await getUserEmail();
          const userName = await getUserName();
          const userPicture = await getUserPicture();

          // If we have cached user data, use it temporarily
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
            console.warn('[AUTH] No cached data and backend unreachable - clearing auth');
            await clearUserData();
            setUser(null);
            setIsLoading(false);
            return;
          }
        }
      }

      // Try to get user from storage first - but verify with backend
      const userId = await getUserId();
      const userEmail = await getUserEmail();
      const userName = await getUserName();
      const userPicture = await getUserPicture();

      // Always verify with backend, don't trust cached data alone
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

          console.log('User data verified and saved to storage');
        } else {
          console.warn('No user data in response');
          await clearUserData();
          setUser(null);
        }
      } else if (response.status === 401 || response.status === 403) {
        // Only clear on actual auth failures
        console.warn('Auth check failed with 401/403 - token invalid, clearing data');
        await clearUserData();
        setUser(null);
      } else {
        // Other errors (5xx, network) - keep cached data if available
        console.warn('Auth status check failed with status:', response.status);
        if (userId && userEmail && userName) {
          console.log('Using cached user data due to backend error');
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
    } catch (error) {
      console.error('Error checking auth status:', error);

      // Try to use cached data instead of immediately clearing
      const userId = await getUserId();
      const userEmail = await getUserEmail();
      const userName = await getUserName();
      const userPicture = await getUserPicture();

      if (userId && userEmail && userName) {
        console.log('Using cached user data due to error');
        setUser({
          id: userId,
          email: userEmail,
          name: userName,
          picture: userPicture || undefined,
        });
      } else {
        // No cached data - clear everything
        console.log('No cached data available, clearing auth data');
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
