/**
 * Main container for the Profile route
 */

import { type ReactElement, type ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  Modal,
  Switch,
  type ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Camera,
  CheckCircle,
  User,
  ChevronRight,
  Store,
  LogOut,
  Bell,
  Shield,
  Globe,
  MapPin,
  Lock,
  HelpCircle,
  Star,
} from 'lucide-react-native';

import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import {
  useProfileStyles,
  type StatItemStyles,
  type ActivityCardStyles,
  type LoadingStyles,
  type SettingsSheetStyles,
  type EditProfileSheetStyles,
  type VerifySheetStyles,
  type NotificationsSheetStyles,
  type ActivityPrefsSheetStyles,
  type PrivacySheetStyles,
  type SignOutConfirmSheetStyles,
  type ToastStyles,
} from './ProfileStyles';
import { useProfile } from './ProfileFunc';
import type { SwipeWithActivityV1, ActivityCategory, VerificationStatus } from '@shared/generated-db-types';
import { ProfileProps } from '@/app/(tabs)/profile';
import { t } from '@/i18n';

// ── Constants ──

const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'NIGHTLIFE',
  'FOOD_AND_DRINKS',
  'OUTDOOR',
  'LIVE_MUSIC',
  'SPORTS',
  'ARTS',
  'GAMING',
  'WELLNESS',
];

const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  NIGHTLIFE: 'Nightlife',
  FOOD_AND_DRINKS: 'Food & Drinks',
  OUTDOOR: 'Outdoor',
  LIVE_MUSIC: 'Live Music',
  SPORTS: 'Sports',
  ARTS: 'Arts',
  GAMING: 'Gaming',
  WELLNESS: 'Wellness',
  COMEDY: 'Comedy',
};

const TOGGLE_ON_COLOR = '#FF5C4D';
const TOGGLE_OFF_COLOR = '#3a4a6b';

function getTierLabel(status: VerificationStatus): string {
  if (status === 'VERIFIED') return t('profile.verifyTierVerified');
  if (status === 'PENDING') return 'Pending';
  return t('profile.verifyTierNew');
}

// ── StatItem ──

interface StatItemProps {
  value: number;
  label: string;
  styles: StatItemStyles;
}

function StatItem(props: StatItemProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.value} title={String(props.value)} />
      <CustomTextField styles={props.styles.label} title={props.label} />
    </View>
  );
}

// ── ActivityCard ──

interface ActivityCardProps {
  item: SwipeWithActivityV1;
  styles: ActivityCardStyles;
}

function ActivityCard(props: ActivityCardProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Image
        source={{ uri: props.item.activityImageUrl ?? undefined }}
        style={props.styles.image}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={props.styles.overlay}
      >
        <CustomTextField styles={props.styles.title} title={props.item.activityTitle ?? ''} />
        <CustomTextField styles={props.styles.category} title={props.item.activityCategory ?? ''} />
      </LinearGradient>
    </View>
  );
}

// ── Settings Sheet ──

interface SettingsSheetProps {
  styles: SettingsSheetStyles;
  onClose: () => void;
  onOpenEditProfile: () => void;
  onOpenVerifyIdentity: () => void;
  onOpenNotifications: () => void;
  onOpenActivityPrefs: () => void;
  onOpenPrivacy: () => void;
  onNavigateToBusinessDashboard: () => void;
  onShowToast: (message: string) => void;
  onOpenSignOutConfirm: () => void;
}

