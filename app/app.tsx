/**
 * App Entry Point - Ignite Boilerplate
 * 
 * Root component that initializes the app
 * Replaces Expo Router's entry point
 */
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './contexts/AuthContext';
import { AppNavigator } from './navigators/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';

// Import global.css for NativeWind styling on all platforms
import '../global.css';

// Conditionally import SplashScreen only on native platforms
// On web, expo-splash-screen can cause module registration issues
let SplashScreen: any = null;
if (Platform.OS !== 'web') {
  try {
    SplashScreen = require('expo-splash-screen');
    SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.warn('SplashScreen not available:', e);
  }
}

export default function App() {
  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded (only on native)
      if (Platform.OS !== 'web' && SplashScreen) {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError]);

  // Handle OAuth redirect on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = urlParams.get('token') || hashParams.get('token');
      
      if (token) {
        // Clean up URL immediately
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null; // Show splash screen
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        {Platform.OS !== 'web' && <StatusBar style="auto" />}
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

