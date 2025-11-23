/**
 * App Entry Point - Ignite Boilerplate
 * 
 * Root component that initializes the app
 * Replaces Expo Router's entry point
 */
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './contexts/AuthContext';
import { AppNavigator } from './navigators/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import '../global.css';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
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
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

