/**
 * Business logic for the Profile route
 */
import { useState, useEffect, useContext, useRef } from 'react';

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

import * as Auth from '@/api/auth-api';
import { supabaseClient } from '@/api/supabase-client';
import { deleteCurrentUser } from '@/api/user-api';
import { OnboardingContext } from '@/comp-lib/common/context/OnboardingContextProvider';
import { useImagePicker } from '@/comp-lib/assets/useImagePicker';
import { useAssetUpload } from '@/comp-lib/assets/useAssetUpload';
import { alert } from '@/utils/alert';
import { t } from '@/i18n';
import { ProfileProps } from '@/app/(tabs)/profile';
import { readProfile, updateProfile } from '@shared/profile-db';
import { readUserAppProfile, readUserStats, readUserPreference, updateUserPreference } from '@shared/planet-user-db';
import { readRecentSwipesWithActivity } from '@shared/planet-swipe-db';
import type {
  ProfileV1,
  UserAppProfileV1,
  UserStatsV1,
  SwipeWithActivityV1,
  VerificationStatus,
  UserPreferenceV1,
  ActivityCategory,
} from '@shared/generated-db-types';

export type ActiveSheet =
  | 'settings'
  | 'editProfile'
  | 'verifyIdentity'
  | 'notifications'
  | 'activityPrefs'
  | 'privacy'
  | 'signOutConfirm'
  | undefined;

const DEFAULT_USER_STATS: UserStatsV1 = {
  groupsCount: 0 as UserStatsV1['groupsCount'],
  battlesWon: 0 as UserStatsV1['battlesWon'],
  activitiesDiscovered: 0 as UserStatsV1['activitiesDiscovered'],
};

const TOAST_DURATION_IN_MS = 3000;

export interface ProfileFunc {
  isLoading: boolean;
  error?: Error;

  // Profile data
  displayName: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  isBusinessOwner: boolean;
  stats: UserStatsV1;
  activityHistory: SwipeWithActivityV1[];

  // Verification check data
  hasPhoneNumber: boolean;
  hasAttendedEvent: boolean;

  // Photo
  isUploadingPhoto: boolean;
  onPickPhoto: () => void;

  // Active sheet navigation
  activeSheet: ActiveSheet;
  onOpenSettingsSheet: () => void;
  onCloseSheet: () => void;
  onOpenSubSheet: (sheet: ActiveSheet) => void;

  // Edit profile
  editFirstName: string;
  editLastName: string;
  editUsername: string;
  editBio: string;
  isSavingProfile: boolean;
  onEditFirstNameChange: (text: string) => void;
  onEditLastNameChange: (text: string) => void;
  onEditUsernameChange: (text: string) => void;
  onEditBioChange: (text: string) => void;
  onSaveProfile: () => void;

  // Notification toggles
  notifBattles: boolean;
  notifPlanets: boolean;
  notifOrbit: boolean;
  notifNudges: boolean;
  notifDeals: boolean;
  onToggleNotifBattles: () => void;
  onToggleNotifPlanets: () => void;
  onToggleNotifOrbit: () => void;
  onToggleNotifNudges: () => void;
  onToggleNotifDeals: () => void;

  // Activity preferences
  selectedActivityIds: ActivityCategory[];
  onToggleActivityPref: (id: ActivityCategory) => void;
  onSaveActivityPrefs: () => void;

  // Privacy toggles (local state)
  privacyOpenPlanets: boolean;
  privacyOrbitRequests: boolean;
  privacyActivityToCrew: boolean;
  onTogglePrivacyOpenPlanets: () => void;
  onTogglePrivacyOrbitRequests: () => void;
  onTogglePrivacyActivityToCrew: () => void;

  // Toast
  toastMessage?: string;
  onShowToast: (message: string) => void;
  onDismissToast: () => void;

  // Auth
  onConfirmSignOut: (navigateAfterLogout: () => void) => void;
  onDeleteAccount: (navigateAfterLogout: () => void) => void;
}

