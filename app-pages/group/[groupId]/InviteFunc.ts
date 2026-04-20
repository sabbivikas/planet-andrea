/**
 * Business logic for the Invite route
 */
import { useState, useEffect, useRef } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import {
  buildInviteLink,
  generateInviteCode,
  copyToClipboard,
  shareInviteLink,
  loadPhoneContacts,
  type PhoneContact,
} from '@/api/planet-invite-api';
import { readGroupWithMembers, createInvite, readAllInvitesByGroupWithProfile } from '@shared/planet-group-db';
import { searchPlanetUsers, readNearbyUsers, readUserAppProfile } from '@shared/planet-user-db';
import type {
  InviteWithProfileV1,
  NearbyUserV1,
  PlanetUserSearchResultV1,
  uuidstr,
} from '@shared/generated-db-types';
import { toUuidStr } from '@shared/generated-db-types';
import { InviteProps } from '@/app/group/[groupId]/invite';

// ── Constants ──

const COPY_FEEDBACK_DURATION_IN_MS = 2000;
const SEARCH_DEBOUNCE_IN_MS = 400;
const KM_TO_MI = 0.621371;

// ── Types ──

export type InviteStatus = 'NONE' | 'PENDING' | 'ACCEPTED';

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatarInitial: string;
  inviteStatus: InviteStatus;
}

export interface PlanetUserResult {
  id: string;
  displayName: string;
  username: string;
  avatarInitial: string;
  isVerified: boolean;
  inviteStatus: InviteStatus;
}

export interface NearbyUserItem {
  id: string;
  displayName: string;
  avatarInitial: string;
  avatarUrl: string;
  isVerified: boolean;
  distanceLabel: string;
  inviteStatus: InviteStatus;
}

export interface PendingInviteItem {
  id: string;
  name: string;
  avatarInitial: string;
  method: string;
  status: InviteStatus;
  sentLabel: string;
}

export interface GroupInviteData {
  name: string;
  isOpenToStrangers: boolean;
}

/**
 * Interface for the return value of the useInvite hook
 */
export interface InviteFunc {
  isLoading: boolean;
  error?: Error;
  groupData: GroupInviteData;
  inviteLink: string;
  isLinkCopied: boolean;
  searchQuery: string;
  searchResults: PlanetUserResult[];
  contacts: ContactItem[];
  nearbyUsers: NearbyUserItem[];
  pendingInvites: PendingInviteItem[];
  onCopyLink: () => void;
  onShareLink: () => void;
  onSearchQueryChange: (query: string) => void;
  onInviteUser: (userId: string) => void;
  onInviteContact: (contactId: string) => void;
  onInviteNearbyUser: (userId: string) => void;
  onGoBack: () => void;
  onDone: () => void;
}

// ── Helpers ──

function formatDistanceLabel(distanceInKm: number | null | undefined): string {
  if (distanceInKm == null) return '';
  const miles = distanceInKm * KM_TO_MI;
  return miles < 0.1 ? '<0.1 mi' : `${miles.toFixed(1)} mi`;
}

