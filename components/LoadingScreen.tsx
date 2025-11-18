import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
      <View className="items-center">
        {/* Loading Spinner */}
        <ActivityIndicator size="large" color="#0284c7" />

        {/* Loading Message */}
        <Text className="text-base text-gray-600 dark:text-gray-400 mt-4">
          {message}
        </Text>
      </View>
    </View>
  );
}
