import { useCallback, useRef, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { t } from '@/i18n';
import { supabaseClient } from '@/api/supabase-client';
import {
  type ActivityCategory,
  type ActivityDiscoverCardV1,
  type PriceRange,
  type SwipeAction,
  type uuidstr,
} from '@shared/generated-db-types';
import { readDiscoverFeed } from '@shared/planet-activity-db';
import { createSwipe, deleteSwipesByCurrentUser, undoLastSwipe } from '@shared/planet-swipe-db';
import { countUnreadNotifications } from '@shared/planet-notif-db';
import { readAllGroups, readAllGroupMembers } from '@shared/planet-group-db';
import { readProfile } from '@shared/profile-db';
import { type DiscoverProps } from '@/app/(tabs)/discover';

// ── Types ──

export interface ActivityCardData {
  id: string;
  title: string;
  venueName: string;
  category: ActivityCategory;
  imageUrl: string;
  distanceInKm: number;
  rating: number;
  dealHeadline?: string;
  dealDiscountInPercent?: number;
  priceRange: PriceRange;
  priceLabel: string;
  address: string;
  description?: string;
}

export interface GroupMemberSwipeIndicator {
  id: string;
  name: string;
  avatarInitial: string;
  isSwiping: boolean;
}

export interface DiscoverFunc {
  isLoading: boolean;
  isRefreshing: boolean;
  error?: Error;
  currentCard?: ActivityCardData;
  nextCard?: ActivityCardData;
  isAllSwiped: boolean;
  canUndo: boolean;
  unreadNotificationCount: number;
  locationLabel: string;
  groupMembers: GroupMemberSwipeIndicator[];
  cities: string[];
  isCityPickerOpen: boolean;
  isInfoSheetOpen: boolean;
  onToggleCityPicker: () => void;
  onSelectCity: (city: string) => void;
  onSwipe: (action: SwipeAction) => void;
  onUndo: () => void;
  onOpenDetail: () => void;
  onCloseInfoSheet: () => void;
  onRefreshDeck: () => void;
  onPullToRefresh: () => void;
}

// ── Helpers ──

const PRICE_RANGE_I18N_KEYS: Record<PriceRange, 'discover.free' | 'discover.low' | 'discover.medium' | 'discover.high' | 'discover.veryHigh'> = {
  FREE: 'discover.free',
  LOW: 'discover.low',
  MEDIUM: 'discover.medium',
  HIGH: 'discover.high',
  VERY_HIGH: 'discover.veryHigh',
};

function getPriceLabel(priceRange: PriceRange): string {
  return t(PRICE_RANGE_I18N_KEYS[priceRange]);
}

const EARTH_RADIUS_IN_KM = 6371;

function computeDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLatInRad = ((lat2 - lat1) * Math.PI) / 180;
  const dLonInRad = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLatInRad / 2) * Math.sin(dLatInRad / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLonInRad / 2) *
      Math.sin(dLonInRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_IN_KM * c * 10) / 10;
}

// Default location: Minneapolis
const DEFAULT_LATITUDE = 44.9778;
const DEFAULT_LONGITUDE = -93.2650;

const CITY_OPTIONS = [
  'Minneapolis',
  'Saint Paul',
  'Bloomington',
  'Edina',
  'Eden Prairie',
  'Plymouth',
  'Brooklyn Park',
  'Burnsville',
];

function mapDiscoverCardToActivityCard(
  card: ActivityDiscoverCardV1,
  userLatitude: number,
  userLongitude: number,
): ActivityCardData | undefined {
  const activity = card.activity;
  if (activity == null) return undefined;

  const priceRange = activity.priceRange ?? 'MEDIUM';
  const distanceInKm =
    activity.latitude != null && activity.longitude != null
      ? computeDistanceInKm(userLatitude, userLongitude, activity.latitude, activity.longitude)
      : 0;

  return {
    id: activity.id,
    title: activity.title ?? '',
    venueName: card.businessName ?? '',
    category: activity.category ?? 'NIGHTLIFE',
    imageUrl: activity.primaryImageUrl ?? '',
    distanceInKm,
    rating: activity.rating != null ? Math.round(activity.rating * 10) / 10 : 0,
    dealHeadline: card.deal?.headline ?? undefined,
    dealDiscountInPercent: card.deal?.discountValueInPercent ?? undefined,
    priceRange,
    priceLabel: getPriceLabel(priceRange),
    address: activity.address ?? '',
    description: activity.description ?? undefined,
  };
}

/**
 * Custom hook that provides business logic for the Discover component
 */
