import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { MCPServer } from '@/types/mcp';

export interface MCPServerCardProps {
  server: MCPServer;
  onConnect: (serverId: string) => Promise<void>;
  onDisconnect: (serverId: string) => Promise<void>;
  onDelete: (serverId: string) => Promise<void>;
  onViewTools: (serverId: string) => void;
  disabled?: boolean;
}

export function MCPServerCard({
  server,
  onConnect,
  onDisconnect,
  onDelete,
  onViewTools,
  disabled = false,
}: MCPServerCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = server.status === 'connected';
  const isDisconnected = server.status === 'disconnected';
  const hasError = server.status === 'error';

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect(server.id);
    } catch (error) {
      Alert.alert('Connection Failed', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect',
      `Are you sure you want to disconnect from ${server.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDisconnect(server.id);
            } catch (error) {
              Alert.alert('Disconnect Failed', (error as Error).message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Server',
      `Are you sure you want to delete ${server.name}? This will remove all associated tools and data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDelete(server.id);
            } catch (error) {
              Alert.alert('Delete Failed', (error as Error).message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const statusColor = isConnected
    ? 'bg-green-100 border-green-500'
    : hasError
    ? 'bg-red-100 border-red-500'
    : 'bg-gray-100 border-gray-300';

  const statusTextColor = isConnected
    ? 'text-green-700'
    : hasError
    ? 'text-red-700'
    : 'text-gray-700';

  const statusIcon = isConnected
    ? 'checkmark-circle'
    : hasError
    ? 'alert-circle'
    : 'ellipse-outline';

  const statusIconColor = isConnected ? '#16a34a' : hasError ? '#dc2626' : '#6b7280';

  return (
    <View className={`border-2 rounded-lg p-4 mb-3 ${statusColor}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <Ionicons name={statusIcon as any} size={24} color={statusIconColor} />
          <Text className="text-lg font-semibold text-gray-900 ml-2 flex-1">
            {server.name}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={disabled || isLoading}
          className="p-2"
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text className={`text-sm font-medium mb-2 ${statusTextColor}`}>
        Status: {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
      </Text>

      {/* URL */}
      <Text className="text-xs text-gray-600 mb-3" numberOfLines={1}>
        {server.url}
      </Text>

      {/* Actions */}
      <View className="flex-row gap-2">
        {isDisconnected && (
          <TouchableOpacity
            onPress={handleConnect}
            disabled={disabled || isLoading}
            className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
              disabled || isLoading ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="link-outline" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Connect</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isConnected && (
          <>
            <TouchableOpacity
              onPress={() => onViewTools(server.id)}
              disabled={disabled || isLoading}
              className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
                disabled || isLoading ? 'bg-gray-300' : 'bg-green-600'
              }`}
            >
              <Ionicons name="construct-outline" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Tools</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDisconnect}
              disabled={disabled || isLoading}
              className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
                disabled || isLoading ? 'bg-gray-300' : 'bg-gray-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="unlink-outline" size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Disconnect</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {hasError && (
          <TouchableOpacity
            onPress={handleConnect}
            disabled={disabled || isLoading}
            className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-md ${
              disabled || isLoading ? 'bg-gray-300' : 'bg-orange-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Retry</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
