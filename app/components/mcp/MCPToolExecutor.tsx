import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { MCPTool } from '../../../types/mcp';

export interface MCPToolExecutorProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  tools: MCPTool[];
  isLoading: boolean;
  onClose: () => void;
  onExecute: (serverId: string, toolName: string, args: Record<string, any>) => Promise<any>;
}

export function MCPToolExecutor({
  visible,
  serverId,
  serverName,
  tools,
  isLoading,
  onClose,
  onExecute,
}: MCPToolExecutorProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [arguments_map, setArgumentsMap] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setSelectedTool(null);
      setArgumentsMap({});
      setResult(null);
    }
  }, [visible]);

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setResult(null);

    // Initialize arguments with empty strings
    const initialArgs: Record<string, string> = {};
    if (tool.inputSchema.properties) {
      Object.keys(tool.inputSchema.properties).forEach((key) => {
        initialArgs[key] = '';
      });
    }
    setArgumentsMap(initialArgs);
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    setResult(null);

    try {
      // Convert string values to appropriate types based on schema
      const args: Record<string, any> = {};
      Object.entries(arguments_map).forEach(([key, value]) => {
        const prop = selectedTool.inputSchema.properties[key];
        if (prop && prop.type === 'number') {
          args[key] = value ? parseFloat(value) : undefined;
        } else if (prop && prop.type === 'boolean') {
          args[key] = value === 'true';
        } else {
          args[key] = value;
        }
      });

      const executionResult = await onExecute(serverId, selectedTool.name, args);
      setResult(executionResult);
    } catch (error) {
      Alert.alert('Execution Failed', (error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleBack = () => {
    setSelectedTool(null);
    setResult(null);
  };

  const renderToolList = () => (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Available Tools
        </Text>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="text-gray-600 mt-4">Loading tools...</Text>
          </View>
        ) : tools.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-600">No tools available for this server.</Text>
          </View>
        ) : (
          tools.map((tool, index) => (
            <TouchableOpacity
              key={`${tool.name}-${index}`}
              onPress={() => handleSelectTool(tool)}
              className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200"
            >
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                {tool.name}
              </Text>
              <Text className="text-sm text-gray-600">{tool.description}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderToolExecutor = () => {
    if (!selectedTool) return null;

    const requiredFields = selectedTool.inputSchema.required || [];

    return (
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header with back button */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={handleBack} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 flex-1">
              {selectedTool.name}
            </Text>
          </View>

          <Text className="text-sm text-gray-600 mb-6">
            {selectedTool.description}
          </Text>

          {/* Input fields */}
          {selectedTool.inputSchema.properties &&
            Object.entries(selectedTool.inputSchema.properties).map(([key, schema]) => {
              const isRequired = requiredFields.includes(key);
              return (
                <View key={key} className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    {key} {isRequired && <Text className="text-red-500">*</Text>}
                  </Text>
                  {schema.description && (
                    <Text className="text-xs text-gray-500 mb-2">
                      {schema.description}
                    </Text>
                  )}
                  <TextInput
                    value={arguments_map[key] || ''}
                    onChangeText={(text) =>
                      setArgumentsMap((prev) => ({ ...prev, [key]: text }))
                    }
                    placeholder={`Enter ${key}`}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    keyboardType={schema.type === 'number' ? 'numeric' : 'default'}
                  />
                </View>
              );
            })}

          {/* Execute button */}
          <TouchableOpacity
            onPress={handleExecute}
            disabled={isExecuting}
            className={`flex-row items-center justify-center py-3 rounded-lg mt-4 ${
              isExecuting ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            {isExecuting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Execute Tool</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Result */}
          {result && (
            <View className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Result:</Text>
              <ScrollView className="max-h-60">
                <Text className="text-sm text-gray-900 font-mono">
                  {JSON.stringify(result, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">{serverName}</Text>
            <Text className="text-sm text-gray-600">MCP Tools</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTool ? renderToolExecutor() : renderToolList()}
      </View>
    </Modal>
  );
}

