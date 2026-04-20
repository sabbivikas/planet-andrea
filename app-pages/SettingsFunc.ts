/**
 * Business logic for the Settings route
 */
import { useState, useEffect, useRef } from 'react';

import Constants from 'expo-constants';
import { useSession } from '@supabase/auth-helpers-react';

import { supabaseClient } from '@/api/supabase-client';
import { deleteCurrentUser } from '@/api/user-api';
import { signOut } from '@/api/auth-api';
import { t } from '@/i18n';
import { alert } from '@/utils/alert';
import { type SettingsProps } from '@/app/settings';
import type { VerificationStatus } from '@shared/generated-db-types';
import { readUserAppProfile, readUserPreference, updateUserPreference } from '@shared/planet-user-db';

// ── Types ──

export type NotificationKey = 'battles' | 'groupActivity' | 'deals' | 'friendActivity';

export interface NotificationPreferences {
  battles: boolean;
  groupActivity: boolean;
  deals: boolean;
  friendActivity: boolean;
}

export type VerificationDisplayStatus = 'verified' | 'pending' | 'notStarted';

// ── Constants ──

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

// ── Helpers ──

const NOTIFICATION_KEY_TO_PREF_PARAM: Record<NotificationKey, string> = {
  battles: 'battleNotificationsEnabled',
  groupActivity: 'groupActivityNotificationsEnabled',
  deals: 'dealNotificationsEnabled',
  friendActivity: 'friendActivityNotificationsEnabled',
};

function mapVerificationStatus(status?: VerificationStatus): VerificationDisplayStatus {
  switch (status) {
    case 'VERIFIED':
      return 'verified';
    case 'PENDING':
      return 'pending';
    default:
      return 'notStarted';
  }
}

/**
 * Interface for the return value of the useSettings hook
 */
export interface SettingsFunc {
  isLoading: boolean;
  error?: Error;

  // Account
  email: string;
  verificationDisplayStatus: VerificationDisplayStatus;

  // Notifications
  notificationPreferences: NotificationPreferences;
  onToggleNotification: (key: NotificationKey) => void;

  // Preferences
  locationEnabled: boolean;
  selectedCategoriesCount: number;

  // About
  appVersion: string;

  // Danger zone
  onDeleteAccount: () => void;

  // Navigation stubs
  onChangePassword: () => void;
  onLocationSettings: () => void;
  onActivityPreferences: () => void;
  onBlockedUsers: () => void;
  onDataControls: () => void;
  onTermsOfService: () => void;
  onPrivacyPolicy: () => void;
  onHelpSupport: () => void;
}

/**
 * Custom hook that provides business logic for the Settings component
 */
export function useSettings(props: SettingsProps): SettingsFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const session = useSession();

  // ── Account ──

  const email = session?.user?.email ?? '';

  const [verificationDisplayStatus, setVerificationDisplayStatus] =
    useState<VerificationDisplayStatus>('notStarted');

  // ── Notifications ──

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    battles: true,
    groupActivity: true,
    deals: true,
    friendActivity: true,
  });

  // ── Preferences ──

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedCategoriesCount, setSelectedCategoriesCount] = useState(0);

  // Track whether a preference update is in-flight to avoid overlapping calls
  const isUpdatingPref = useRef(false);

  // ── Load data on mount ──

  useEffect(() => {
    loadSettingsDataAsync().catch((err) => {
      console.error('loadSettingsDataAsync error:', err);
    });
  }, []);

  async function loadSettingsDataAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const [appProfile, prefs] = await Promise.all([
        readUserAppProfile(supabaseClient),
        readUserPreference(supabaseClient),
      ]);

      if (appProfile) {
        setVerificationDisplayStatus(
          mapVerificationStatus(appProfile.verificationStatus ?? undefined),
        );
      }

      if (prefs) {
        setNotificationPreferences({
          battles: prefs.battleNotificationsEnabled,
          groupActivity: prefs.groupActivityNotificationsEnabled,
          deals: prefs.dealNotificationsEnabled,
          friendActivity: prefs.friendActivityNotificationsEnabled,
        });
        setLocationEnabled(prefs.locationPermissionGranted);
        setSelectedCategoriesCount(prefs.activityCategories?.length ?? 0);
      }
    } catch (err) {
      console.error('Failed to load settings data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }

  function onToggleNotification(key: NotificationKey): void {
    const newValue = !notificationPreferences[key];

    // Optimistic update
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    handleToggleNotificationAsync(key, newValue).catch((err) => {
      console.error('onToggleNotification error:', err);
      // Revert on failure
      setNotificationPreferences((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
    });
  }

  async function handleToggleNotificationAsync(
    key: NotificationKey,
    newValue: boolean,
  ): Promise<void> {
    if (isUpdatingPref.current) return;
    isUpdatingPref.current = true;
    try {
      const paramKey = NOTIFICATION_KEY_TO_PREF_PARAM[key];
      await updateUserPreference(supabaseClient, { [paramKey]: newValue });
    } finally {
      isUpdatingPref.current = false;
    }
  }

  // ── Navigation stubs ──

  function onChangePassword(): void {
    // TODO: Navigate to change password flow
    console.log('Navigate to change password');
  }

  function onLocationSettings(): void {
    // TODO: Open device location settings or in-app location config
    console.log('Navigate to location settings');
  }

  function onActivityPreferences(): void {
    // TODO: Navigate to activity category preferences editor
    console.log('Navigate to activity preferences');
  }

  function onBlockedUsers(): void {
    // TODO: Navigate to blocked users management screen
    console.log('Navigate to blocked users');
  }

  function onDataControls(): void {
    // TODO: Navigate to data controls / data export screen
    console.log('Navigate to data controls');
  }

  function onTermsOfService(): void {
    // TODO: Open terms of service URL in browser
    console.log('Navigate to terms of service');
  }

  function onPrivacyPolicy(): void {
    // TODO: Open privacy policy URL in browser
    console.log('Navigate to privacy policy');
  }

  function onHelpSupport(): void {
    // TODO: Open help & support URL or in-app support screen
    console.log('Navigate to help & support');
  }

  // ── Danger zone ──

  function onDeleteAccount(): void {
    alert(
      t('settings.deleteAccountConfirmTitle'),
      t('settings.deleteAccountConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccountConfirmButton'),
          style: 'destructive',
          onPress: onConfirmDeleteAccount,
        },
      ],
    );
  }

  function onConfirmDeleteAccount(): void {
    handleDeleteAccountAsync().catch((err) => {
      console.error('onConfirmDeleteAccount error:', err);
    });
  }

  async function handleDeleteAccountAsync(): Promise<void> {
    setIsLoading(true);
    try {
      await deleteCurrentUser(supabaseClient);
      await signOut(supabaseClient);
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete account'));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    email,
    verificationDisplayStatus,
    notificationPreferences,
    onToggleNotification,
    locationEnabled,
    selectedCategoriesCount,
    appVersion: APP_VERSION,
    onDeleteAccount,
    onChangePassword,
    onLocationSettings,
    onActivityPreferences,
    onBlockedUsers,
    onDataControls,
    onTermsOfService,
    onPrivacyPolicy,
    onHelpSupport,
  };
}
