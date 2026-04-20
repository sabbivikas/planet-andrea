/**
 * Business logic for the NotFound route
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppSetup } from '@/comp-lib/common/useAppSetup';
import { NotFoundProps } from '@/app/+not-found';

/**
 * Interface for the return value of the useNotFound hook
 */
export interface NotFoundFunc {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Animated opacity for the icon area entrance */
  iconOpacity: SharedValue<number>;
  /** Animated scale for the icon area entrance */
  iconScale: SharedValue<number>;
  /** Animated rotation for the compass icon (gentle wobble) */
  compassRotation: SharedValue<number>;
  /** Animated opacity for the text content entrance */
  contentOpacity: SharedValue<number>;
  /** Animated translateY for the text content entrance */
  contentTranslateY: SharedValue<number>;
  /** Animated opacity for the CTA button entrance */
  buttonOpacity: SharedValue<number>;
  /** Animated translateY for the CTA button entrance */
  buttonTranslateY: SharedValue<number>;
  /** Handler for the main CTA button press */
  onCtaPress: () => void;
}

const ICON_ENTRANCE_DELAY_MS = 200;
const CONTENT_ENTRANCE_DELAY_MS = 500;
const BUTTON_ENTRANCE_DELAY_MS = 800;
const ENTRANCE_DURATION_MS = 700;
const WOBBLE_DURATION_MS = 2800;
const WOBBLE_ANGLE = 12;

/**
 * Custom hook that provides business logic for the NotFound component
 */
export function useNotFound(props: NotFoundProps): NotFoundFunc {
  const { isAuthenticated } = useAppSetup();

  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.7);
  const compassRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(24);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);

  useEffect(() => {
    // Icon entrance: fade in + scale up
    iconOpacity.value = withDelay(
      ICON_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    iconScale.value = withDelay(
      ICON_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.back(1.5)) }),
    );

    // Gentle compass wobble — starts after icon entrance completes
    compassRotation.value = withDelay(
      ICON_ENTRANCE_DELAY_MS + ENTRANCE_DURATION_MS,
      withRepeat(
        withSequence(
          withTiming(WOBBLE_ANGLE, { duration: WOBBLE_DURATION_MS, easing: Easing.inOut(Easing.sin) }),
          withTiming(-WOBBLE_ANGLE, { duration: WOBBLE_DURATION_MS, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );

    // Text content entrance: staggered fade + slide up
    contentOpacity.value = withDelay(
      CONTENT_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    contentTranslateY.value = withDelay(
      CONTENT_ENTRANCE_DELAY_MS,
      withTiming(0, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );

    // Button entrance: staggered fade + slide up
    buttonOpacity.value = withDelay(
      BUTTON_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    buttonTranslateY.value = withDelay(
      BUTTON_ENTRANCE_DELAY_MS,
      withTiming(0, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  function onCtaPress(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Haptics not available on this device
    });
    props.onNavigateToHome();
  }

  return {
    isAuthenticated,
    iconOpacity,
    iconScale,
    compassRotation,
    contentOpacity,
    contentTranslateY,
    buttonOpacity,
    buttonTranslateY,
    onCtaPress,
  };
}