function formatTimeSince(dateStr: string): string {
  const diffInMs = Date.now() - new Date(dateStr).getTime();
  const diffInMin = Math.floor(diffInMs / 60000);
  if (diffInMin < 1) return 'Just now';
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function mapSearchResultToUser(
  user: PlanetUserSearchResultV1,
  invitedUserIds: Set<string>,
): PlanetUserResult {
  const displayName = user.displayName ?? 'User';
  return {
    id: user.userId,
    displayName,
    username: user.username ? `@${user.username}` : '',
    avatarInitial: displayName.charAt(0).toUpperCase(),
    isVerified: user.isVerified,
    inviteStatus: invitedUserIds.has(user.userId) ? 'PENDING' : 'NONE',
  };
}

function mapNearbyUserToItem(
  user: NearbyUserV1,
  invitedUserIds: Set<string>,
): NearbyUserItem {
  const displayName = user.displayName ?? 'User';
  return {
    id: user.userId,
    displayName,
    avatarInitial: displayName.charAt(0).toUpperCase(),
    avatarUrl: user.avatarUrl ?? '',
    isVerified: user.isVerified,
    distanceLabel: formatDistanceLabel(user.distanceInKm),
    inviteStatus: invitedUserIds.has(user.userId) ? 'PENDING' : 'NONE',
  };
}

function mapInviteToPendingItem(invite: InviteWithProfileV1): PendingInviteItem {
  const inv = invite.invite;
  const name = invite.inviteeName ?? 'Unknown';
  const isAccepted = inv?.isAccepted === true;
  const method = inv?.invitedUserId != null ? 'Username' : 'Link';
  return {
    id: inv?.id ?? '',
    name,
    avatarInitial: name.charAt(0).toUpperCase(),
    method,
    status: isAccepted ? 'ACCEPTED' : 'PENDING',
    sentLabel: inv?.createdAt != null ? formatTimeSince(inv.createdAt) : '',
  };
}

// ── Hook ──

export function useInvite(props: InviteProps): InviteFunc {
  const groupId = toUuidStr(props.urlParams.groupId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [searchResults, setSearchResults] = useState<PlanetUserResult[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUserItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteItem[]>([]);
  const [groupData, setGroupData] = useState<GroupInviteData>({ name: '', isOpenToStrangers: false });
  const [inviteLink, setInviteLink] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cleanup search debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current != null) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // ── Load initial data ──
  useEffect(() => {
    loadInitialDataAsync().catch((err) => {
      console.error('useInvite loadInitialData error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    });

    async function loadInitialDataAsync(): Promise<void> {
      setIsLoading(true);

      const [groupResult, invitesResult, userProfile, phoneContacts] = await Promise.all([
        readGroupWithMembers(supabaseClient, groupId),
        readAllInvitesByGroupWithProfile(supabaseClient, groupId),
        readUserAppProfile(supabaseClient),
        loadPhoneContacts(),
      ]);

      // Group data
      const group = groupResult?.group;
      setGroupData({
        name: group?.name ?? '',
        isOpenToStrangers: group?.isOpenToStrangers ?? false,
      });

      // Generate invite link
      setInviteLink(buildInviteLink(generateInviteCode()));

      // Pending invites
      const existingInvitedIds = new Set<string>();
      const mappedInvites: PendingInviteItem[] = [];
      for (const inv of invitesResult) {
        mappedInvites.push(mapInviteToPendingItem(inv));
        if (inv.invite?.invitedUserId != null) {
          existingInvitedIds.add(inv.invite.invitedUserId);
        }
      }
      setPendingInvites(mappedInvites);
      setInvitedUserIds(existingInvitedIds);

      // Phone contacts
      setContacts(
        phoneContacts.map((c) => ({
          ...c,
          inviteStatus: 'NONE' as InviteStatus,
        })),
      );

      // Nearby users (only if group is open to strangers and user has location)
      if (group?.isOpenToStrangers && userProfile?.locationLatitude != null && userProfile?.locationLongitude != null) {
        const nearby = await readNearbyUsers(supabaseClient, {
          userLatitude: userProfile.locationLatitude,
          userLongitude: userProfile.locationLongitude,
          excludeGroupId: groupId,
        });
        setNearbyUsers(nearby.map((u) => mapNearbyUserToItem(u, existingInvitedIds)));
      }

      setIsLoading(false);
    }
  }, [groupId]);

  // ── Actions ──

  function onCopyLink(): void {
    copyToClipboard(inviteLink).catch((err) => {
      console.error('onCopyLink error:', err);
    });
    setIsLinkCopied(true);
    setTimeout(() => {
      setIsLinkCopied(false);
    }, COPY_FEEDBACK_DURATION_IN_MS);
  }

  function onShareLink(): void {
    shareInviteLink(inviteLink, groupData.name).catch((err) => {
      console.error('onShareLink error:', err);
    });
  }

  function onSearchQueryChange(query: string): void {
    setSearchQuery(query);

    if (searchTimerRef.current != null) {
      clearTimeout(searchTimerRef.current);
    }

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      searchPlanetUsers(supabaseClient, query, groupId)
        .then((results) => {
          setSearchResults(results.map((u) => mapSearchResultToUser(u, invitedUserIds)));
        })
        .catch((err) => {
          console.error('onSearchQueryChange error:', err);
        });
    }, SEARCH_DEBOUNCE_IN_MS);
  }

  function onInviteUser(userId: string): void {
    handleInviteUserAsync(userId).catch((err) => {
      console.error('onInviteUser error:', err);
    });
  }

  async function handleInviteUserAsync(userId: string): Promise<void> {
    const code = generateInviteCode();
    await createInvite(supabaseClient, {
      groupId,
      inviteCode: code,
      invitedUserId: toUuidStr(userId),
    });

    setSearchResults((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, inviteStatus: 'PENDING' as InviteStatus } : u)),
    );
    setInvitedUserIds((prev) => new Set(prev).add(userId));
  }

  function onInviteContact(contactId: string): void {
    handleInviteContactAsync(contactId).catch((err) => {
      console.error('onInviteContact error:', err);
    });
  }

  async function handleInviteContactAsync(contactId: string): Promise<void> {
    const code = generateInviteCode();
    await createInvite(supabaseClient, {
      groupId,
      inviteCode: code,
    });

    const contact = contacts.find((c) => c.id === contactId);
    if (contact != null) {
      await shareInviteLink(buildInviteLink(code), groupData.name);
    }

    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, inviteStatus: 'PENDING' as InviteStatus } : c)),
    );
  }

  function onInviteNearbyUser(userId: string): void {
    handleInviteNearbyUserAsync(userId).catch((err) => {
      console.error('onInviteNearbyUser error:', err);
    });
  }

  async function handleInviteNearbyUserAsync(userId: string): Promise<void> {
    const code = generateInviteCode();
    await createInvite(supabaseClient, {
      groupId,
      inviteCode: code,
      invitedUserId: toUuidStr(userId),
    });

    setNearbyUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, inviteStatus: 'PENDING' as InviteStatus } : u)),
    );
    setInvitedUserIds((prev) => new Set(prev).add(userId));
  }

  function onGoBack(): void {
    props.onGoBack();
  }

  function onDone(): void {
    props.onNavigateToGroupDetail({ groupId: props.urlParams.groupId });
  }

  return {
    isLoading,
    error,
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
  };
}
