import { useEffect } from 'react';

/**
 * Hook to register service worker for PWA functionality
 * Only runs on web platform
 */
export function useServiceWorker() {
  useEffect(() => {
    // Only register on web platform
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Wait for the page to load
    window.addEventListener('load', () => {
      registerServiceWorker();
    });

    return () => {
      // Cleanup if needed
    };
  }, []);
}

async function registerServiceWorker() {
  try {
    console.log('[PWA] Registering service worker...');

    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[PWA] Service worker registered successfully:', registration);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New version available! Please refresh.');
          // You could show a notification to the user here
        }
      });
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
  }
}

/**
 * Hook to handle PWA install prompt
 */
export function usePWAInstall() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let deferredPrompt: any = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      console.log('[PWA] Install prompt available');

      // You could dispatch an event or update state here
      // to show your custom install button
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Expose install method globally so it can be triggered by UI
    (window as any).promptPWAInstall = async () => {
      if (!deferredPrompt) {
        console.log('[PWA] Install prompt not available');
        return false;
      }

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);

      // Clear the deferred prompt
      deferredPrompt = null;

      return outcome === 'accepted';
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      delete (window as any).promptPWAInstall;
    };
  }, []);
}

