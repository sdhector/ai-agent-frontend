import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Root index route handler
 * This catches OAuth redirects that land on the root path with a token parameter
 * and redirects them to the proper oauth-callback route
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // On web, check if there's a token in the URL (OAuth callback)
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = urlParams.get('token') || hashParams.get('token');

      if (token) {
        console.log('Root index - OAuth token detected, redirecting to callback...');
        // Redirect to the oauth-callback route with the token
        router.replace(`/(auth)/oauth-callback?token=${token}`);
        return;
      }
    }

    // No token, just redirect to auth or tabs based on auth status
    // This will be handled by the root layout's auth guard
    console.log('Root index - no token, redirecting to login...');
    router.replace('/(auth)/login');
  }, [router]);

  return null;
}
