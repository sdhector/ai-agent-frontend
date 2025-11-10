import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveToken } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          setError('No authentication token received');
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [token, checkAuthStatus, router]);

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      {error ? (
        <>
          <Text className="text-red-500 text-lg mb-2">⚠️ {error}</Text>
          <Text className="text-gray-600">Redirecting to login...</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="text-gray-600 mt-4">Completing sign in...</Text>
        </>
      )}
    </View>
  );
}
