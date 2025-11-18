import { View, Text, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { APP_NAME } from '@/lib/constants';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      // On web, this will redirect
      // On native, we'll handle the callback
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        'Unable to complete login. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="w-full max-w-md">
        <Text className="text-4xl font-bold text-primary-500 mb-2 text-center">
          {APP_NAME}
        </Text>

        <Text className="text-base text-gray-600 mb-12 text-center">
          Your AI assistant for intelligent conversations
        </Text>

        <View className="bg-gray-50 p-6 rounded-lg mb-6">
          <Text className="text-sm text-gray-700 mb-4">
            Sign in with your Google account to:
          </Text>
          <Text className="text-sm text-gray-600 mb-2">• Save your conversations</Text>
          <Text className="text-sm text-gray-600 mb-2">• Access from any device</Text>
          <Text className="text-sm text-gray-600 mb-2">• Connect to external tools (Gmail, Drive, Calendar)</Text>
        </View>

        <Button
          title="Sign in with Google"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          className="w-full"
        />

        <Text className="text-xs text-gray-500 mt-6 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
