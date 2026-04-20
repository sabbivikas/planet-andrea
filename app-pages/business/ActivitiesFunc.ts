/**
 * Business logic for the Activities route
 */
import { useState, useEffect } from 'react';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import * as Haptics from 'expo-haptics';

import { ActivitiesProps } from '@/app/business/activities';
import type { ActivityStatus, Database } from '@shared/generated-db-types';
import type { TranslationKeyType } from '@/i18n/types';
import { alert } from '@/utils/alert';
import { t } from '@/i18n';

// ── Types ──

export type ActivityStatusFilter = 'ALL' | ActivityStatus;

export type SortMode = 'performance' | 'recency';

export interface ActivityCardItem {
  id: string;
  title: string;
  status: ActivityStatus;
  imageUrl: string;
  impressions: number;
  swipeCount: number;
  hasDeal: boolean;
  createdAt: string;
}

export interface FilterOption {
  value: ActivityStatusFilter;
  labelKey: TranslationKeyType;
}

export interface SortOption {
  value: SortMode;
  labelKey: TranslationKeyType;
}

// ── Constants ──

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'ALL', labelKey: 'bizActivities.filterAll' },
  { value: 'ACTIVE', labelKey: 'bizActivities.filterActive' },
  { value: 'PAUSED', labelKey: 'bizActivities.filterPaused' },
  { value: 'PENDING_REVIEW', labelKey: 'bizActivities.filterPending' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'performance', labelKey: 'bizActivities.sortPerformance' },
  { value: 'recency', labelKey: 'bizActivities.sortRecent' },
];

const REFRESH_DELAY_IN_MS = 800;

// ── Stub data ──

const STUB_ACTIVITIES: ActivityCardItem[] = [
  {
    id: 'act-1',
    title: 'Friday Night DJ Set',
    status: 'ACTIVE',
    imageUrl: 'https://images.pexels.com/photos/5461573/pexels-photo-5461573.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    impressions: 4820,
    swipeCount: 1243,
    hasDeal: true,
    createdAt: '2025-12-01T20:00:00Z',
  },
  {
    id: 'act-2',
    title: 'Rooftop Sunset Happy Hour',
    status: 'ACTIVE',
    imageUrl: 'https://images.pexels.com/photos/35005900/pexels-photo-35005900.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    impressions: 3150,
    swipeCount: 892,
    hasDeal: true,
    createdAt: '2025-11-28T18:00:00Z',
  },
  {
    id: 'act-3',
    title: 'Live Jazz & Cocktails',
    status: 'PAUSED',
    imageUrl: 'https://images.pexels.com/photos/167514/pexels-photo-167514.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    impressions: 1580,
    swipeCount: 421,
    hasDeal: false,
    createdAt: '2025-11-15T21:00:00Z',
  },
  {
    id: 'act-4',
    title: 'Group Bowling Night',
    status: 'PENDING_REVIEW',
    imageUrl: 'https://images.pexels.com/photos/9273055/pexels-photo-9273055.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    impressions: 0,
    swipeCount: 0,
    hasDeal: false,
    createdAt: '2025-12-10T16:00:00Z',
  },
  {
    id: 'act-5',
    title: 'Outdoor Hiking Meetup',
    status: 'ACTIVE',
    imageUrl: 'https://images.pexels.com/photos/33097708/pexels-photo-33097708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    impressions: 2740,
    swipeCount: 685,
    hasDeal: false,
    createdAt: '2025-12-05T10:00:00Z',
  },
];

// ── Helpers ──

const THOUSAND = 1000;

function formatCount(value: number): string {
  if (value >= THOUSAND) {
    return `${(value / THOUSAND).toFixed(1)}k`;
  }
  return String(value);
}

function filterActivities(activities: ActivityCardItem[], filter: ActivityStatusFilter): ActivityCardItem[] {
  if (filter === 'ALL') {
    return activities;
  }
  return activities.filter((a) => a.status === filter);
}

