/**
 * Main container for the Invite route — invite friends to a group
 */

import { type ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  X,
  Link2,
  Search,
  ShieldCheck,
  Send,
  MapPin,
  Clock,
  Check,
  Users,
  Loader2,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { useInviteStyles } from './InviteStyles';
import {
  useInvite,
  type ContactItem,
  type PlanetUserResult,
  type NearbyUserItem,
  type PendingInviteItem,
} from './InviteFunc';
import { InviteProps } from '@/app/group/[groupId]/invite';
import {
  type InviteHeaderStyles,
  type ShareLinkCardStyles,
  type SectionHeaderStyles,
  type UserRowStyles,
  type PendingInviteRowStyles,
} from './InviteStyles';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 60;
const HERO_GRADIENT_ANGLE = { start: { x: 0, y: 0 }, end: { x: 1, y: 0.6 } };

// ── Sub-components ──

interface InviteHeaderProps {
  styles: InviteHeaderStyles;
  groupName: string;
  onClose: () => void;
}

function InviteHeader(props: InviteHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.closeButton} onPress={props.onClose}>
        <View style={props.styles.closeIcon}>
          <X size={22} color="#FFF5EC" />
        </View>
      </Pressable>
      <View style={props.styles.titleArea}>
        <CustomTextField
          styles={props.styles.titleText}
          title={t('invite.title', { groupName: props.groupName })}
          numberOfLines={1}
        />
      </View>
      <View style={props.styles.placeholder} />
    </View>
  );
}

interface ShareLinkSectionProps {
  styles: ShareLinkCardStyles;
  inviteLink: string;
  isLinkCopied: boolean;
  onCopyLink: () => void;
  onShareLink: () => void;
}

function ShareLinkSection(props: ShareLinkSectionProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <View style={props.styles.container}>
        <LinearGradient
          colors={['#FF5C4D', '#FF9A3C']}
          start={HERO_GRADIENT_ANGLE.start}
          end={HERO_GRADIENT_ANGLE.end}
          style={props.styles.gradient}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24, height: 24 }}>
              <Link2 size={24} color="#FFF5EC" />
            </View>
            <CustomTextField styles={props.styles.label} title={t('invite.shareLink')} />
          </View>
          <CustomTextField styles={props.styles.hint} title={t('invite.shareLinkHint')} />
          <View style={props.styles.linkRow}>
            <CustomTextField styles={props.styles.linkText} title={props.inviteLink} numberOfLines={1} />
            <CustomButton
              onPress={props.onCopyLink}
              title={props.isLinkCopied ? t('invite.linkCopied') : t('invite.copyLink')}
              styles={props.styles.copyButton}
              leftIcon={({ size, color }) => (
                <View style={{ width: size, height: size }}>
                  {props.isLinkCopied ? (
                    <Check size={size ?? 14} color={color as string} />
                  ) : undefined}
                </View>
              )}
            />
          </View>
          <CustomButton
            onPress={props.onShareLink}
            title={t('invite.share')}
            styles={props.styles.shareButton}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Send size={size ?? 16} color={color as string} />
              </View>
            )}
          />
          <CustomTextField styles={props.styles.expiryText} title={t('invite.linkExpiry')} />
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

interface SectionTitleProps {
  styles: SectionHeaderStyles;
  title: string;
  hint?: string;
}

function SectionTitle(props: SectionTitleProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={props.title} />
      {props.hint != null && (
        <CustomTextField styles={props.styles.hintText} title={props.hint} />
      )}
    </View>
  );
}

interface ContactRowProps {
  styles: UserRowStyles;
  contact: ContactItem;
  index: number;
  onInvite: (contactId: string) => void;
}

