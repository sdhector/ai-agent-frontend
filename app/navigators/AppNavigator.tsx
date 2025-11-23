/**
 * AppNavigator - Ignite Boilerplate Navigation
 * 
 * Main navigation configuration using React Navigation
 * Replaces Expo Router's file-based routing
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ChatScreen } from '../screens/ChatScreen';
import { ConversationsScreen } from '../screens/ConversationsScreen';
import { MCPScreen } from '../screens/MCPScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OAuthCallbackScreen } from '../screens/OAuthCallbackScreen';
import LoadingScreen from '../components/LoadingScreen';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  OAuthCallback: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Chat: { conversationId?: string } | undefined;
  Conversations: undefined;
  MCP: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tab Navigator
 * Contains the 4 main tabs: Chat, Conversations, MCP, Settings
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MCP"
        component={MCPScreen}
        options={{
          title: 'MCP',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="extension-puzzle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Stack Navigator
 * Handles authentication flow and main app navigation
 */
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="OAuthCallback" component={OAuthCallbackScreen} />
          <Stack.Screen name="Auth" component={LoginScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

/**
 * App Navigator Component
 * Wraps navigation in NavigationContainer
 */
export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

