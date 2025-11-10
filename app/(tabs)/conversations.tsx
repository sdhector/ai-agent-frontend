import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConversations } from '@/hooks/useConversations';

export default function ConversationsScreen() {
  const router = useRouter();
  const {
    conversations,
    isLoading,
    error,
    fetchConversations,
    deleteConversation,
  } = useConversations();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleDeleteConversation = (id: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteConversation(id);
            if (!success) {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const handleOpenConversation = (id: string) => {
    // Navigate to chat with conversation ID
    router.push({
      pathname: '/(tabs)/',
      params: { conversationId: id },
    });
  };

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-lg text-gray-700 mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={fetchConversations}
          className="mt-4 px-6 py-3 bg-primary-500 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (conversations.length === 0 && !isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">
          No Conversations Yet
        </Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">
          Start a new conversation in the Chat tab
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOpenConversation(item.id)}
            className="px-4 py-4 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-4">
                <Text
                  className="text-base font-semibold text-gray-900 mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-sm text-gray-600 mb-2"
                  numberOfLines={2}
                >
                  {item.lastMessage}
                </Text>
                <Text className="text-xs text-gray-400">
                  {new Date(item.updatedAt).toLocaleDateString()} • {item.messageCount} messages
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteConversation(item.id, item.title)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
