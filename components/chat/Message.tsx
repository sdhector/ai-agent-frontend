import React from 'react';
import { View, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';

export interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MessageProps {
  message: MessageData;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`
          max-w-[80%] p-4 rounded-lg
          ${isUser ? 'bg-primary-500' : 'bg-gray-100'}
        `}
      >
        {isUser ? (
          <Text className="text-white text-base">{message.content}</Text>
        ) : (
          <Markdown
            style={{
              body: { color: '#374151', fontSize: 16 },
              code_inline: {
                backgroundColor: '#e5e7eb',
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
              },
              code_block: {
                backgroundColor: '#1f2937',
                padding: 12,
                borderRadius: 8,
              },
              fence: {
                backgroundColor: '#1f2937',
                padding: 12,
                borderRadius: 8,
              },
            }}
          >
            {message.content}
          </Markdown>
        )}

        {message.isStreaming && (
          <View className="mt-2">
            <Text className="text-gray-400 text-xs">Typing...</Text>
          </View>
        )}
      </View>

      <Text className="text-xs text-gray-400 mt-1 px-2">
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}
