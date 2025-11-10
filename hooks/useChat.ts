import { useState, useCallback } from 'react';
import { MessageData } from '@/components/chat/Message';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS, DEFAULT_MODEL, DEFAULT_PROVIDER } from '@/lib/constants';

export interface UseChatOptions {
  conversationId?: string;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    options.conversationId
  );

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: MessageData = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare request body
      const requestBody = {
        message: content.trim(),
        provider: DEFAULT_PROVIDER,
        model: selectedModel,
        conversationId: currentConversationId,
      };

      // Send request to backend
      const response = await apiClient.post(API_ENDPOINTS.AI.CHAT, requestBody);

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let assistantMessageId = (Date.now() + 1).toString();
      let accumulatedContent = '';

      // Add initial assistant message
      const assistantMessage: MessageData = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Read stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle conversation ID
              if (parsed.conversationId && !currentConversationId) {
                setCurrentConversationId(parsed.conversationId);
              }

              // Handle content delta
              if (parsed.delta) {
                accumulatedContent += parsed.delta;

                // Update assistant message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: MessageData = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      if (options.onError) {
        options.onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedModel, currentConversationId, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(undefined);
  }, []);

  const loadConversation = useCallback((conversationMessages: MessageData[], conversationId: string) => {
    setMessages(conversationMessages);
    setCurrentConversationId(conversationId);
  }, []);

  return {
    messages,
    isLoading,
    selectedModel,
    setSelectedModel,
    conversationId: currentConversationId,
    sendMessage,
    clearMessages,
    loadConversation,
  };
}
