/**
 * OAuthCallbackScreen - Handles OAuth redirects
 * 
 * Extracts token from URL and processes authentication
 */
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { saveToken } from '../services/storage';

export function OAuthCallbackScreen() {
  const navigation = useNavigation();
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        if (Platform.OS === 'web') {
          // Extract token from URL
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const token = urlParams.get('token') || hashParams.get('token');

          if (token) {
            console.log('[OAuth] Token detected, processing...');
            // Save token (MMKV is synchronous - no await needed)
            saveToken(token);
            
            // Check auth status to load user data
            await checkAuthStatus();
            
            setStatus('success');
            
            // Navigate to main app after a brief delay
            setTimeout(() => {
              // @ts-ignore - navigation typing
              navigation.navigate('Main');
            }, 1000);
          } else {
            throw new Error('No token found in URL');
          }
        } else {
          // Native: Token should be passed via navigation params
          // This is handled by expo-auth-session in LoginScreen
          // @ts-ignore - navigation typing
          const token = navigation.getState()?.routes?.[navigation.getState()?.index]?.params?.token;
          
          if (token) {
            saveToken(token);
            await checkAuthStatus();
            setStatus('success');
            // @ts-ignore - navigation typing
            navigation.navigate('Main');
          } else {
            throw new Error('No token found');
          }
        }
      } catch (err) {
        console.error('[OAuth] Error processing callback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
        
        // Navigate to login after error
        setTimeout(() => {
          // @ts-ignore - navigation typing
          navigation.navigate('Auth');
        }, 2000);
      }
    };

    handleOAuth();
  }, [navigation, checkAuthStatus]);

  if (status === 'processing') {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-gray-600 mt-4">Processing authentication...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-red-600 text-lg font-semibold mb-2">Authentication Failed</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
        <Text className="text-gray-500 text-sm mt-4">Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-green-600 text-lg font-semibold mb-2">Authentication Successful!</Text>
      <Text className="text-gray-600">Redirecting to app...</Text>
    </View>
  );
}

