import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationDetail extends Conversation {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST);

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getConversation = useCallback(async (id: string): Promise<ConversationDetail | null> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.GET(id));

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      return data.conversation;
    } catch (err) {
      console.error('Error fetching conversation:', err);
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CONVERSATIONS.DELETE(id));

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Remove from local state
      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return false;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    getConversation,
    deleteConversation,
  };
}
