import { View, Alert, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { ProviderSelector } from '@/components/chat/ProviderSelector';

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
  const {
    messages,
    isLoading,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearMessages,
  } = useChat({
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleNewChat = () => {
    if (messages.length > 0) {
      Alert.alert(
        'New Chat',
        'Start a new conversation? Your current chat will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'New Chat',
            onPress: () => clearMessages(),
          },
        ]
      );
    }
  };

  if (!isAuthenticated) {
    return null; // Will be redirected by root layout
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with model selector */}
      <View className="px-4 py-3 border-b border-gray-200 bg-white flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <ProviderSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading}
          />
        </View>

        {messages.length > 0 && (
          <TouchableOpacity
            onPress={handleNewChat}
            disabled={isLoading}
            className="flex-row items-center px-3 py-2 bg-primary-500 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Ask me anything..."
      />
    </View>
  );
}
