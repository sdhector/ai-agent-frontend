import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Production backend URL (Cloud Run)
const PRODUCTION_API_URL = 'https://ai-agent-backend-tsgdvcezgq-uc.a.run.app';
const LOCAL_API_URL = 'http://localhost:8080';

// Get API URL from environment variables or use default
// In production, EXPO_PUBLIC_API_URL should be set in .env.production
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const expoConfigApiUrl = Constants.expoConfig?.extra?.apiUrl;
const isDevelopment = __DEV__;
const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';

// Validate API URL configuration
const validateApiUrl = (url: string | undefined): string => {
  // In production, require a valid API URL (not localhost)
  if (isProduction && (!url || url.includes('localhost') || url.includes('127.0.0.1'))) {
    console.error('❌ CRITICAL: Production build missing valid API URL!');
    console.error('EXPO_PUBLIC_API_URL must be set to a valid backend URL');
    console.error('Current value:', url || 'undefined');

    // DON'T throw error - just log it and use localhost as fallback
    // Throwing errors can cause white screen in production
    // The auth flow will handle backend connectivity issues gracefully
  }

  // Warn in development if using default localhost
  if (isDevelopment && !url) {
    console.warn('⚠️  Using default localhost API URL (development mode)');
  }

  return url || LOCAL_API_URL;
};

// Determine primary API URL
const rawApiUrl = Platform.select({
  web: envApiUrl || expoConfigApiUrl || LOCAL_API_URL,
  default: envApiUrl || LOCAL_API_URL,
  // For local development with Android emulator:
  // android: 'http://10.0.2.2:8080',
});

// Primary API URL (validated)
export const API_BASE_URL = validateApiUrl(rawApiUrl);

// Fallback API URL (production backend)
// Used when localhost is not available
export const FALLBACK_API_URL = PRODUCTION_API_URL;

/**
 * Get the effective API URL to use
 * In development with localhost, checks if localhost is reachable
 * Falls back to production URL if localhost is not available
 * In production (APK), always uses the configured production URL
 */
export async function getEffectiveApiUrl(): Promise<string> {
  // If not using localhost, return the configured URL
  if (!API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('127.0.0.1')) {
    return API_BASE_URL;
  }

  // In production builds (APK), if we somehow have localhost, use fallback immediately
  if (!__DEV__ && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    console.warn('[API] Production build detected localhost, using fallback:', FALLBACK_API_URL);
    return FALLBACK_API_URL;
  }

  // In development, check if localhost is reachable
  if (__DEV__) {
    try {
      // Quick health check with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('[API] Local backend is reachable, using:', API_BASE_URL);
        return API_BASE_URL;
      }
    } catch (error) {
      // Localhost not reachable, use fallback
      console.warn('[API] Local backend not reachable, using fallback:', FALLBACK_API_URL);
      return FALLBACK_API_URL;
    }
  }

  return API_BASE_URL;
}

// Log the API URL for debugging
console.log('API Configuration:', {
  platform: Platform.OS,
  environment: isProduction ? 'production' : 'development',
  envApiUrl,
  expoConfigApiUrl,
  API_BASE_URL,
  FALLBACK_API_URL: API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1') ? FALLBACK_API_URL : 'N/A',
  fallbackEnabled: __DEV__ && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')),
  isValid: !API_BASE_URL.includes('localhost') || isDevelopment,
});

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    GOOGLE: '/api/auth/google',
    GOOGLE_CALLBACK: '/api/auth/google/callback',
    STATUS: '/api/auth/status',
    LOGOUT: '/api/auth/logout',
  },
  AI: {
    CHAT: '/api/ai/chat',
    MODELS: '/api/ai/models',
  },
  CONVERSATIONS: {
    LIST: '/api/conversations',
    GET: (id: string) => `/api/conversations/${id}`,
    DELETE: (id: string) => `/api/conversations/${id}`,
  },
  MCP: {
    SERVERS: '/api/mcp/servers',
    SERVER: (serverId: string) => `/api/mcp/servers/${serverId}`,
    CONNECT: (serverId: string) => `/api/mcp/servers/${serverId}/connect`,
    DISCONNECT: (serverId: string) => `/api/mcp/servers/${serverId}/disconnect`,
    TOOLS: (serverId: string) => `/api/mcp/servers/${serverId}/tools`,
    EXECUTE: '/api/mcp/tools/execute',
    OAUTH_CALLBACK: '/api/mcp/oauth/callback',
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  USER_NAME: 'user_name',
  USER_PICTURE: 'user_picture',
  CURRENT_CONVERSATION_ID: 'current_conversation_id',
  THEME: 'theme',
};

// App Configuration
export const APP_NAME = 'AI Assistant';
export const APP_VERSION = '1.0.0';

// AI Models
export const AI_MODELS = [
  { id: 'sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'claude' },
  { id: 'opus-4.1', name: 'Claude Opus 4.1', provider: 'claude' },
  { id: 'haiku-3.5', name: 'Claude Haiku 3.5', provider: 'claude' },
];

// Default Model
export const DEFAULT_MODEL = 'sonnet-4.5';
export const DEFAULT_PROVIDER = 'claude';

