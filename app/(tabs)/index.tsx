import { View, Alert } from 'react-native';
import { useState } from 'react';
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
  } = useChat({
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  if (!isAuthenticated) {
    return null; // Will be redirected by root layout
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with model selector */}
      <View className="px-4 py-3 border-b border-gray-200 bg-white">
        <ProviderSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
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
