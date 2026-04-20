/**
 * Business logic for the Preferences route (Steps 2 and 3 of 3)
 */
import { useState, useContext, useEffect, useRef, useCallback } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import { readUserPreference, updateUserPreference, updateUserAppProfile, readUserAppProfile } from '@shared/planet-user-db';
import type { ActivityCategory } from '@shared/generated-db-types';
import { PreferencesProps } from '@/app/onboarding/preferences';
import { OnboardingContext } from '@/comp-lib/common/context/OnboardingContextProvider';
import { t } from '@/i18n';

const TOTAL_STEPS = 3;
const MIN_CATEGORIES = 1;
const OTP_LENGTH = 6;
const RESEND_COUNTDOWN_IN_SEC = 30;

export type OnboardingPhase = 'interests' | 'otp';

export interface InterestItem {
  id: ActivityCategory;
  label: string;
}

export const INTEREST_ITEMS: InterestItem[] = [
  { id: 'FOOD_AND_DRINKS', label: 'Food and Drinks' },
  { id: 'LIVE_MUSIC', label: 'Live Music' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'ARTS', label: 'Arts and Culture' },
  { id: 'OUTDOOR', label: 'Outdoors' },
  { id: 'NIGHTLIFE', label: 'Nightlife' },
  { id: 'GAMING', label: 'Comedy' },
  { id: 'WELLNESS', label: 'Trivia and Games' },
];

/**
 * Interface for the return value of the usePreferences hook
 */
export interface PreferencesFunc {
  isLoading: boolean;
  phase: OnboardingPhase;
  currentStep: number;
  totalSteps: number;
  interests: InterestItem[];
  selectedIds: ActivityCategory[];
  isInterestsContinueEnabled: boolean;
  phoneNumber: string;
  otpCode: string;
  isOtpComplete: boolean;
  resendCountdownInSec: number;
  canResend: boolean;
  showAutoFillMessage: boolean;
  onToggleInterest: (id: ActivityCategory) => void;
  onContinueInterests: () => void;
  onOtpChange: (code: string) => void;
  onResendCode: () => void;
  onVerifyAndStart: () => void;
}

/**
 * Custom hook that provides business logic for the Preferences component
 */
export function usePreferences(props: PreferencesProps): PreferencesFunc {
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<OnboardingPhase>('interests');
  const [selectedIds, setSelectedIds] = useState<ActivityCategory[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdownInSec, setResendCountdownInSec] = useState(0);
  const [showAutoFillMessage, setShowAutoFillMessage] = useState(false);
  const hasLoadedRef = useRef(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const verifyAndStartAsyncRef = useRef(verifyAndStartAsync);

  const { completeOnboarding } = useContext(OnboardingContext);

  const currentStep = phase === 'interests' ? 2 : 3;
  const isInterestsContinueEnabled = selectedIds.length >= MIN_CATEGORIES;
  const isOtpComplete = otpCode.length === OTP_LENGTH;
  const canResend = resendCountdownInSec === 0;

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadExistingDataAsync().catch((error) => {
      console.error('loadExistingData error:', error);
    });
  }, []);

  async function loadExistingDataAsync(): Promise<void> {
    try {
      const [prefs, appProfile] = await Promise.all([
        readUserPreference(supabaseClient),
        readUserAppProfile(supabaseClient),
      ]);

      if (prefs?.activityCategories != null && prefs.activityCategories.length > 0) {
        setSelectedIds(prefs.activityCategories);
      }

      if (appProfile?.phoneNumber) {
        setPhoneNumber(appProfile.phoneNumber);
      }
    } catch (error) {
      console.error('Failed to load existing data:', error);
    }
  }

  function startResendCountdown(): void {
    setResendCountdownInSec(RESEND_COUNTDOWN_IN_SEC);
    if (countdownIntervalRef.current != null) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      setResendCountdownInSec((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current != null) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = undefined;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current != null) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Keep ref to latest verifyAndStartAsync to avoid stale closure in autofill timeouts
  useEffect(() => {
    verifyAndStartAsyncRef.current = verifyAndStartAsync;
  });

  // Simulate SMS autofill when OTP phase becomes active
  useEffect(() => {
    if (phase !== 'otp') return;

    const AUTO_FILL_CODE = '123456';
    const INITIAL_DELAY_IN_MS = 1000;
    const DIGIT_DELAY_IN_MS = 100;
    const VERIFY_DELAY_AFTER_COMPLETE_IN_MS = 500;
    const scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= AUTO_FILL_CODE.length; i++) {
      const digitTimeout = setTimeout(() => {
        if (i === 1) {
          setShowAutoFillMessage(true);
        }
        setOtpCode(AUTO_FILL_CODE.slice(0, i));
      }, INITIAL_DELAY_IN_MS + (i - 1) * DIGIT_DELAY_IN_MS);
      scheduledTimeouts.push(digitTimeout);
    }

    const verifyDelayInMs =
      INITIAL_DELAY_IN_MS +
      (AUTO_FILL_CODE.length - 1) * DIGIT_DELAY_IN_MS +
      VERIFY_DELAY_AFTER_COMPLETE_IN_MS;

    const verifyTimeout = setTimeout(() => {
      verifyAndStartAsyncRef.current().catch((error) => {
        console.error('autoFillVerify error:', error);
      });
    }, verifyDelayInMs);
    scheduledTimeouts.push(verifyTimeout);

    return () => {
      for (const timeout of scheduledTimeouts) {
        clearTimeout(timeout);
      }
    };
  }, [phase]);

  function onToggleInterest(id: ActivityCategory): void {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }

  function onContinueInterests(): void {
    if (!isInterestsContinueEnabled) return;
    saveInterestsAsync().catch((error) => {
      console.error('onContinueInterests error:', error);
    });
  }

  async function saveInterestsAsync(): Promise<void> {
    setIsLoading(true);
    try {
      await updateUserPreference(supabaseClient, {
        activityCategories: selectedIds,
      });
      setPhase('otp');
      startResendCountdown();
    } catch (error) {
      console.error('Save interests error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function onOtpChange(code: string): void {
    const digitsOnly = code.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtpCode(digitsOnly);
  }

  function onResendCode(): void {
    if (!canResend) return;
    startResendCountdown();
  }

  function onVerifyAndStart(): void {
    if (!isOtpComplete) return;
    verifyAndStartAsync().catch((error) => {
      console.error('onVerifyAndStart error:', error);
    });
  }

  async function verifyAndStartAsync(): Promise<void> {
    setIsLoading(true);
    try {
      await updateUserAppProfile(supabaseClient, {
        isOnboarded: true,
      });
      completeOnboarding();
      props.onNavigateNextPage?.();
    } catch (error) {
      console.error('Verify and start error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    phase,
    currentStep,
    totalSteps: TOTAL_STEPS,
    interests: INTEREST_ITEMS,
    selectedIds,
    isInterestsContinueEnabled,
    phoneNumber,
    otpCode,
    isOtpComplete,
    resendCountdownInSec,
    canResend,
    showAutoFillMessage,
    onToggleInterest,
    onContinueInterests,
    onOtpChange,
    onResendCode,
    onVerifyAndStart,
  };
}
