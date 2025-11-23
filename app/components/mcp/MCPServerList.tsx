import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { MCPServerCard } from './MCPServerCard';
import type { MCPServer } from '../../../types/mcp';

export interface MCPServerListProps {
  servers: MCPServer[];
  isLoading: boolean;
  onConnect: (serverId: string) => Promise<void>;
  onDisconnect: (serverId: string) => Promise<void>;
  onDelete: (serverId: string) => Promise<void>;
  onViewTools: (serverId: string) => void;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function MCPServerList({
  servers,
  isLoading,
  onConnect,
  onDisconnect,
  onDelete,
  onViewTools,
  onRefresh,
  disabled = false,
}: MCPServerListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && servers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Loading MCP servers...</Text>
      </View>
    );
  }

  if (!isLoading && servers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          No MCP Servers
        </Text>
        <Text className="text-gray-600 text-center">
          No MCP servers available. Pull down to refresh.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={servers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MCPServerCard
          server={item}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
          onViewTools={onViewTools}
          disabled={disabled}
        />
      )}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#0284c7']}
          tintColor="#0284c7"
        />
      }
    />
  );
}

