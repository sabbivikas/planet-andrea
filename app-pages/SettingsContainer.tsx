/**
 * Main container for the Settings route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Pressable } from 'react-native';
import {
  Mail,
  Lock,
  ShieldCheck,
  Swords,
  Users,
  Tag,
  UserPlus,
  MapPin,
  Layers,
  Ban,
  Database,
  Info,
  FileText,
  Shield,
  HelpCircle,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomSwitch } from '@/comp-lib/core/custom-switch/CustomSwitch';
import {
  useSettingsStyles,
  type SectionHeaderStyles,
  type SettingRowStyles,
  type SettingSwitchRowStyles,
} from './SettingsStyles';
import { useSettings } from './SettingsFunc';
import { type SettingsProps } from '@/app/settings';
import { type CustomSwitchStyles } from '@/comp-lib/core/custom-switch/CustomSwitchStyles';

// ── Constants ──

const ICON_SIZE = 18;

// ── Sub-components ──

interface SectionHeaderProps {
  styles: SectionHeaderStyles;
  title: string;
}

function SectionHeader(props: SectionHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.title} title={props.title} />
    </View>
  );
}

interface SettingRowProps {
  styles: SettingRowStyles;
  icon: ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  showDivider?: boolean;
}

function SettingRow(props: SettingRowProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.pressable} onPress={props.onPress}>
        <View style={props.styles.iconContainer}>
          {props.icon}
        </View>
        <View style={props.styles.textContainer}>
          <CustomTextField styles={props.styles.label} title={props.label} />
        </View>
        <View style={props.styles.valueContainer}>
          {props.value != null && (
            <CustomTextField styles={props.styles.value} title={props.value} numberOfLines={1} />
          )}
          <View style={props.styles.chevronContainer}>
            <ChevronRight size={16} color={props.styles.chevronColor} />
          </View>
        </View>
      </Pressable>
      {props.showDivider !== false && <View style={props.styles.divider} />}
    </View>
  );
}

interface SettingSwitchRowProps {
  styles: SettingSwitchRowStyles;
  switchStyles: CustomSwitchStyles;
  icon: ReactNode;
  label: string;
  hint?: string;
  value: boolean;
  onToggle: () => void;
  showDivider?: boolean;
}

function SettingSwitchRow(props: SettingSwitchRowProps): ReactNode {
  return (
    <View>
      <View style={props.styles.container}>
        <View style={props.styles.iconContainer}>
          {props.icon}
        </View>
        <View style={props.styles.textContainer}>
          <CustomTextField styles={props.styles.label} title={props.label} />
          {props.hint != null && (
            <CustomTextField styles={props.styles.hint} title={props.hint} />
          )}
        </View>
        <CustomSwitch
          value={props.value}
          onValueChange={props.onToggle}
          styles={props.switchStyles}
        />
      </View>
      {props.showDivider !== false && <View style={props.styles.divider} />}
    </View>
  );
}

// ── Helpers ──

function getVerificationLabel(status: string): string {
  switch (status) {
    case 'verified':
      return t('settings.verificationVerified');
    case 'pending':
      return t('settings.verificationPending');
    default:
      return t('settings.verificationNotStarted');
  }
}

// ── Main component ──

export default function SettingsContainer(props: SettingsProps): ReactNode {
  const {
    styles,
    headerStyles,
    sectionHeaderStyles,
    settingRowStyles,
    settingSwitchRowStyles,
    switchStyles,
    deleteButtonStyles,
  } = useSettingsStyles();

  const {
    email,
    verificationDisplayStatus,
    notificationPreferences,
    onToggleNotification,
    locationEnabled,
    selectedCategoriesCount,
    appVersion,
    onDeleteAccount,
    onChangePassword,
    onLocationSettings,
    onActivityPreferences,
    onBlockedUsers,
    onDataControls,
    onTermsOfService,
    onPrivacyPolicy,
    onHelpSupport,
  } = useSettings(props);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          showBackButton
          onGoBack={props.onGoBack}
          title={t('settings.title')}
          customHeaderStyles={headerStyles}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Account Section ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionAccount')} />
            <View style={styles.sectionCard}>
              <SettingRow
                styles={settingRowStyles}
                icon={<Mail size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.email')}
                value={email}
                onPress={() => {}}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<Lock size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.changePassword')}
                onPress={onChangePassword}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<ShieldCheck size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.verification')}
                value={getVerificationLabel(verificationDisplayStatus)}
                onPress={() => props.onNavigateToVerification()}
                showDivider={false}
              />
            </View>
          </View>

          {/* ── Notifications Section ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionNotifications')} />
            <View style={styles.sectionCard}>
              <SettingSwitchRow
                styles={settingSwitchRowStyles}
                switchStyles={switchStyles}
                icon={<Swords size={ICON_SIZE} color={settingSwitchRowStyles.iconColor} />}
                label={t('settings.notifBattles')}
                hint={t('settings.notifBattlesHint')}
                value={notificationPreferences.battles}
                onToggle={() => onToggleNotification('battles')}
              />
              <SettingSwitchRow
                styles={settingSwitchRowStyles}
                switchStyles={switchStyles}
                icon={<Users size={ICON_SIZE} color={settingSwitchRowStyles.iconColor} />}
                label={t('settings.notifGroupActivity')}
                hint={t('settings.notifGroupActivityHint')}
                value={notificationPreferences.groupActivity}
                onToggle={() => onToggleNotification('groupActivity')}
              />
              <SettingSwitchRow
                styles={settingSwitchRowStyles}
                switchStyles={switchStyles}
                icon={<Tag size={ICON_SIZE} color={settingSwitchRowStyles.iconColor} />}
                label={t('settings.notifDeals')}
                hint={t('settings.notifDealsHint')}
                value={notificationPreferences.deals}
                onToggle={() => onToggleNotification('deals')}
              />
              <SettingSwitchRow
                styles={settingSwitchRowStyles}
                switchStyles={switchStyles}
                icon={<UserPlus size={ICON_SIZE} color={settingSwitchRowStyles.iconColor} />}
                label={t('settings.notifFriendActivity')}
                hint={t('settings.notifFriendActivityHint')}
                value={notificationPreferences.friendActivity}
                onToggle={() => onToggleNotification('friendActivity')}
                showDivider={false}
              />
            </View>
          </View>

          {/* ── Preferences Section ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionPreferences')} />
            <View style={styles.sectionCard}>
              <SettingRow
                styles={settingRowStyles}
                icon={<MapPin size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.location')}
                value={locationEnabled ? t('settings.locationValue') : '—'}
                onPress={onLocationSettings}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<Layers size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.activityCategories')}
                value={selectedCategoriesCount > 0 ? String(selectedCategoriesCount) : t('settings.activityCategoriesValue')}
                onPress={onActivityPreferences}
                showDivider={false}
              />
            </View>
          </View>

          {/* ── Privacy Section ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionPrivacy')} />
            <View style={styles.sectionCard}>
              <SettingRow
                styles={settingRowStyles}
                icon={<Ban size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.blockedUsers')}
                onPress={onBlockedUsers}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<Database size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.dataControls')}
                onPress={onDataControls}
                showDivider={false}
              />
            </View>
          </View>

          {/* ── About Section ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionAbout')} />
            <View style={styles.sectionCard}>
              <SettingRow
                styles={settingRowStyles}
                icon={<Info size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.appVersion')}
                value={appVersion}
                onPress={() => {}}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<FileText size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.termsOfService')}
                onPress={onTermsOfService}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<Shield size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.privacyPolicy')}
                onPress={onPrivacyPolicy}
              />
              <SettingRow
                styles={settingRowStyles}
                icon={<HelpCircle size={ICON_SIZE} color={settingRowStyles.iconColor} />}
                label={t('settings.helpSupport')}
                onPress={onHelpSupport}
                showDivider={false}
              />
            </View>
          </View>

          {/* ── Danger Zone ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader styles={sectionHeaderStyles} title={t('settings.sectionDangerZone')} />
            <View style={styles.dangerCard}>
              <CustomButton
                styles={deleteButtonStyles}
                title={t('settings.deleteAccount')}
                onPress={onDeleteAccount}
                leftIcon={({ size, color }) => (
                  <Trash2 size={size ?? ICON_SIZE} color={color as string} />
                )}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
