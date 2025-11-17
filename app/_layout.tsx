import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useServiceWorker, usePWAInstall } from '@/hooks/useServiceWorker';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import '../global.css';

// Only use SplashScreen on native platforms (causes module registration issues on web static export)
// Using dynamic require to avoid module registration issues with Expo's static export
const getSplashScreen = () => {
  if (typeof window !== 'undefined') {
    // On web, return no-op functions
    return {
      preventAutoHideAsync: () => Promise.resolve(),
      hideAsync: () => Promise.resolve(),
    };
  }
  try {
    // Only require on native platforms
    return require('expo-splash-screen');
  } catch (error) {
    // Fallback if module not available
    return {
      preventAutoHideAsync: () => Promise.resolve(),
      hideAsync: () => Promise.resolve(),
    };
  }
};

const SplashScreen = getSplashScreen();
// Keep the splash screen visible while we fetch resources (only on native)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after fonts are loaded or if there's an error
      // Only on native platforms (web doesn't use splash screen)
      if (SplashScreen && Platform.OS !== 'web') {
        SplashScreen.hideAsync().catch(() => {
          // Ignore errors - splash screen may not be available
        });
      }
    }
  }, [fontsLoaded, fontError]);

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
        <StatusBar style="auto" />
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
