import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export function StreamingIndicator() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View className="flex-row items-center py-2 px-4">
      <Animated.View style={{ opacity }}>
        <Text className="text-gray-500 text-sm">AI is typing...</Text>
      </Animated.View>
    </View>
  );
}

