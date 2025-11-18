import { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { saveToken } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Root index route handler
 * This catches OAuth redirects that land on the root path with a token parameter
 * and handles authentication directly
 */
export default function Index() {
  const router = useRouter();
  const { checkAuthStatus, isAuthenticated, isLoading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // On web, check if there's a token in the URL (OAuth callback)
      if (Platform.OS === 'web') {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = urlParams.get('token') || hashParams.get('token');

        if (token) {
          console.log('Root index - OAuth token detected, processing...');
          try {
            // Save token
            await saveToken(token);
            
            // Check auth status to load user data
            await checkAuthStatus();
            
            // Clean up URL (remove token from URL bar)
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to main app
            console.log('Root index - redirecting to main app');
            router.replace('/(tabs)');
            return;
          } catch (error) {
            console.error('Root index - error processing token:', error);
            router.replace('/(auth)/login');
            return;
          }
        }
      }

      // No token, check if already authenticated
      setProcessing(false);
      
      if (!authLoading) {
        if (isAuthenticated) {
          console.log('Root index - already authenticated, redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('Root index - not authenticated, redirecting to login');
          router.replace('/(auth)/login');
        }
      }
    };

    handleAuth();
  }, [router, checkAuthStatus, isAuthenticated, authLoading]);

  // Show loading state while processing
  if (processing || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return null;
}
