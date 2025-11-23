/**
 * SettingsScreen - Ignite Boilerplate Migration
 * 
 * Migrated from app/(tabs)/settings.tsx
 * Updated imports to use app/services and app/components
 */
import { View, Text, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
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
              // @ts-ignore - navigation typing
              navigation.navigate('Login');
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

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoggingOut}
          variant="outline"
          className="w-full"
        />
      </View>
    </ScrollView>
  );
}

