import html2canvas from 'html2canvas';
import { useEffect } from 'react';

import { useReactInspectorContext } from '@/comp-lib/react-inspector/provider/useReactInspectorContext';
import {
  INSPECTOR_MESSAGE_FROM_EVENT,
  INSPECTOR_MESSAGE_TO_CHANGE_STATUS_REQUEST,
  parseInspectorStatusChangeRequestMessage,
} from '@/comp-lib/react-inspector/react-inspector-types';
import { HrefInputParams } from 'expo-router';
import { WozClientAppMessage } from './inter-app-messaging-types';
import { useNav } from './useNav';
import { isAllowedParentOrigin, sendMessageToParent, setParentOriginFromMessage } from './utils';

export function useNavigationListener(): void {
  const { navigate, replace, back } = useNav({});
  const { onStatusChange } = useReactInspectorContext();

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Validate the origin against known origins and PR preview pattern

      if (!isAllowedParentOrigin(event.origin)) {
        return;
      }

      const message = event.data as WozClientAppMessage;

      if (event.source !== window.parent || !message) return;
      if (!event.data || typeof event.data !== 'object') return;

      // Cache the parent origin for future outgoing messages
      setParentOriginFromMessage(event.origin);

      switch (message.type) {
        case 'NAVIGATE': {
          const { path, shouldReplace, shouldGoBack } = message;
          if (shouldGoBack) {
            back();
          } else if (shouldReplace && path) {
            replace({ pathname: path } as HrefInputParams);
          } else if (path) {
            navigate({ pathname: path } as HrefInputParams);
          }
          return;
        }
        case INSPECTOR_MESSAGE_TO_CHANGE_STATUS_REQUEST: {
          const changeRequestMessage = parseInspectorStatusChangeRequestMessage(message);
          if (!changeRequestMessage) return;
          const { status } = changeRequestMessage;
          onStatusChange(status);
          event.source.postMessage(
            {
              type: INSPECTOR_MESSAGE_FROM_EVENT,
              status,
            },
            event.origin,
          );
          return;
        }
        case 'CAPTURE_SCREENSHOT_REQUEST': {
          html2canvas(document.documentElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          })
            .then((canvas: HTMLCanvasElement) => {
              const mimeType = 'image/png';
              const dataUrl = canvas.toDataURL(mimeType);
              sendMessageToParent({
                type: 'CAPTURE_SCREENSHOT_RESPONSE',
                imageData: { mimeType, data: dataUrl },
              });
            })
            .catch((captureError: unknown) => {
              sendMessageToParent({
                type: 'CAPTURE_SCREENSHOT_RESPONSE',
                error: String(captureError),
              });
            });
          return;
        }
        default: {
          return;
        }
      }
    }

    if (typeof window === 'undefined') {
      console.debug('useNavigationListener -> Window is not defined. This needs to run in a web environment');
      return;
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // Expo Router’s router methods (router.back(), router.replace(), router.push(), etc.) are stable — they don’t change across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