function sortActivities(activities: ActivityCardItem[], mode: SortMode): ActivityCardItem[] {
  const sorted = [...activities];
  if (mode === 'performance') {
    sorted.sort((a, b) => b.impressions - a.impressions);
  } else {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return sorted;
}

/**
 * Interface for the return value of the useActivities hook
 */
export interface ActivitiesFunc {
  isLoading: boolean;
  isRefreshing: boolean;
  error?: Error;

  // Data
  filteredActivities: ActivityCardItem[];
  totalActivityCount: number;
  activeFilter: ActivityStatusFilter;
  activeSortMode: SortMode;
  filterOptions: FilterOption[];
  sortOptions: SortOption[];

  // Bulk selection
  isBulkMode: boolean;
  selectedIds: Set<string>;

  // Formatting
  formatCount: (value: number) => string;

  // Actions
  onFilterChange: (filter: ActivityStatusFilter) => void;
  onSortChange: (mode: SortMode) => void;
  onRefresh: () => void;
  onToggleActivityStatus: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onToggleBulkMode: () => void;
  onToggleSelection: (activityId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkPause: () => void;
  onBulkActivate: () => void;
  onBulkDelete: () => void;
}

/**
 * Custom hook that provides business logic for the Activities component
 */
export function useActivities(props: ActivitiesProps): ActivitiesFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityCardItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActivityStatusFilter>('ALL');
  const [activeSortMode, setActiveSortMode] = useState<SortMode>('performance');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    onLoadActivities();
  }, []);

  // ── Derived data ──

  const filtered = filterActivities(activities, activeFilter);
  const filteredActivities = sortActivities(filtered, activeSortMode);

  // ── Async loaders ──

  function onLoadActivities(): void {
    loadActivitiesAsync().catch((err) => {
      console.error('onLoadActivities error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load activities'));
      setIsLoading(false);
    });
  }

  async function loadActivitiesAsync(): Promise<void> {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call to readAllActivitiesByBusiness
      // const business = await readBusiness(supabase);
      // if (business) {
      //   const result = await readAllActivitiesByBusiness(supabase, business.id);
      //   setActivities(mapActivitiesToCardItems(result));
      // }
      await new Promise((resolve) => setTimeout(resolve, REFRESH_DELAY_IN_MS));
      setActivities(STUB_ACTIVITIES);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to load activities'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Actions ──

  function onFilterChange(filter: ActivityStatusFilter): void {
    Haptics.selectionAsync().catch(() => {});
    setActiveFilter(filter);
  }

  function onSortChange(mode: SortMode): void {
    Haptics.selectionAsync().catch(() => {});
    setActiveSortMode(mode);
  }

  function onRefresh(): void {
    refreshActivitiesAsync().catch((err) => {
      console.error('onRefresh error:', err);
      setIsRefreshing(false);
    });
  }

  async function refreshActivitiesAsync(): Promise<void> {
    setIsRefreshing(true);
    try {
      // TODO: Replace with real API call to readAllActivitiesByBusiness
      await new Promise((resolve) => setTimeout(resolve, REFRESH_DELAY_IN_MS));
      setActivities(STUB_ACTIVITIES);
    } finally {
      setIsRefreshing(false);
    }
  }

  function onToggleActivityStatus(activityId: string): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const activity = activities.find((a) => a.id === activityId);
    if (activity == null) return;

    const newStatus: ActivityStatus = activity.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    // TODO: Replace with real API call to updateActivity with status change
    // updateActivity(supabase, toUuidStr(activityId), { status: newStatus });
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        return { ...a, status: newStatus };
      }),
    );
  }

  function onDeleteActivity(activityId: string): void {
    const activity = activities.find((a) => a.id === activityId);
    if (activity == null) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

    alert(
      t('bizActivities.deleteConfirmTitle'),
      t('bizActivities.deleteConfirmMessage'),
      [
        { text: t('bizActivities.deleteCancel'), style: 'cancel' },
        {
          text: t('bizActivities.deleteConfirmButton'),
          style: 'destructive',
          onPress: () => {
            // TODO: Replace with real API call to deleteActivity
            // deleteActivity(supabase, toUuidStr(activityId));
            setActivities((prev) => prev.filter((a) => a.id !== activityId));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          },
        },
      ],
    );
  }

  function onToggleBulkMode(): void {
    Haptics.selectionAsync().catch(() => {});
    setIsBulkMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function onToggleSelection(activityId: string): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  }

  function onSelectAll(): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedIds(new Set(filteredActivities.map((a) => a.id)));
  }

  function onDeselectAll(): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedIds(new Set());
  }

  function onBulkPause(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // TODO: Replace with real API call to batch update activity status
    setActivities((prev) =>
      prev.map((a) => {
        if (!selectedIds.has(a.id)) return a;
        return { ...a, status: 'PAUSED' as ActivityStatus };
      }),
    );
    setSelectedIds(new Set());
    setIsBulkMode(false);
  }

  function onBulkActivate(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // TODO: Replace with real API call to batch update activity status
    setActivities((prev) =>
      prev.map((a) => {
        if (!selectedIds.has(a.id)) return a;
        return { ...a, status: 'ACTIVE' as ActivityStatus };
      }),
    );
    setSelectedIds(new Set());
    setIsBulkMode(false);
  }

  function onBulkDelete(): void {
    if (selectedIds.size === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

    alert(
      t('bizActivities.bulkDeleteConfirmTitle', { count: String(selectedIds.size) }),
      t('bizActivities.bulkDeleteConfirmMessage'),
      [
        { text: t('bizActivities.deleteCancel'), style: 'cancel' },
        {
          text: t('bizActivities.bulkDeleteConfirmButton'),
          style: 'destructive',
          onPress: () => {
            // TODO: Replace with real API call to batch delete activities
            setActivities((prev) => prev.filter((a) => !selectedIds.has(a.id)));
            setSelectedIds(new Set());
            setIsBulkMode(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          },
        },
      ],
    );
  }

  return {
    isLoading,
    isRefreshing,
    error,
    filteredActivities,
    totalActivityCount: activities.length,
    activeFilter,
    activeSortMode,
    filterOptions: FILTER_OPTIONS,
    sortOptions: SORT_OPTIONS,
    isBulkMode,
    selectedIds,
    formatCount,
    onFilterChange,
    onSortChange,
    onRefresh,
    onToggleActivityStatus,
    onDeleteActivity,
    onToggleBulkMode,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    onBulkPause,
    onBulkActivate,
    onBulkDelete,
  };
}