export function useDiscover(props: DiscoverProps): DiscoverFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [cards, setCards] = useState<ActivityCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [undoStack, setUndoStack] = useState<ActivityCardData[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [groupMembers, setGroupMembers] = useState<GroupMemberSwipeIndicator[]>([]);
  const [selectedCity, setSelectedCity] = useState(CITY_OPTIONS[0]);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const isFetchingRef = useRef(false);

  const currentCard = currentIndex < cards.length ? cards[currentIndex] : undefined;
  const nextCard = currentIndex + 1 < cards.length ? cards[currentIndex + 1] : undefined;
  const isAllSwiped = !isLoading && currentIndex >= cards.length;
  const canUndo = undoStack.length > 0;

  // Fix 1 + 2 + 3: re-fetch fresh data and reset local swipe state every time the screen focuses
  useFocusEffect(
    useCallback(() => {
      setCurrentIndex(0);
      setUndoStack([]);
      isFetchingRef.current = false;
      loadDiscoverDataAsync().catch((err) => {
        console.error('useDiscover loadDiscoverDataAsync error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
    }, []),
  );

  async function loadDiscoverDataAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const [feedResult, unreadCount, groups] = await Promise.all([
        readDiscoverFeed(supabaseClient, {
          userLatitude: DEFAULT_LATITUDE,
          userLongitude: DEFAULT_LONGITUDE,
        }),
        countUnreadNotifications(supabaseClient),
        readAllGroups(supabaseClient),
      ]);

      const mappedCards = feedResult
        .map((item) => mapDiscoverCardToActivityCard(item, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
        .filter((c): c is ActivityCardData => c != null);

      setCards(mappedCards);
      setUnreadNotificationCount(unreadCount);

      // Load group members for the first group (if any) to show swiping indicators
      if (groups.length > 0) {
        const firstGroupId = groups[0].id;
        const [members, profile] = await Promise.all([
          readAllGroupMembers(supabaseClient, firstGroupId),
          readProfile(supabaseClient),
        ]);
        const currentUserId = profile?.id;
        const memberIndicators: GroupMemberSwipeIndicator[] = members
          .filter((m) => m.userId !== currentUserId)
          .map((m) => ({
            id: m.userId,
            name: m.userId.substring(0, 6),
            avatarInitial: m.userId.substring(0, 1).toUpperCase(),
            isSwiping: m.isOnline,
          }));
        setGroupMembers(memberIndicators);
      }
    } catch (err) {
      console.error('loadDiscoverDataAsync error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }

  function onSwipe(action: SwipeAction): void {
    if (currentCard == null) return;
    const swipedCard = currentCard;
    setUndoStack((prev) => [...prev, swipedCard]);
    setCurrentIndex((prev) => prev + 1);

    createSwipeAsync(swipedCard.id as uuidstr, action).catch((err) => {
      console.error('onSwipe createSwipeAsync error:', err);
    });
  }

  async function createSwipeAsync(activityId: uuidstr, action: SwipeAction): Promise<void> {
    await createSwipe(supabaseClient, activityId, action);
  }

  function onUndo(): void {
    if (undoStack.length === 0) return;
    setUndoStack((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));

    undoLastSwipeAsync().catch((err) => {
      console.error('onUndo undoLastSwipeAsync error:', err);
    });
  }

  async function undoLastSwipeAsync(): Promise<void> {
    await undoLastSwipe(supabaseClient);
  }

  function onOpenDetail(): void {
    if (currentCard == null) return;
    setIsInfoSheetOpen(true);
  }

  function onCloseInfoSheet(): void {
    setIsInfoSheetOpen(false);
  }

  function onToggleCityPicker(): void {
    setIsCityPickerOpen((prev) => !prev);
  }

  function onSelectCity(city: string): void {
    setSelectedCity(city);
    setIsCityPickerOpen(false);
  }

  function onRefreshDeck(): void {
    setCurrentIndex(0);
    setUndoStack([]);
    isFetchingRef.current = false;
    refreshDeckAsync().catch((err) => {
      console.error('onRefreshDeck error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    });
  }

  async function refreshDeckAsync(): Promise<void> {
    await deleteSwipesByCurrentUser(supabaseClient);
    await loadDiscoverDataAsync();
  }

  function onPullToRefresh(): void {
    if (isFetchingRef.current) return;
    setIsRefreshing(true);
    setCurrentIndex(0);
    setUndoStack([]);
    isFetchingRef.current = false;
    pullToRefreshAsync().catch((err) => {
      console.error('onPullToRefresh error:', err);
      setIsRefreshing(false);
    });
  }

  async function pullToRefreshAsync(): Promise<void> {
    await loadDiscoverDataAsync();
    setIsRefreshing(false);
  }

  return {
    isLoading,
    isRefreshing,
    error,
    currentCard,
    nextCard,
    isAllSwiped,
    canUndo,
    unreadNotificationCount,
    locationLabel: selectedCity,
    groupMembers,
    cities: CITY_OPTIONS,
    isCityPickerOpen,
    isInfoSheetOpen,
    onToggleCityPicker,
    onSelectCity,
    onSwipe,
    onUndo,
    onOpenDetail,
    onCloseInfoSheet,
    onRefreshDeck,
    onPullToRefresh,
  };
}
