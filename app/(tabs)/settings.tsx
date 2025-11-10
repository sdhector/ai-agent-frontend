import { View, Text, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { APP_NAME, APP_VERSION, API_BASE_URL } from '@/lib/constants';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Settings
        </Text>

        {/* User Info */}
        {user && (
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Account
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {user.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {user.email}
            </Text>
          </View>
        )}

        {/* App Information */}
        <View className="bg-gray-50 p-4 rounded-lg mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            App Information
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Name: {APP_NAME}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Version: {APP_VERSION}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            Backend: {API_BASE_URL}
          </Text>
        </View>

        {/* Migration Status */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Migration Status
          </Text>
          <Text className="text-sm text-gray-600">
            Phase 1: ✅ Backend Separated
          </Text>
          <Text className="text-sm text-gray-600">
            Phase 2: ✅ Frontend PoC Created
          </Text>
          <Text className="text-sm text-gray-600">
            Phase 3: ✅ Core Features Implemented
          </Text>
          <Text className="text-sm text-gray-600">
            Phase 4: ✅ MCP Integration Complete
          </Text>
          <Text className="text-sm text-gray-600">
            Phase 5-8: 🚧 Pending
          </Text>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoggingOut}
          variant="outline"
          className="w-full"
        />

        <Text className="text-xs text-gray-500 mt-8 text-center">
          Additional settings will be added in future phases
        </Text>
      </View>
    </ScrollView>
  );
}
