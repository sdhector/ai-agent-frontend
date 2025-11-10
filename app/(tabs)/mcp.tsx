import { View, Alert } from 'react-native';
import { useState } from 'react';
import { useMCPServers } from '@/hooks/useMCPServers';
import { MCPServerList } from '@/components/mcp/MCPServerList';
import { MCPToolExecutor } from '@/components/mcp/MCPToolExecutor';
import type { MCPTool } from '@/types/mcp';

export default function MCPScreen() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedServerName, setSelectedServerName] = useState<string>('');
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [showToolExecutor, setShowToolExecutor] = useState(false);

  const {
    servers,
    isLoading,
    isConnecting,
    isExecuting,
    connectServer,
    disconnectServer,
    deleteServer,
    fetchTools,
    executeTool,
    refresh,
  } = useMCPServers({
    autoFetch: true,
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleViewTools = async (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (!server) return;

    setSelectedServerId(serverId);
    setSelectedServerName(server.name);
    setIsLoadingTools(true);
    setShowToolExecutor(true);

    try {
      const fetchedTools = await fetchTools(serverId);
      setTools(fetchedTools);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch tools: ${(error as Error).message}`);
      setShowToolExecutor(false);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleCloseToolExecutor = () => {
    setShowToolExecutor(false);
    setSelectedServerId(null);
    setSelectedServerName('');
    setTools([]);
  };

  const handleExecuteTool = async (
    serverId: string,
    toolName: string,
    args: Record<string, any>
  ) => {
    return await executeTool({ serverId, toolName, arguments: args });
  };

  return (
    <View className="flex-1 bg-white">
      <MCPServerList
        servers={servers}
        isLoading={isLoading}
        onConnect={connectServer}
        onDisconnect={disconnectServer}
        onDelete={deleteServer}
        onViewTools={handleViewTools}
        onRefresh={refresh}
        disabled={isConnecting || isExecuting}
      />

      {selectedServerId && (
        <MCPToolExecutor
          visible={showToolExecutor}
          serverId={selectedServerId}
          serverName={selectedServerName}
          tools={tools}
          isLoading={isLoadingTools}
          onClose={handleCloseToolExecutor}
          onExecute={handleExecuteTool}
        />
      )}
    </View>
  );
}
