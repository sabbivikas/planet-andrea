import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Planet Andrea',
  slug: 'planet-andrea',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? 'planetandrea',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.planetandrea.app',
  },
  android: {
    package: process.env.ANDROID_PACKAGE ?? 'com.planetandrea.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
    },
    config: process.env.GOOGLE_MAPS_API_KEY
      ? {
          googleMaps: {
            apiKey: process.env.GOOGLE_MAPS_API_KEY,
          },
        }
      : undefined,
  },
  web: {
    bundler: 'metro',
    output: 'server',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-asset',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        dark: {
          image: './assets/images/splash-icon.png',
          backgroundColor: '#343434',
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you share them with your friends.',
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
      },
    ],
    [
      'expo-video',
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? 'd37486d9-0fc2-4715-87f8-0b5351f613df',
    },
  },
};

export default config;
