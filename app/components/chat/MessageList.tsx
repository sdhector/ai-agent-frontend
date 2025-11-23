import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Message, MessageData } from './Message';

interface MessageListProps {
  messages: MessageData[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl mb-2">👋</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          Start a Conversation
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Ask me anything! I'm here to help with coding, writing, analysis, and more.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 px-4 py-4"
      contentContainerStyle={{ paddingBottom: 16 }}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
        <View className="items-start mb-4">
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-600">Thinking...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