function ContactRow(props: ContactRowProps): ReactNode {
  const isInvited = props.contact.inviteStatus !== 'NONE';

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.container}>
        <View style={props.styles.avatar}>
          <CustomTextField styles={props.styles.avatarText} title={props.contact.avatarInitial} />
        </View>
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.nameText} title={props.contact.name} numberOfLines={1} />
          <CustomTextField styles={props.styles.subtitleText} title={props.contact.phone} numberOfLines={1} />
        </View>
        <CustomButton
          onPress={() => props.onInvite(props.contact.id)}
          title={isInvited ? t('invite.invited') : t('invite.invite')}
          styles={isInvited ? props.styles.invitedButton : props.styles.inviteButton}
          disabled={isInvited}
        />
      </View>
    </Animated.View>
  );
}

interface UserSearchRowProps {
  styles: UserRowStyles;
  user: PlanetUserResult;
  index: number;
  onInvite: (userId: string) => void;
}

function UserSearchRow(props: UserSearchRowProps): ReactNode {
  const isInvited = props.user.inviteStatus !== 'NONE';

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.container}>
        <View style={props.styles.avatar}>
          <CustomTextField styles={props.styles.avatarText} title={props.user.avatarInitial} />
        </View>
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.nameText} title={props.user.displayName} numberOfLines={1} />
          <View style={props.styles.badgeRow}>
            <CustomTextField styles={props.styles.subtitleText} title={props.user.username} />
            {props.user.isVerified && (
              <View style={props.styles.verifiedBadge}>
                <View style={{ width: 10, height: 10 }}>
                  <ShieldCheck size={10} color="#34D399" />
                </View>
                <CustomTextField styles={props.styles.verifiedText} title={t('invite.verified')} />
              </View>
            )}
          </View>
        </View>
        <CustomButton
          onPress={() => props.onInvite(props.user.id)}
          title={isInvited ? t('invite.invited') : t('invite.invite')}
          styles={isInvited ? props.styles.invitedButton : props.styles.inviteButton}
          disabled={isInvited}
        />
      </View>
    </Animated.View>
  );
}

interface NearbyUserRowProps {
  styles: UserRowStyles;
  user: NearbyUserItem;
  index: number;
  onInvite: (userId: string) => void;
}

function NearbyUserRow(props: NearbyUserRowProps): ReactNode {
  const isInvited = props.user.inviteStatus !== 'NONE';

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.container}>
        <Image
          source={{ uri: props.user.avatarUrl }}
          style={props.styles.avatarImage}
          contentFit="cover"
          transition={200}
        />
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.nameText} title={props.user.displayName} numberOfLines={1} />
          <View style={props.styles.badgeRow}>
            {props.user.isVerified && (
              <View style={props.styles.verifiedBadge}>
                <View style={{ width: 10, height: 10 }}>
                  <ShieldCheck size={10} color="#34D399" />
                </View>
                <CustomTextField styles={props.styles.verifiedText} title={t('invite.verified')} />
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: 11, height: 11 }}>
                <MapPin size={11} color="rgba(255, 245, 236, 0.35)" />
              </View>
              <CustomTextField
                styles={props.styles.distanceText}
                title={t('invite.nearbyDistance', { distance: props.user.distanceLabel })}
              />
            </View>
          </View>
        </View>
        <CustomButton
          onPress={() => props.onInvite(props.user.id)}
          title={isInvited ? t('invite.invited') : t('invite.invite')}
          styles={isInvited ? props.styles.invitedButton : props.styles.inviteButton}
          disabled={isInvited}
        />
      </View>
    </Animated.View>
  );
}

interface PendingInviteRowComponentProps {
  styles: PendingInviteRowStyles;
  invite: PendingInviteItem;
  index: number;
}

function PendingInviteRowComponent(props: PendingInviteRowComponentProps): ReactNode {
  const isAccepted = props.invite.status === 'ACCEPTED';

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.container}>
        <View style={props.styles.avatar}>
          <CustomTextField styles={props.styles.avatarText} title={props.invite.avatarInitial} />
        </View>
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.nameText} title={props.invite.name} numberOfLines={1} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CustomTextField styles={props.styles.methodText} title={props.invite.method} />
            <View style={{ width: 10, height: 10 }}>
              <Clock size={10} color="rgba(255, 245, 236, 0.25)" />
            </View>
            <CustomTextField styles={props.styles.sentText} title={props.invite.sentLabel} />
          </View>
        </View>
        <View
          style={[
            props.styles.statusBadge,
            isAccepted ? props.styles.statusBadgeAccepted : props.styles.statusBadgePending,
          ]}
        >
          <CustomTextField
            styles={[
              props.styles.statusText,
              isAccepted ? props.styles.statusTextAccepted : undefined,
            ]}
            title={isAccepted ? t('invite.accepted') : t('invite.pending')}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Container ──

