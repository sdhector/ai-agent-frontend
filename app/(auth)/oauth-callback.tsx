import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveToken } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    handleCallback();
  }, [token]);

  const handleCallback = async () => {
    try {
      if (token && typeof token === 'string') {
        // Save token
        await saveToken(token);

        // Check auth status to load user data
        await checkAuthStatus();

        // Redirect to main app
        router.replace('/(tabs)');
      } else {
        // No token, redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#0284c7" />
      <Text className="text-gray-600 mt-4">Completing sign in...</Text>
    </View>
  );
}
