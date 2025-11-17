import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useServiceWorker, usePWAInstall } from '@/hooks/useServiceWorker';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import '../global.css';

// Note: SplashScreen and StatusBar are handled in _layout.native.tsx for native platforms
// On web, we don't use expo-splash-screen or expo-status-bar to avoid module registration issues

// Prevent SSR hydration issues
export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const onIndexRoute = !segments[0] || segments[0] === 'index';

    console.log('Root layout navigation:', {
      isAuthenticated,
      isLoading,
      segments,
      inAuthGroup,
      inTabsGroup,
      onIndexRoute,
    });

    // Don't redirect if on index route - it handles its own navigation
    if (onIndexRoute) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth flow
      console.log('Redirecting to login - not authenticated');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      console.log('Redirecting to tabs - authenticated');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  // Load Ionicons font
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  // Register service worker for PWA functionality
  useServiceWorker();
  usePWAInstall();

  // Note: SplashScreen hiding is handled in _layout.native.tsx
  // On web, we just show the LoadingScreen component instead

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return <LoadingScreen message="Initializing app..." />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
