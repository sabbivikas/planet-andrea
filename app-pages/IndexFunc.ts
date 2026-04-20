import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IndexProps } from '@/app/index';

/**
 * Interface for the return value of the useIndex hook
 */
export interface IndexFunc {
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error state for async operations */
  error?: Error;
  /** Animated opacity for the content area entrance */
  contentOpacity: SharedValue<number>;
  /** Animated translateY for the content area entrance */
  contentTranslateY: SharedValue<number>;
  /** Animated opacity for the buttons entrance */
  buttonsOpacity: SharedValue<number>;
  /** Animated translateY for the buttons entrance */
  buttonsTranslateY: SharedValue<number>;
  /** Handler for Get Started button press */
  onGetStartedPress: () => void;
  /** Handler for Have Account button press */
  onHaveAccountPress: () => void;
}

const CONTENT_ENTRANCE_DELAY_MS = 300;
const BUTTONS_ENTRANCE_DELAY_MS = 600;
const ENTRANCE_DURATION_MS = 700;

/**
 * Custom hook that provides business logic for the Index component
 */
export function useIndex(props: IndexProps): IndexFunc {
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(24);

  useEffect(() => {
    contentOpacity.value = withDelay(
      CONTENT_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    contentTranslateY.value = withDelay(
      CONTENT_ENTRANCE_DELAY_MS,
      withTiming(0, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );

    buttonsOpacity.value = withDelay(
      BUTTONS_ENTRANCE_DELAY_MS,
      withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    buttonsTranslateY.value = withDelay(
      BUTTONS_ENTRANCE_DELAY_MS,
      withTiming(0, { duration: ENTRANCE_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  function onGetStartedPress(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Haptics not available on this device
    });
    props.onNavigateToSignup();
  }

  function onHaveAccountPress(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Haptics not available on this device
    });
    props.onNavigateToLogin();
  }

  return {
    isLoading: false,
    error: undefined,
    contentOpacity,
    contentTranslateY,
    buttonsOpacity,
    buttonsTranslateY,
    onGetStartedPress,
    onHaveAccountPress,
  };
}
