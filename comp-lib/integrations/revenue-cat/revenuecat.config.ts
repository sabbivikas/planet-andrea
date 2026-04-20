import { Platform } from 'react-native';

import { isPurchaseSandbox, purchaseConfig } from '@/config.purchase';

/**
 * Gets the appropriate RevenueCat API key based on the current environment and platform.
 * - In sandbox: Uses the Test Store key
 * - In production: Uses the platform-specific key (iOS or Android)
 */
export function getRevenueCatApiKey(): string | undefined {

  // In sandbox environment, always use the Test Store key regardless of platform
  if (isPurchaseSandbox()) {
    return purchaseConfig.revenueCatApiKeyTestStore;
  }

  // On web, we don't have a separate production key, so we fall back to the test store key
  if (Platform.OS === 'web') {
    return purchaseConfig.revenueCatApiKeyTestStore;
  }

  // For native platforms, we return the platform-specific key
  if (Platform.OS === 'ios') {
    return purchaseConfig.revenueCatApiKeyIos;
  }

  if (Platform.OS === 'android') {
    return purchaseConfig.revenueCatApiKeyAndroid;
  }

  // If platform is unrecognized, fall back to the test store key as a safe default
  return purchaseConfig.revenueCatApiKeyTestStore;
}
