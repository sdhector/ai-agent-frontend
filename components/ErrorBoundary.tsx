import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and any error tracking service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center p-6">
          <View className="max-w-md w-full">
            {/* Error Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full items-center justify-center">
                <Text className="text-4xl">⚠️</Text>
              </View>
            </View>

            {/* Error Title */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Oops! Something went wrong
            </Text>

            {/* Error Description */}
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-6">
              We encountered an unexpected error. Please try reloading the app.
            </Text>

            {/* Error Details (in development) */}
            {__DEV__ && this.state.error && (
              <ScrollView className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 max-h-48">
                <Text className="text-xs font-mono text-gray-800 dark:text-gray-200 mb-2">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={this.handleReload}
                className="bg-sky-600 rounded-lg py-3 px-6 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  Reload App
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleReset}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg py-3 px-6 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-gray-900 dark:text-white font-semibold text-base">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text className="text-sm text-gray-500 dark:text-gray-500 text-center mt-6">
              If this problem persists, please contact support.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
