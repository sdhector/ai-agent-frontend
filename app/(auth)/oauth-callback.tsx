import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveToken } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { token: routeToken } = useLocalSearchParams<{ token?: string }>();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        let token = routeToken;

        // On web, also check URL parameters directly (in case of full page redirect)
        if (Platform.OS === 'web' && !token) {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          token = urlParams.get('token') || hashParams.get('token') || undefined;
          
          console.log('OAuth callback - checking URL:', {
            search: window.location.search,
            hash: window.location.hash,
            foundToken: !!token,
          });
        }

        if (token && typeof token === 'string') {
          console.log('OAuth callback - token received, saving...');
          
          // Save token
          await saveToken(token);

          // Check auth status to load user data
          console.log('OAuth callback - checking auth status...');
          await checkAuthStatus();

          // Redirect to main app
          console.log('OAuth callback - redirecting to main app');
          router.replace('/(tabs)');
        } else {
          // No token, redirect to login
          console.warn('OAuth callback - no token found in URL');
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
  }, [routeToken, checkAuthStatus, router]);

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