export function useProfile(props: ProfileProps): ProfileFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profile, setProfile] = useState<ProfileV1 | undefined>(undefined);
  const [appProfile, setAppProfile] = useState<UserAppProfileV1 | undefined>(undefined);
  const [userPreference, setUserPreference] = useState<UserPreferenceV1 | undefined>(undefined);
  const [stats, setStats] = useState<UserStatsV1>(DEFAULT_USER_STATS);
  const [activityHistory, setActivityHistory] = useState<SwipeWithActivityV1[]>([]);

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(undefined);

  // Edit profile state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  // Notification toggles (initialized from userPreference once loaded)
  const [notifBattles, setNotifBattles] = useState(true);
  const [notifPlanets, setNotifPlanets] = useState(true);
  const [notifOrbit, setNotifOrbit] = useState(true);
  const [notifNudges, setNotifNudges] = useState(true);
  const [notifDeals, setNotifDeals] = useState(true);

  // Activity preferences
  const [selectedActivityIds, setSelectedActivityIds] = useState<ActivityCategory[]>([]);

  // Privacy toggles (local state - no DB support yet)
  const [privacyOpenPlanets, setPrivacyOpenPlanets] = useState(true);
  const [privacyOrbitRequests, setPrivacyOrbitRequests] = useState(true);
  const [privacyActivityToCrew, setPrivacyActivityToCrew] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { resetOnboardingContext } = useContext(OnboardingContext);
  const session = useSession();
  const supabase = useSupabaseClient();
  const imagePicker = useImagePicker();
  const assetUpload = useAssetUpload();

  // ── Load profile data ──

  const sessionUserId = session?.user?.id;

  useEffect(() => {
    if (sessionUserId != null) {
      loadProfileDataAsync();
    }
  }, [sessionUserId]);

  function loadProfileDataAsync(): void {
    loadProfileData().catch((err) => {
      console.error('loadProfileData error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      setIsLoading(false);
    });
  }

  async function loadProfileData(): Promise<void> {
    setIsLoading(true);
    try {
      const [profileResult, appProfileResult, statsResult, activityResult, prefResult] = await Promise.all([
        readProfile(supabase),
        readUserAppProfile(supabase),
        readUserStats(supabase),
        readRecentSwipesWithActivity(supabase),
        readUserPreference(supabase),
      ]);
      setProfile(profileResult);
      setAppProfile(appProfileResult);
      setStats(statsResult ?? DEFAULT_USER_STATS);
      setActivityHistory(activityResult);
      if (prefResult != null) {
        setUserPreference(prefResult);
        setNotifBattles(prefResult.battleNotificationsEnabled);
        setNotifPlanets(prefResult.groupActivityNotificationsEnabled);
        setNotifOrbit(prefResult.pushNotificationsEnabled);
        setNotifNudges(prefResult.friendActivityNotificationsEnabled);
        setNotifDeals(prefResult.dealNotificationsEnabled);
        setSelectedActivityIds(prefResult.activityCategories ?? []);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Derived values ──

  const displayName = profile?.fullName ?? profile?.username ?? '';
  const avatarUrl = profile?.avatarUrl ?? undefined;
  const verificationStatus: VerificationStatus = appProfile?.verificationStatus ?? 'NOT_STARTED';
  const isBusinessOwner = appProfile?.isBusinessOwner ?? false;
  const hasPhoneNumber = appProfile?.phoneNumber != null && appProfile.phoneNumber.length > 0;
  const hasAttendedEvent = stats.activitiesDiscovered >= 1;

  // ── Sheet navigation ──

  function onOpenSettingsSheet(): void {
    setActiveSheet('settings');
  }

  function onCloseSheet(): void {
    setActiveSheet(undefined);
  }

  function onOpenSubSheet(sheet: ActiveSheet): void {
    if (sheet === 'editProfile') {
      setEditFirstName(profile?.givenName ?? '');
      setEditLastName(profile?.familyName ?? '');
      setEditUsername(profile?.username ?? '');
      setEditBio('');
    } else if (sheet === 'activityPrefs') {
      setSelectedActivityIds(userPreference?.activityCategories ?? []);
    }
    setActiveSheet(sheet);
  }

  // ── Edit profile ──

  function onEditFirstNameChange(text: string): void {
    setEditFirstName(text);
  }

  function onEditLastNameChange(text: string): void {
    setEditLastName(text);
  }

  function onEditUsernameChange(text: string): void {
    setEditUsername(text);
  }

  function onEditBioChange(text: string): void {
    setEditBio(text);
  }

  function onSaveProfile(): void {
    saveProfileAsync().catch((err) => {
      console.error('onSaveProfile error:', err);
    });
  }

  async function saveProfileAsync(): Promise<void> {
    const firstName = editFirstName.trim();
    const lastName = editLastName.trim();
    const username = editUsername.trim();
    const fullName = `${firstName} ${lastName}`.trim() || username;
    setIsSavingProfile(true);
    try {
      const updatedProfile = await updateProfile(supabase, {
        givenName: firstName || null,
        familyName: lastName || null,
        username: username || null,
        fullName: fullName || null,
      });
      setProfile(updatedProfile);
      setActiveSheet(undefined);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to save profile'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  // ── Photo picker ──

  function onPickPhoto(): void {
    pickPhotoAsync().catch((err) => {
      console.error('onPickPhoto error:', err);
    });
  }

  async function pickPhotoAsync(): Promise<void> {
    const image = await imagePicker.pickImageFromLibrary();
    if (image) {
      const uploadedPath = await assetUpload.uploadAndUpdateProfileImage(image);
      if (uploadedPath) {
        setProfile((prev) =>
          prev ? { ...prev, avatarUrl: uploadedPath } : prev,
        );
      }
    }
  }

  // ── Notification toggles ──

  function onToggleNotifBattles(): void {
    const newValue = !notifBattles;
    setNotifBattles(newValue);
    updateUserPreference(supabase, { battleNotificationsEnabled: newValue }).catch((err) => {
      console.error('Failed to update battle notifications:', err);
      setNotifBattles(!newValue);
    });
  }

  function onToggleNotifPlanets(): void {
    const newValue = !notifPlanets;
    setNotifPlanets(newValue);
    updateUserPreference(supabase, { groupActivityNotificationsEnabled: newValue }).catch((err) => {
      console.error('Failed to update planet notifications:', err);
      setNotifPlanets(!newValue);
    });
  }

  function onToggleNotifOrbit(): void {
    const newValue = !notifOrbit;
    setNotifOrbit(newValue);
    updateUserPreference(supabase, { pushNotificationsEnabled: newValue }).catch((err) => {
      console.error('Failed to update orbit notifications:', err);
      setNotifOrbit(!newValue);
    });
  }

  function onToggleNotifNudges(): void {
    const newValue = !notifNudges;
    setNotifNudges(newValue);
    updateUserPreference(supabase, { friendActivityNotificationsEnabled: newValue }).catch((err) => {
      console.error('Failed to update nudge notifications:', err);
      setNotifNudges(!newValue);
    });
  }

  function onToggleNotifDeals(): void {
    const newValue = !notifDeals;
    setNotifDeals(newValue);
    updateUserPreference(supabase, { dealNotificationsEnabled: newValue }).catch((err) => {
      console.error('Failed to update deal notifications:', err);
      setNotifDeals(!newValue);
    });
  }

  // ── Activity preferences ──

  function onToggleActivityPref(id: ActivityCategory): void {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function onSaveActivityPrefs(): void {
    saveActivityPrefsAsync().catch((err) => {
      console.error('onSaveActivityPrefs error:', err);
    });
  }

  async function saveActivityPrefsAsync(): Promise<void> {
    try {
      const updated = await updateUserPreference(supabase, { activityCategories: selectedActivityIds });
      setUserPreference(updated);
      setActiveSheet(undefined);
    } catch (err) {
      console.error('Failed to save activity prefs:', err);
      setError(err instanceof Error ? err : new Error('Failed to save activity preferences'));
    }
  }

  // ── Privacy toggles ──

  function onTogglePrivacyOpenPlanets(): void {
    setPrivacyOpenPlanets((prev) => !prev);
  }

  function onTogglePrivacyOrbitRequests(): void {
    setPrivacyOrbitRequests((prev) => !prev);
  }

  function onTogglePrivacyActivityToCrew(): void {
    setPrivacyActivityToCrew((prev) => !prev);
  }

  // ── Toast ──

  function onShowToast(message: string): void {
    if (toastTimeoutRef.current != null) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(onDismissToast, TOAST_DURATION_IN_MS);
  }

  function onDismissToast(): void {
    setToastMessage(undefined);
  }

  // ── Auth actions ──

  async function handleLogout(navigateAfterLogout: () => void): Promise<void> {
    setIsLoading(true);
    const { error: signOutError } = await Auth.signOut(supabaseClient);
    setIsLoading(false);
    if (signOutError) {
      console.error('Failed to logout', signOutError);
      setError(signOutError instanceof Error ? signOutError : new Error('Failed to logout'));
      return;
    }
    resetOnboardingContext();
    navigateAfterLogout();
  }

  function onConfirmSignOut(navigateAfterLogout: () => void): void {
    handleLogout(navigateAfterLogout).catch((err) => {
      console.error('handleLogout error', err);
    });
  }

  function onDeleteAccount(navigateAfterLogout: () => void): void {
    alert(
      t('auth.deleteAccount'),
      t('auth.deleteAccountConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onConfirmDeleteAccount(navigateAfterLogout),
        },
      ],
      { cancelable: true },
    );
  }

  function onConfirmDeleteAccount(navigateAfterLogout: () => void): void {
    handleDeleteAccount(navigateAfterLogout).catch((err) => {
      console.error('onDeleteAccount error:', err);
    });
  }

  async function handleDeleteAccount(navigateAfterLogout: () => void): Promise<void> {
    setIsLoading(true);
    try {
      await deleteCurrentUser(supabaseClient);
      const { error: signOutError } = await Auth.signOut(supabaseClient);
      setIsLoading(false);
      if (signOutError) {
        console.error('Failed to logout after account deletion', signOutError);
        setError(signOutError instanceof Error ? signOutError : new Error('Failed to logout'));
        return;
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Failed to delete account:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete account'));
    }
    resetOnboardingContext();
    navigateAfterLogout();
  }

  return {
    isLoading,
    error,
    displayName,
    avatarUrl,
    verificationStatus,
    isBusinessOwner,
    stats,
    activityHistory,
    hasPhoneNumber,
    hasAttendedEvent,
    isUploadingPhoto: assetUpload.assetUploading,
    onPickPhoto,
    activeSheet,
    onOpenSettingsSheet,
    onCloseSheet,
    onOpenSubSheet,
    editFirstName,
    editLastName,
    editUsername,
    editBio,
    isSavingProfile,
    onEditFirstNameChange,
    onEditLastNameChange,
    onEditUsernameChange,
    onEditBioChange,
    onSaveProfile,
    notifBattles,
    notifPlanets,
    notifOrbit,
    notifNudges,
    notifDeals,
    onToggleNotifBattles,
    onToggleNotifPlanets,
    onToggleNotifOrbit,
    onToggleNotifNudges,
    onToggleNotifDeals,
    selectedActivityIds,
    onToggleActivityPref,
    onSaveActivityPrefs,
    privacyOpenPlanets,
    privacyOrbitRequests,
    privacyActivityToCrew,
    onTogglePrivacyOpenPlanets,
    onTogglePrivacyOrbitRequests,
    onTogglePrivacyActivityToCrew,
    toastMessage,
    onShowToast,
    onDismissToast,
    onConfirmSignOut,
    onDeleteAccount,
  };
}
