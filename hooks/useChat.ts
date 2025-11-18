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
      // Prepare messages array - include conversation history + new user message
      const userMessageObj = {
        role: 'user',
        content: content.trim(),
      };

      // Build messages array from conversation history
      const messagesArray = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        userMessageObj,
      ];

      // Prepare request body matching backend API requirements
      const requestBody = {
        messages: messagesArray,
        model: selectedModel,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
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
      let hasReceivedContent = false;

      // Add initial assistant message
      const assistantMessage: MessageData = {
        id: assistantMessageId,
        role: 'assistant',
        content: '...',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Read stream
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk and add to buffer (handle incomplete SSE events)
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (!data || data === '[DONE]') {
              if (data === '[DONE]') {
                console.log('[Chat] Received [DONE] signal');
              }
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('[Chat] Received SSE event:', parsed.type || 'unknown', parsed);

              // Handle conversation ID
              if (parsed.conversationId && !currentConversationId) {
                setCurrentConversationId(parsed.conversationId);
              }

              // Handle content chunks - backend sends { type: 'content', text: '...' }
              if (parsed.type === 'content' && parsed.text !== undefined) {
                hasReceivedContent = true;
                accumulatedContent += parsed.text || '';
                console.log('[Chat] Accumulated content length:', accumulatedContent.length, 'text:', parsed.text?.substring(0, 50));

                // Update assistant message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent || '...', isStreaming: true }
                      : msg
                  )
                );
              } 
              // Handle legacy format with delta (for compatibility)
              else if (parsed.delta) {
                accumulatedContent += parsed.delta;
                console.log('[Chat] Accumulated content length (delta):', accumulatedContent.length);

                // Update assistant message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, isStreaming: true }
                      : msg
                  )
                );
              }
              // Handle other event types (status, tool_start, tool_end, etc.)
              else if (parsed.type) {
                if (parsed.type === 'metadata' || parsed.type === 'done') {
                  console.log('[Chat] Received', parsed.type, 'event');
                } else {
                  console.log('[Chat] Received event:', parsed.type, parsed);
                }
              } else {
                console.warn('[Chat] Unknown event format:', parsed);
              }
            } catch (e) {
              console.error('[Chat] Error parsing SSE data:', e, 'Data:', data);
            }
          } else if (line.trim()) {
            // Log non-data lines for debugging
            console.log('[Chat] Non-data line:', line);
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.trim()) {
        console.log('[Chat] Processing remaining buffer:', buffer);
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMessageId) {
            // If no content was received, show an error message
            if (!hasReceivedContent || !accumulatedContent.trim()) {
              console.warn('[Chat] No content received in stream');
              return {
                ...msg,
                content: 'Sorry, I didn\'t receive a response. Please try again.',
                isStreaming: false
              };
            }
            return { ...msg, isStreaming: false };
          }
          return msg;
        })
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
