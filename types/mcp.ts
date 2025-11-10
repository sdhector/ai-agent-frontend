export interface MCPServer {
  id: string;
  name: string;
  url: string;
  auth_type: 'oauth' | 'authless';
  status: 'connected' | 'disconnected' | 'error';
  created_at: string;
  updated_at: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  cachedAt?: string;
}

export interface MCPServerWithTools extends MCPServer {
  tools?: MCPTool[];
}

export interface ConnectServerResponse {
  success: boolean;
  requiresAuth?: boolean;
  authorizationUrl?: string;
  message?: string;
}

export interface ServerListResponse {
  success: boolean;
  servers: MCPServer[];
}

export interface ToolsResponse {
  success: boolean;
  tools: MCPTool[];
  cached?: boolean;
}

export interface ExecuteToolRequest {
  serverId: string;
  toolName: string;
  arguments: Record<string, any>;
}

export interface ExecuteToolResponse {
  success: boolean;
  result: any;
  error?: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  message?: string;
  error?: string;
  server?: {
    id: string;
    name: string;
    status: string;
  };
}
