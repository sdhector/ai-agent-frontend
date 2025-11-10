import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment variables or use default
// In production, EXPO_PUBLIC_API_URL should be set in .env.production
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = Platform.select({
  web: envApiUrl || Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080',
  default: envApiUrl || 'http://localhost:8080',
  // For local development with Android emulator:
  // android: 'http://10.0.2.2:8080',
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
    CHAT: '/api/ai',
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
