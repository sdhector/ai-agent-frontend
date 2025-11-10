import { useState, useCallback, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  MCPServer,
  MCPTool,
  ServerListResponse,
  ConnectServerResponse,
  ToolsResponse,
  ExecuteToolRequest,
  ExecuteToolResponse,
  OAuthCallbackRequest,
} from '@/types/mcp';

export interface UseMCPServersOptions {
  autoFetch?: boolean;
  onError?: (error: Error) => void;
}

export interface UseMCPServersReturn {
  servers: MCPServer[];
  isLoading: boolean;
  isConnecting: boolean;
  isExecuting: boolean;
  fetchServers: () => Promise<void>;
  connectServer: (serverId: string) => Promise<void>;
  disconnectServer: (serverId: string) => Promise<void>;
  deleteServer: (serverId: string) => Promise<void>;
  fetchTools: (serverId: string) => Promise<MCPTool[]>;
  executeTool: (request: ExecuteToolRequest) => Promise<any>;
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMCPServers(options: UseMCPServersOptions = {}): UseMCPServersReturn {
  const { autoFetch = true, onError } = options;

  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  /**
   * Fetch all MCP servers from backend
   * Backend auto-provisions default servers (Gmail, Drive, Tasks, Calendar)
   */
  const fetchServers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ServerListResponse>(API_ENDPOINTS.MCP.SERVERS);
      const data = await response.json();

      if (data.success && data.servers) {
        setServers(data.servers);
      } else {
        throw new Error('Failed to fetch servers');
      }
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  /**
   * Connect to MCP server
   * Handles OAuth flow if required
   */
  const connectServer = useCallback(async (serverId: string) => {
    setIsConnecting(true);
    try {
      const response = await apiClient.post<ConnectServerResponse>(
        API_ENDPOINTS.MCP.CONNECT(serverId),
        {}
      );
      const data = await response.json();

      if (data.success) {
        if (data.requiresAuth && data.authorizationUrl) {
          // Open OAuth flow
          if (Platform.OS === 'web') {
            // Web: Redirect to OAuth URL
            window.location.href = data.authorizationUrl;
          } else {
            // Native: Use expo-web-browser
            const result = await WebBrowser.openAuthSessionAsync(
              data.authorizationUrl,
              // Callback URL will be handled by deep linking
              null as any
            );

            if (result.type === 'success' && result.url) {
              // Extract code and state from callback URL
              const url = new URL(result.url);
              const code = url.searchParams.get('code');
              const state = url.searchParams.get('state');

              if (code && state) {
                await handleOAuthCallback(code, state);
              }
            }
          }
        } else {
          // Connected without OAuth
          await fetchServers();
        }
      } else {
        throw new Error(data.message || 'Failed to connect');
      }
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchServers, onError]);

  /**
   * Handle OAuth callback after authorization
   */
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.MCP.OAUTH_CALLBACK,
        { code, state } as OAuthCallbackRequest
      );
      const data = await response.json();

      if (data.success) {
        // Refresh server list to get updated status
        await fetchServers();
      } else {
        throw new Error(data.error || 'OAuth callback failed');
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [fetchServers, onError]);

  /**
   * Disconnect from MCP server
   */
  const disconnectServer = useCallback(async (serverId: string) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.MCP.DISCONNECT(serverId),
        {}
      );
      const data = await response.json();

      if (data.success) {
        // Update local state
        setServers((prev) =>
          prev.map((server) =>
            server.id === serverId ? { ...server, status: 'disconnected' } : server
          )
        );
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting MCP server:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Delete MCP server
   */
  const deleteServer = useCallback(async (serverId: string) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MCP.SERVER(serverId));
      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setServers((prev) => prev.filter((server) => server.id !== serverId));
      } else {
        throw new Error('Failed to delete server');
      }
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Fetch tools available for a connected server
   */
  const fetchTools = useCallback(async (serverId: string): Promise<MCPTool[]> => {
    try {
      const response = await apiClient.get<ToolsResponse>(
        API_ENDPOINTS.MCP.TOOLS(serverId)
      );
      const data = await response.json();

      if (data.success && data.tools) {
        return data.tools;
      } else {
        throw new Error('Failed to fetch tools');
      }
    } catch (error) {
      console.error('Error fetching MCP tools:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Execute MCP tool
   */
  const executeTool = useCallback(async (request: ExecuteToolRequest): Promise<any> => {
    setIsExecuting(true);
    try {
      const response = await apiClient.post<ExecuteToolResponse>(
        API_ENDPOINTS.MCP.EXECUTE,
        request
      );
      const data = await response.json();

      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error || 'Failed to execute tool');
      }
    } catch (error) {
      console.error('Error executing MCP tool:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [onError]);

  /**
   * Refresh server list (alias for fetchServers)
   */
  const refresh = useCallback(() => fetchServers(), [fetchServers]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchServers();
    }
  }, [autoFetch, fetchServers]);

  return {
    servers,
    isLoading,
    isConnecting,
    isExecuting,
    fetchServers,
    connectServer,
    disconnectServer,
    deleteServer,
    fetchTools,
    executeTool,
    handleOAuthCallback,
    refresh,
  };
}
