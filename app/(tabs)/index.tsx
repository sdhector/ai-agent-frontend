import { View, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { ProviderSelector } from '@/components/chat/ProviderSelector';
import { MessageData } from '@/components/chat/Message';

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams();
  const { getConversation } = useConversations();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const {
    messages,
    isLoading,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearMessages,
    loadConversation,
  } = useChat({
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  // Load conversation when conversationId param changes
  useEffect(() => {
    const conversationId = params.conversationId as string | undefined;

    if (conversationId) {
      setIsLoadingConversation(true);
      getConversation(conversationId)
        .then((conversation) => {
          if (conversation) {
            // Convert API message format to MessageData format
            const convertedMessages: MessageData[] = conversation.messages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));

            loadConversation(convertedMessages, conversationId);
            console.log('[Chat] Loaded conversation:', conversation.title, 'with', convertedMessages.length, 'messages');
          } else {
            Alert.alert('Error', 'Failed to load conversation');
          }
        })
        .catch((error) => {
          console.error('[Chat] Error loading conversation:', error);
          Alert.alert('Error', 'Failed to load conversation');
        })
        .finally(() => {
          setIsLoadingConversation(false);
        });
    }
  }, [params.conversationId, getConversation, loadConversation]);

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

  // Show loading screen while conversation is being loaded
  if (isLoadingConversation) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Loading conversation...</Text>
      </View>
    );
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
