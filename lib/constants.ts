import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

  return url || 'http://localhost:8080';
};

const rawApiUrl = Platform.select({
  web: envApiUrl || expoConfigApiUrl || 'http://localhost:8080',
  default: envApiUrl || 'http://localhost:8080',
  // For local development with Android emulator:
  // android: 'http://10.0.2.2:8080',
});

export const API_BASE_URL = validateApiUrl(rawApiUrl);

// Log the API URL for debugging
console.log('API Configuration:', {
  platform: Platform.OS,
  environment: isProduction ? 'production' : 'development',
  envApiUrl,
  expoConfigApiUrl,
  API_BASE_URL,
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
