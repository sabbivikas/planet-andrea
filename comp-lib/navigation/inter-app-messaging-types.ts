import { type ConsoleMessage } from '@/supabase/functions/_shared-client/crash-analytics/types';
import { type MimeDataUrl } from '@/supabase/functions/_shared-client/inspector/base64-types';
import {
  type InspectorClearSelectionRequestEvent,
  type InspectorEvent,
  type InspectorRemoveElementRequestEvent,
  type InspectorStatusChangeRequestEvent,
} from '../react-inspector/react-inspector-types';
import { type PageRouteReporterMessage } from './PageRouteReporterTypes';

export type SupportedFeature = 'CAPTURE_SCREENSHOT';

export type WozConfigRequestMessage = {
  type: 'APP_PREVIEW_TO_UPDATE_CONFIG_REQUEST';
  payload?: {
    ENABLE_FAKE_SAFE_AREA?: boolean;
  };
};

export type AppPreviewReadyMessage = {
  type: 'APP_PREVIEW_FROM_READY';
  supportedFeatures?: SupportedFeature[];
};

export type NavigateRequestMessage = {
  type: 'NAVIGATE';
  path?: string;
  shouldReplace?: boolean;
  shouldGoBack?: boolean;
};

export interface CaptureScreenshotRequestMessage {
  type: 'CAPTURE_SCREENSHOT_REQUEST';
}

export type CaptureScreenshotResponseMessage = {
  type: 'CAPTURE_SCREENSHOT_RESPONSE';
  imageData?: MimeDataUrl;
  error?: string;
};

export type WozClientAppMessage =
  | NavigateRequestMessage
  | CaptureScreenshotRequestMessage
  | InspectorStatusChangeRequestEvent
  | InspectorRemoveElementRequestEvent
  | InspectorClearSelectionRequestEvent
  | WozConfigRequestMessage;

export type AppPreviewSendStylesDataRequestMessage = {
  type: 'WOZ_APP_PREVIEW_SEND_STYLES_DATA';
  backgroundColor?: string;
};

export type WozAppMessage =
  | AppPreviewReadyMessage
  | InspectorEvent
  | PageRouteReporterMessage
  | ConsoleMessage
  | CaptureScreenshotResponseMessage
  | AppPreviewSendStylesDataRequestMessage;