function SettingsSheet(props: SettingsSheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.titleRow}>
            <CustomTextField styles={s.title} title={t('profile.settings')} />
          </View>

          {/* ── ACCOUNT ── */}
          <CustomTextField styles={s.sectionLabel} title={t('profile.settingsSectionAccount')} />

          <Pressable style={s.settingRow} onPress={props.onOpenEditProfile}>
            <View style={s.settingIconWrapper}>
              <User size={20} color="#FF5C4D" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.editProfile')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.editProfileSubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          <Pressable style={s.settingRow} onPress={props.onOpenVerifyIdentity}>
            <View style={s.settingIconWrapper}>
              <Shield size={20} color="#CFFF47" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.verifyIdentity')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.verifySubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          <Pressable style={s.settingRowLast} onPress={props.onOpenNotifications}>
            <View style={s.settingIconWrapper}>
              <Bell size={20} color="#FF5C4D" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.notifications')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.notificationsSubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          {/* ── PREFERENCES ── */}
          <CustomTextField styles={s.sectionLabel} title={t('profile.settingsSectionPreferences')} />

          <Pressable style={s.settingRow} onPress={props.onOpenActivityPrefs}>
            <View style={s.settingIconWrapper}>
              <Globe size={20} color="#CFFF47" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.activityPreferences')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.activityPrefsSubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          <Pressable style={s.settingRow} onPress={() => {}}>
            <View style={s.settingIconWrapper}>
              <MapPin size={20} color="#FF5C4D" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.defaultLocation')} />
              <CustomTextField styles={s.settingSubtitleAccent} title={t('profile.defaultLocationCity')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          <Pressable style={s.settingRowLast} onPress={props.onOpenPrivacy}>
            <View style={s.settingIconWrapper}>
              <Lock size={20} color="rgba(255, 245, 236, 0.6)" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.privacy')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.privacySubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          {/* ── BUSINESS ── */}
          <CustomTextField styles={s.sectionLabel} title={t('profile.settingsSectionBusiness')} />

          <Pressable style={s.settingRowLast} onPress={props.onNavigateToBusinessDashboard}>
            <View style={s.settingIconWrapper}>
              <Store size={20} color="#CFFF47" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.businessDashboard')} />
              <CustomTextField styles={s.settingSubtitle} title={t('profile.businessDashboardSettingsSubtitle')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          {/* ── SUPPORT ── */}
          <CustomTextField styles={s.sectionLabel} title={t('profile.settingsSectionSupport')} />

          <Pressable
            style={s.settingRow}
            onPress={() => props.onShowToast(t('profile.helpCenterToast'))}
          >
            <View style={s.settingIconWrapper}>
              <HelpCircle size={20} color="rgba(255, 245, 236, 0.6)" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.helpCenter')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          <Pressable
            style={s.settingRowLast}
            onPress={() => props.onShowToast(t('profile.ratePlanetToast'))}
          >
            <View style={s.settingIconWrapper}>
              <Star size={20} color="#CFFF47" />
            </View>
            <View style={s.settingTextContainer}>
              <CustomTextField styles={s.settingLabel} title={t('profile.ratePlanet')} />
            </View>
            <View style={s.settingChevronWrapper}>
              <ChevronRight size={16} color="rgba(255, 245, 236, 0.4)" />
            </View>
          </Pressable>

          {/* ── Sign Out ── */}
          <Pressable style={s.signOutRow} onPress={props.onOpenSignOutConfirm}>
            <View style={s.settingIconWrapper}>
              <LogOut size={20} color="#FF5C4D" />
            </View>
            <CustomTextField styles={s.signOutLabel} title={t('profile.signOutButton')} />
          </Pressable>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

// ── Edit Profile Sheet ──

interface EditProfileSheetProps {
  styles: EditProfileSheetStyles;
  avatarUrl?: string;
  isUploadingPhoto: boolean;
  onPickPhoto: () => void;
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
  onClose: () => void;
}

function EditProfileSheet(props: EditProfileSheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <View style={s.titleRow}>
          <CustomTextField styles={s.title} title={t('profile.editProfile')} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.photoSection}>
            <Pressable onPress={props.onPickPhoto}>
              <View style={s.photoCircle}>
                {props.avatarUrl != null ? (
                  <Image
                    source={{ uri: props.avatarUrl }}
                    style={s.photoImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={s.photoPlaceholder}>
                    <User size={32} color="#FFF5EC" />
                  </View>
                )}
                {props.isUploadingPhoto && (
                  <View style={s.photoLoadingOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={s.photoOverlay}>
                <View style={s.photoOverlayIcon}>
                  <Camera size={14} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          </View>

          <View style={s.inputSection}>
            <CustomTextInput
              styles={s.textInputStyles}
              value={props.editFirstName}
              onChangeText={props.onEditFirstNameChange}
              placeholder={t('profile.editProfileFirstName')}
            />
            <CustomTextInput
              styles={s.textInputStyles}
              value={props.editLastName}
              onChangeText={props.onEditLastNameChange}
              placeholder={t('profile.editProfileLastName')}
            />
            <CustomTextInput
              styles={s.textInputStyles}
              value={props.editUsername}
              onChangeText={props.onEditUsernameChange}
              placeholder={t('profile.editProfileUsername')}
              autoCapitalize="none"
            />
            <CustomTextInput
              styles={s.textInputStyles}
              value={props.editBio}
              onChangeText={props.onEditBioChange}
              placeholder={t('profile.editProfileBio')}
              multiline
            />
          </View>
        </ScrollView>
        <View style={s.saveButtonSection}>
          <CustomButton
            styles={s.saveButton}
            title={t('profile.saveChanges')}
            onPress={props.onSaveProfile}
            disabled={props.isSavingProfile}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Verify Identity Sheet ──

interface VerifyIdentitySheetProps {
  styles: VerifySheetStyles;
  verificationStatus: VerificationStatus;
  hasPhoneNumber: boolean;
  hasAttendedEvent: boolean;
  onClose: () => void;
}

function VerifyIdentitySheet(props: VerifyIdentitySheetProps): ReactNode {
  const s = props.styles;
  const tierLabel = getTierLabel(props.verificationStatus);
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.titleRow}>
            <CustomTextField styles={s.title} title={t('profile.verifyIdentity')} />
          </View>

          <View style={s.tierBadgeSection}>
            <View style={s.tierBadge}>
              <CustomTextField styles={s.tierBadgeText} title={tierLabel} />
            </View>
          </View>

          <View style={s.stepsSection}>
            <View style={s.stepRow}>
              {props.hasPhoneNumber ? (
                <View style={s.stepIconComplete}>
                  <CheckCircle size={24} color="#CFFF47" />
                </View>
              ) : (
                <View style={s.stepIconIncomplete} />
              )}
              <View style={s.stepTextContainer}>
                <CustomTextField styles={s.stepLabel} title={t('profile.verifyPhoneStep')} />
              </View>
            </View>

            <View style={s.stepRow}>
              {props.hasAttendedEvent ? (
                <View style={s.stepIconComplete}>
                  <CheckCircle size={24} color="#CFFF47" />
                </View>
              ) : (
                <View style={s.stepIconIncomplete} />
              )}
              <View style={s.stepTextContainer}>
                <CustomTextField styles={s.stepLabel} title={t('profile.verifyEventStep')} />
              </View>
            </View>

            <View style={s.stepRow}>
              <View style={s.stepIconIncomplete} />
              <View style={s.stepTextContainer}>
                <CustomTextField styles={s.stepLabel} title={t('profile.verifyRatingStep')} />
                <CustomTextField styles={s.stepHint} title={t('profile.verifyRatingHint')} />
              </View>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.tiersSection}>
            <CustomTextField styles={s.tiersSectionTitle} title="WHAT EACH TIER UNLOCKS" />
            <View style={s.tierRow}>
              <View style={s.tierBadgePill}>
                <CustomTextField styles={s.tierBadgePillText} title={t('profile.verifyTierNew')} />
              </View>
              <CustomTextField styles={s.tierAccess} title={t('profile.verifyTierNewAccess')} />
            </View>
            <View style={s.tierRow}>
              <View style={s.tierBadgePill}>
                <CustomTextField styles={s.tierBadgePillText} title={t('profile.verifyTierVerified')} />
              </View>
              <CustomTextField styles={s.tierAccess} title={t('profile.verifyTierVerifiedAccess')} />
            </View>
            <View style={s.tierRow}>
              <View style={s.tierBadgePill}>
                <CustomTextField styles={s.tierBadgePillText} title={t('profile.verifyTierTrusted')} />
              </View>
              <CustomTextField styles={s.tierAccess} title={t('profile.verifyTierTrustedAccess')} />
            </View>
          </View>

          <View style={s.closeLinkRow}>
            <Pressable onPress={props.onClose}>
              <CustomTextField styles={s.closeLink} title={t('profile.close')} />
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

// ── Notifications Sheet ──

interface NotificationsSheetProps {
  styles: NotificationsSheetStyles;
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
  onClose: () => void;
}

function NotificationsSheet(props: NotificationsSheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <View style={s.titleRow}>
          <CustomTextField styles={s.title} title={t('profile.notifications')} />
        </View>

        <View style={s.toggleRow}>
          <View style={s.toggleTextContainer}>
            <CustomTextField styles={s.toggleLabel} title={t('profile.notifBattles')} />
            <CustomTextField styles={s.toggleSubtitle} title={t('profile.notifBattlesSubtitle')} />
          </View>
          <Switch
            value={props.notifBattles}
            onValueChange={props.onToggleNotifBattles}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRow}>
          <View style={s.toggleTextContainer}>
            <CustomTextField styles={s.toggleLabel} title={t('profile.notifPlanets')} />
            <CustomTextField styles={s.toggleSubtitle} title={t('profile.notifPlanetsSubtitle')} />
          </View>
          <Switch
            value={props.notifPlanets}
            onValueChange={props.onToggleNotifPlanets}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRow}>
          <View style={s.toggleTextContainer}>
            <CustomTextField styles={s.toggleLabel} title={t('profile.notifOrbit')} />
            <CustomTextField styles={s.toggleSubtitle} title={t('profile.notifOrbitSubtitle')} />
          </View>
          <Switch
            value={props.notifOrbit}
            onValueChange={props.onToggleNotifOrbit}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRow}>
          <View style={s.toggleTextContainer}>
            <CustomTextField styles={s.toggleLabel} title={t('profile.notifNudges')} />
            <CustomTextField styles={s.toggleSubtitle} title={t('profile.notifNudgesSubtitle')} />
          </View>
          <Switch
            value={props.notifNudges}
            onValueChange={props.onToggleNotifNudges}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRowLast}>
          <View style={s.toggleTextContainer}>
            <CustomTextField styles={s.toggleLabel} title={t('profile.notifDeals')} />
            <CustomTextField styles={s.toggleSubtitle} title={t('profile.notifDealsSubtitle')} />
          </View>
          <Switch
            value={props.notifDeals}
            onValueChange={props.onToggleNotifDeals}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Activity Preferences Sheet ──

interface ActivityPrefsSheetProps {
  styles: ActivityPrefsSheetStyles;
  selectedActivityIds: ActivityCategory[];
  onToggleActivityPref: (id: ActivityCategory) => void;
  onSaveActivityPrefs: () => void;
  onClose: () => void;
}

function ActivityPrefsSheet(props: ActivityPrefsSheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <View style={s.titleRow}>
          <CustomTextField styles={s.title} title={t('profile.activityPreferences')} />
        </View>
        <View style={s.pillGrid}>
          {ACTIVITY_CATEGORIES.map((category) => {
            const isSelected = props.selectedActivityIds.includes(category);
            return (
              <Pressable
                key={category}
                style={[s.pill, isSelected ? s.pillSelected : undefined]}
                onPress={() => props.onToggleActivityPref(category)}
              >
                <CustomTextField
                  styles={isSelected ? s.pillTextSelected : s.pillText}
                  title={ACTIVITY_CATEGORY_LABELS[category]}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={s.saveButtonSection}>
          <CustomButton
            styles={s.saveButton}
            title={t('profile.activityPrefsSave')}
            onPress={props.onSaveActivityPrefs}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Privacy Sheet ──

interface PrivacySheetProps {
  styles: PrivacySheetStyles;
  privacyOpenPlanets: boolean;
  privacyOrbitRequests: boolean;
  privacyActivityToCrew: boolean;
  onTogglePrivacyOpenPlanets: () => void;
  onTogglePrivacyOrbitRequests: () => void;
  onTogglePrivacyActivityToCrew: () => void;
  onClose: () => void;
}

function PrivacySheet(props: PrivacySheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <View style={s.titleRow}>
          <CustomTextField styles={s.title} title={t('profile.privacy')} />
        </View>

        <View style={s.toggleRow}>
          <CustomTextField styles={s.toggleLabel} title={t('profile.privacyOpenPlanets')} />
          <Switch
            value={props.privacyOpenPlanets}
            onValueChange={props.onTogglePrivacyOpenPlanets}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRow}>
          <CustomTextField styles={s.toggleLabel} title={t('profile.privacyOrbitRequests')} />
          <Switch
            value={props.privacyOrbitRequests}
            onValueChange={props.onTogglePrivacyOrbitRequests}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>

        <View style={s.toggleRowLast}>
          <CustomTextField styles={s.toggleLabel} title={t('profile.privacyActivityToCrew')} />
          <Switch
            value={props.privacyActivityToCrew}
            onValueChange={props.onTogglePrivacyActivityToCrew}
            trackColor={{ false: TOGGLE_OFF_COLOR, true: TOGGLE_ON_COLOR }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={TOGGLE_OFF_COLOR}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Sign Out Confirm Sheet ──

interface SignOutConfirmSheetProps {
  styles: SignOutConfirmSheetStyles;
  onConfirmSignOut: () => void;
  onClose: () => void;
}

function SignOutConfirmSheet(props: SignOutConfirmSheetProps): ReactNode {
  const s = props.styles;
  return (
    <Pressable style={s.backdrop} onPress={props.onClose}>
      <Pressable style={s.sheet} onPress={() => {}}>
        <View style={s.dragHandle} />
        <CustomTextField styles={s.title} title={t('profile.signOutConfirmTitle')} />
        <CustomButton
          styles={s.confirmButton}
          title={t('profile.signOutButton')}
          onPress={props.onConfirmSignOut}
        />
        <View style={s.cancelLinkRow}>
          <Pressable onPress={props.onClose}>
            <CustomTextField styles={s.cancelLink} title={t('profile.cancelEdit')} />
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Toast ──

interface ToastProps {
  message: string;
  styles: ToastStyles;
}

function Toast(props: ToastProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.text} title={props.message} />
    </View>
  );
}

// ── Main ProfileContainer ──

export default function ProfileContainer(props: ProfileProps): ReactNode {
  const {
    styles,
    loadingStyles,
    statItemStyles,
    activityCardStyles,
    settingsSheetStyles,
    editProfileSheetStyles,
    verifySheetStyles,
    notificationsSheetStyles,
    activityPrefsSheetStyles,
    privacySheetStyles,
    signOutConfirmSheetStyles,
    toastStyles,
  } = useProfileStyles();

  const {
    isLoading,
    displayName,
    avatarUrl,
    verificationStatus,
    stats,
    activityHistory,
    hasPhoneNumber,
    hasAttendedEvent,
    isUploadingPhoto,
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
    onConfirmSignOut,
  } = useProfile(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };
  const isVerified = verificationStatus === 'VERIFIED';

  function renderActivityCard(info: ListRenderItemInfo<SwipeWithActivityV1>): ReactElement {
    return <ActivityCard item={info.item} styles={activityCardStyles} />;
  }

  function activityKeyExtractor(item: SwipeWithActivityV1, index: number): string {
    return item.swipe?.id ?? String(index);
  }

  function onBackToSettings(): void {
    onOpenSubSheet('settings');
  }

  function onHandleSignOut(): void {
    onConfirmSignOut(() => props.onNavigateToAuth());
  }

  if (isLoading) {
    return (
      <SafeAreaView style={loadingStyles.container} {...safeAreaProps}>
        <ActivityIndicator size="large" color="#CFFF47" />
        <CustomTextField styles={loadingStyles.text} title={t('profile.loadingProfile')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.headerRow}>
          <CustomTextField styles={styles.headerTitle} title={t('profile.title')} />
          <Pressable style={styles.settingsButton} onPress={onOpenSettingsSheet}>
            <View style={styles.settingsIconWrapper}>
              <Settings size={24} color="#FFF5EC" />
            </View>
          </Pressable>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable onPress={onPickPhoto}>
            <View style={styles.avatarContainer}>
              {avatarUrl != null ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <View style={styles.avatarPlaceholderIcon}>
                    <User size={40} color="#FFF5EC" />
                  </View>
                </View>
              )}
              {isUploadingPhoto && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.avatarEditOverlay}>
              <View style={styles.avatarEditIconWrapper}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Display name & verification badge */}
        <View style={styles.nameRow}>
          <CustomTextField
            styles={styles.displayName}
            title={displayName || '\u2014'}
          />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={20} color="#CFFF47" />
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatItem value={stats.groupsCount} label={t('profile.statsGroups')} styles={statItemStyles} />
          <StatItem value={stats.battlesWon} label={t('profile.statsBattles')} styles={statItemStyles} />
          <StatItem value={stats.activitiesDiscovered} label={t('profile.statsDiscovered')} styles={statItemStyles} />
        </View>

        {/* Recent Activity — moved up directly after stats (no edit profile button gap) */}
        {activityHistory.length > 0 && (
          <View style={styles.activitySection}>
            <CustomTextField styles={styles.activitySectionTitle} title={t('profile.recentActivity')} />
            <FlatList
              data={activityHistory}
              renderItem={renderActivityCard}
              keyExtractor={activityKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.activityList}
              contentContainerStyle={styles.activityListContent}
            />
          </View>
        )}
      </ScrollView>

      {/* Toast overlay */}
      {toastMessage != null && (
        <View style={styles.toastOverlay}>
          <Toast message={toastMessage} styles={toastStyles} />
        </View>
      )}

      {/* Settings sheet */}
      {activeSheet === 'settings' && (
        <Modal transparent animationType="slide" onRequestClose={onCloseSheet}>
          <SettingsSheet
            styles={settingsSheetStyles}
            onClose={onCloseSheet}
            onOpenEditProfile={() => onOpenSubSheet('editProfile')}
            onOpenVerifyIdentity={() => onOpenSubSheet('verifyIdentity')}
            onOpenNotifications={() => onOpenSubSheet('notifications')}
            onOpenActivityPrefs={() => onOpenSubSheet('activityPrefs')}
            onOpenPrivacy={() => onOpenSubSheet('privacy')}
            onNavigateToBusinessDashboard={() => {
              onCloseSheet();
              props.onNavigateToBusinessDashboard();
            }}
            onShowToast={(message) => {
              onCloseSheet();
              onShowToast(message);
            }}
            onOpenSignOutConfirm={() => onOpenSubSheet('signOutConfirm')}
          />
        </Modal>
      )}

      {/* Edit Profile sheet */}
      {activeSheet === 'editProfile' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <EditProfileSheet
            styles={editProfileSheetStyles}
            avatarUrl={avatarUrl}
            isUploadingPhoto={isUploadingPhoto}
            onPickPhoto={onPickPhoto}
            editFirstName={editFirstName}
            editLastName={editLastName}
            editUsername={editUsername}
            editBio={editBio}
            isSavingProfile={isSavingProfile}
            onEditFirstNameChange={onEditFirstNameChange}
            onEditLastNameChange={onEditLastNameChange}
            onEditUsernameChange={onEditUsernameChange}
            onEditBioChange={onEditBioChange}
            onSaveProfile={onSaveProfile}
            onClose={onBackToSettings}
          />
        </Modal>
      )}

      {/* Verify Identity sheet */}
      {activeSheet === 'verifyIdentity' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <VerifyIdentitySheet
            styles={verifySheetStyles}
            verificationStatus={verificationStatus}
            hasPhoneNumber={hasPhoneNumber}
            hasAttendedEvent={hasAttendedEvent}
            onClose={onBackToSettings}
          />
        </Modal>
      )}

      {/* Notifications sheet */}
      {activeSheet === 'notifications' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <NotificationsSheet
            styles={notificationsSheetStyles}
            notifBattles={notifBattles}
            notifPlanets={notifPlanets}
            notifOrbit={notifOrbit}
            notifNudges={notifNudges}
            notifDeals={notifDeals}
            onToggleNotifBattles={onToggleNotifBattles}
            onToggleNotifPlanets={onToggleNotifPlanets}
            onToggleNotifOrbit={onToggleNotifOrbit}
            onToggleNotifNudges={onToggleNotifNudges}
            onToggleNotifDeals={onToggleNotifDeals}
            onClose={onBackToSettings}
          />
        </Modal>
      )}

      {/* Activity Preferences sheet */}
      {activeSheet === 'activityPrefs' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <ActivityPrefsSheet
            styles={activityPrefsSheetStyles}
            selectedActivityIds={selectedActivityIds}
            onToggleActivityPref={onToggleActivityPref}
            onSaveActivityPrefs={onSaveActivityPrefs}
            onClose={onBackToSettings}
          />
        </Modal>
      )}

      {/* Privacy sheet */}
      {activeSheet === 'privacy' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <PrivacySheet
            styles={privacySheetStyles}
            privacyOpenPlanets={privacyOpenPlanets}
            privacyOrbitRequests={privacyOrbitRequests}
            privacyActivityToCrew={privacyActivityToCrew}
            onTogglePrivacyOpenPlanets={onTogglePrivacyOpenPlanets}
            onTogglePrivacyOrbitRequests={onTogglePrivacyOrbitRequests}
            onTogglePrivacyActivityToCrew={onTogglePrivacyActivityToCrew}
            onClose={onBackToSettings}
          />
        </Modal>
      )}

      {/* Sign Out Confirm sheet */}
      {activeSheet === 'signOutConfirm' && (
        <Modal transparent animationType="slide" onRequestClose={onBackToSettings}>
          <SignOutConfirmSheet
            styles={signOutConfirmSheetStyles}
            onConfirmSignOut={onHandleSignOut}
            onClose={onBackToSettings}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}
