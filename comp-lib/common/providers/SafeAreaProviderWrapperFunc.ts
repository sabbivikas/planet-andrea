import type { AppPreviewReadyMessage, WozClientAppMessage } from '@/comp-lib/navigation/inter-app-messaging-types';
import { sendMessageToParent, TARGET_PARENT_ORIGINS } from '@/comp-lib/navigation/utils';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Messages TO the parent app (requests from embedded app)

export interface SafeAreaProviderWrapperFunc {
  enableFakeSafeArea: boolean;
}

export function useSafeAreaProviderWrapper(): SafeAreaProviderWrapperFunc {
  // Default false: only enable if parent explicitly sends it
  const [enableFakeSafeArea, setEnableFakeSafeArea] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onMessage = (event: MessageEvent<WozClientAppMessage>) => {
      if (!TARGET_PARENT_ORIGINS.includes(event.origin)) return;
      const data = event.data;
      if (data?.type !== 'APP_PREVIEW_TO_UPDATE_CONFIG_REQUEST') return;

      const flag = !!data.payload?.ENABLE_FAKE_SAFE_AREA;
      setEnableFakeSafeArea(flag);
    };

    window.addEventListener('message', onMessage);

    sendMessageToParent({
      type: 'APP_PREVIEW_FROM_READY',
      supportedFeatures: ['CAPTURE_SCREENSHOT'],
    } satisfies AppPreviewReadyMessage);

    return () => window.removeEventListener('message', onMessage);
  }, []);

  return { enableFakeSafeArea };
}