export default function InviteContainer(props: InviteProps): ReactNode {
  const {
    styles,
    headerStyles,
    shareLinkCardStyles,
    sectionHeaderStyles,
    searchInputStyles,
    userRowStyles,
    pendingInviteRowStyles,
    doneButtonStyles,
  } = useInviteStyles();

  const {
    isLoading,
    groupData,
    inviteLink,
    isLinkCopied,
    searchQuery,
    searchResults,
    contacts,
    nearbyUsers,
    pendingInvites,
    onCopyLink,
    onShareLink,
    onSearchQueryChange,
    onInviteUser,
    onInviteContact,
    onInviteNearbyUser,
    onGoBack,
    onDone,
  } = useInvite(props);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <InviteHeader
          styles={headerStyles}
          groupName={groupData.name}
          onClose={onGoBack}
        />

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} color="#FF5C4D" />
          </View>
        ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Share Link Card */}
          <ShareLinkSection
            styles={shareLinkCardStyles}
            inviteLink={inviteLink}
            isLinkCopied={isLinkCopied}
            onCopyLink={onCopyLink}
            onShareLink={onShareLink}
          />

          <View style={styles.sectionGap} />

          {/* Username Search */}
          <SectionTitle
            styles={sectionHeaderStyles}
            title={t('invite.searchUsers')}
          />
          <View style={searchInputStyles.container}>
            <CustomTextInput
              styles={searchInputStyles.textInput}
              placeholder={t('invite.searchPlaceholder')}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={({ size, color }) => (
                <View style={{ width: size, height: size }}>
                  <Search size={size ?? 18} color={color} />
                </View>
              )}
            />
          </View>
          {searchResults.map((user, index) => (
            <UserSearchRow
              key={user.id}
              styles={userRowStyles}
              user={user}
              index={index}
              onInvite={onInviteUser}
            />
          ))}

          <View style={styles.sectionGap} />

          {/* Contacts */}
          <SectionTitle
            styles={sectionHeaderStyles}
            title={t('invite.contacts')}
            hint={t('invite.contactsHint')}
          />
          {contacts.map((contact, index) => (
            <ContactRow
              key={contact.id}
              styles={userRowStyles}
              contact={contact}
              index={index}
              onInvite={onInviteContact}
            />
          ))}

          {/* Nearby Users (conditional) */}
          {groupData.isOpenToStrangers && (
            <>
              <View style={styles.sectionGap} />
              <SectionTitle
                styles={sectionHeaderStyles}
                title={t('invite.nearbyUsers')}
                hint={t('invite.nearbyHint')}
              />
              {nearbyUsers.map((user, index) => (
                <NearbyUserRow
                  key={user.id}
                  styles={userRowStyles}
                  user={user}
                  index={index}
                  onInvite={onInviteNearbyUser}
                />
              ))}
            </>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <>
              <View style={styles.sectionGap} />
              <SectionTitle
                styles={sectionHeaderStyles}
                title={t('invite.pendingInvites')}
              />
              {pendingInvites.map((invite, index) => (
                <PendingInviteRowComponent
                  key={invite.id}
                  styles={pendingInviteRowStyles}
                  invite={invite}
                  index={index}
                />
              ))}
            </>
          )}

          <View style={styles.sectionGap} />

          {/* Done Button */}
          <CustomButton
            onPress={onDone}
            title={t('invite.done')}
            styles={doneButtonStyles}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Users size={size ?? 18} color={color as string} />
              </View>
            )}
          />
        </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
