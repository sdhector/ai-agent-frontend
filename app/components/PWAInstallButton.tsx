import { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';

/**
 * PWA Install Button Component
 * Shows a button to install the app when running as a PWA on web
 */
export function PWAInstallButton() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      setIsInstallable(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Check if prompt is already available
    if ((window as any).deferredPrompt) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (typeof window === 'undefined') return;

    const promptInstall = (window as any).promptPWAInstall;
    if (!promptInstall) {
      console.log('Install prompt not available');
      return;
    }

    const accepted = await promptInstall();
    if (accepted) {
      setIsInstallable(false);
      setIsInstalled(true);
    }
  };

  // Don't show button on native platforms or if already installed
  if (Platform.OS !== 'web' || isInstalled) {
    return null;
  }

  // Don't show if not installable
  if (!isInstallable) {
    return null;
  }

  return (
    <View className="p-4 bg-sky-50 border-t border-sky-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-sky-900 mb-1">
            Install AI Agent
          </Text>
          <Text className="text-xs text-sky-700">
            Add to your home screen for quick access
          </Text>
        </View>
        <Pressable
          onPress={handleInstall}
          className="bg-sky-600 px-4 py-2 rounded-lg active:bg-sky-700"
        >
          <Text className="text-white font-semibold text-sm">
            Install
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

