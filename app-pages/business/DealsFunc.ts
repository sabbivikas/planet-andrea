/**
 * Business logic for the Deals route
 */
import { useState, useRef } from 'react';

import * as Haptics from 'expo-haptics';

import { supabaseClient } from '@/api/supabase-client';
import { type DealsProps } from '@/app/business/deals';
import type { DealStatus, DealType, DealWithMetricsV1, uuidstr } from '@shared/generated-db-types';
import {
  readAllDealsByBusinessWithMetrics,
  updateDealStatus,
  deleteDeal,
  duplicateDeal,
} from '@shared/planet-activity-db';
import { readBusiness } from '@shared/planet-biz-db';
import type { TranslationKeyType } from '@/i18n/types';
import { alert } from '@/utils/alert';
import { t } from '@/i18n';

// ── Helpers ──

function noopCatch(): void {
  // intentionally empty — haptic feedback is best-effort
}

// ── Types ──

export type DealStatusFilter = 'ALL' | DealStatus;

export type DealSortMode = 'performance' | 'recency' | 'expiry';

export interface DealCardItem {
  id: string;
  headline: string;
  dealType: DealType;
  discountValueInPercent?: number;
  discountValueInCents?: number;
  status: DealStatus;
  views: number;
  redemptions: number;
  conversionRate: number;
  linkedActivitiesCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  isExpiringSoon: boolean;
}

export interface FilterOption {
  value: DealStatusFilter;
  labelKey: TranslationKeyType;
}

export interface SortOption {
  value: DealSortMode;
  labelKey: TranslationKeyType;
}

// ── Constants ──

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'ALL', labelKey: 'bizDeals.filterAll' },
  { value: 'ACTIVE', labelKey: 'bizDeals.filterActive' },
  { value: 'EXPIRED', labelKey: 'bizDeals.filterExpired' },
  { value: 'SCHEDULED', labelKey: 'bizDeals.filterScheduled' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'performance', labelKey: 'bizDeals.sortPerformance' },
  { value: 'recency', labelKey: 'bizDeals.sortRecent' },
  { value: 'expiry', labelKey: 'bizDeals.sortExpiry' },
];

const EXPIRY_WARNING_THRESHOLD_IN_DAYS = 3;
const CENTS_PER_DOLLAR = 100;
const THOUSAND = 1000;
const MS_PER_DAY = 86400000;

// ── Helpers ──

function formatCount(value: number): string {
  if (value >= THOUSAND) {
    return `${(value / THOUSAND).toFixed(1)}k`;
  }
  return String(value);
}

function formatDiscountValue(item: DealCardItem): string {
  switch (item.dealType) {
    case 'PERCENTAGE_OFF':
      return `${item.discountValueInPercent ?? 0}%`;
    case 'FIXED_AMOUNT':
      return `$${((item.discountValueInCents ?? 0) / CENTS_PER_DOLLAR).toFixed(0)}`;
    case 'BOGO':
      return t('bizDeals.bogo');
    case 'FREE_ITEM':
      return t('bizDeals.freeItem');
  }
}

function filterDeals(deals: DealCardItem[], filter: DealStatusFilter): DealCardItem[] {
  if (filter === 'ALL') {
    return deals;
  }
  return deals.filter((d) => d.status === filter);
}

function mapDealWithMetricsToCardItem(item: DealWithMetricsV1): DealCardItem | undefined {
  const deal = item.deal;
  if (deal == null) return undefined;

  const endDateMs = new Date(deal.endDate).getTime();
  const nowMs = Date.now();
  const daysUntilExpiry = (endDateMs - nowMs) / MS_PER_DAY;
  const isExpiringSoon = deal.status === 'ACTIVE' && daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRY_WARNING_THRESHOLD_IN_DAYS;

  return {
    id: deal.id,
    headline: deal.headline ?? '',
    dealType: deal.dealType ?? 'PERCENTAGE_OFF',
    discountValueInPercent: deal.discountValueInPercent ?? undefined,
    discountValueInCents: deal.discountValueInCents ?? undefined,
    status: deal.status ?? 'ACTIVE',
    views: item.totalViews,
    redemptions: item.totalRedemptions,
    conversionRate: item.conversionRatePercent ?? 0,
    linkedActivitiesCount: item.linkedActivitiesCount,
    startDate: deal.startDate,
    endDate: deal.endDate,
    createdAt: deal.createdAt,
    isExpiringSoon,
  };
}

function sortDeals(deals: DealCardItem[], mode: DealSortMode): DealCardItem[] {
  const sorted = [...deals];
  switch (mode) {
    case 'performance':
      sorted.sort((a, b) => b.views - a.views);
      break;
    case 'recency':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'expiry':
      sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      break;
  }
  return sorted;
}

/**
 * Interface for the return value of the useDeals hook
 */
export interface DealsFunc {
  isLoading: boolean;
  isRefreshing: boolean;
  error?: Error;

  // Data
  filteredDeals: DealCardItem[];
  totalDealCount: number;
  activeFilter: DealStatusFilter;
  activeSortMode: DealSortMode;
  filterOptions: FilterOption[];
  sortOptions: SortOption[];

  // Formatting
  formatCount: (value: number) => string;
  formatDiscountValue: (item: DealCardItem) => string;

  // Actions
  onFilterChange: (filter: DealStatusFilter) => void;
  onSortChange: (mode: DealSortMode) => void;
  onRefresh: () => void;
  onDeactivateDeal: (dealId: string) => void;
  onDuplicateDeal: (dealId: string) => void;
  onDeleteDeal: (dealId: string) => void;
}

/**
 * Custom hook that provides business logic for the Deals component
 */
export function useDeals(props: DealsProps): DealsFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [deals, setDeals] = useState<DealCardItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>('ALL');
  const [activeSortMode, setActiveSortMode] = useState<DealSortMode>('performance');
  const businessIdRef = useRef<uuidstr | undefined>(undefined);

  // Load deals on mount — using ref to avoid stale closure dependency
  const hasLoadedRef = useRef(false);
  if (!hasLoadedRef.current) {
    hasLoadedRef.current = true;
    onLoadDeals();
  }

  // ── Derived data ──

  const filtered = filterDeals(deals, activeFilter);
  const filteredDeals = sortDeals(filtered, activeSortMode);

  // ── Async loaders ──

  async function fetchDealsAsync(): Promise<DealCardItem[]> {
    let bizId = businessIdRef.current;
    if (bizId == null) {
      const business = await readBusiness(supabaseClient);
      if (business == null) return [];
      bizId = business.id;
      businessIdRef.current = bizId;
    }
    const rawDeals = await readAllDealsByBusinessWithMetrics(supabaseClient, bizId);
    const mapped: DealCardItem[] = [];
    for (const raw of rawDeals) {
      const item = mapDealWithMetricsToCardItem(raw);
      if (item != null) {
        mapped.push(item);
      }
    }
    return mapped;
  }

  function onLoadDeals(): void {
    loadDealsAsync().catch((err) => {
      console.error('onLoadDeals error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load deals'));
      setIsLoading(false);
    });
  }

  async function loadDealsAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const items = await fetchDealsAsync();
      setDeals(items);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setError(err instanceof Error ? err : new Error('Failed to load deals'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Actions ──

  function onFilterChange(filter: DealStatusFilter): void {
    Haptics.selectionAsync().catch(noopCatch);
    setActiveFilter(filter);
  }

  function onSortChange(mode: DealSortMode): void {
    Haptics.selectionAsync().catch(noopCatch);
    setActiveSortMode(mode);
  }

  function onRefresh(): void {
    refreshDealsAsync().catch((err) => {
      console.error('onRefresh error:', err);
      setIsRefreshing(false);
    });
  }

  async function refreshDealsAsync(): Promise<void> {
    setIsRefreshing(true);
    try {
      const items = await fetchDealsAsync();
      setDeals(items);
    } finally {
      setIsRefreshing(false);
    }
  }

  function onDeactivateDeal(dealId: string): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(noopCatch);
    const deal = deals.find((d) => d.id === dealId);
    if (deal == null) return;

    const newStatus: DealStatus = deal.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE';

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return { ...d, status: newStatus };
      }),
    );

    updateDealStatus(supabaseClient, dealId as uuidstr, newStatus).catch((err) => {
      console.error('onDeactivateDeal error:', err);
      // Revert on failure
      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== dealId) return d;
          return { ...d, status: deal.status };
        }),
      );
    });
  }

  function onDuplicateDeal(dealId: string): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(noopCatch);

    duplicateDealAsync(dealId as uuidstr).catch((err) => {
      console.error('onDuplicateDeal error:', err);
    });
  }

  async function duplicateDealAsync(dealId: uuidstr): Promise<void> {
    const newDeal = await duplicateDeal(supabaseClient, dealId);
    if (newDeal == null) return;

    const newItem: DealCardItem = {
      id: newDeal.id,
      headline: newDeal.headline ?? '',
      dealType: newDeal.dealType ?? 'PERCENTAGE_OFF',
      discountValueInPercent: newDeal.discountValueInPercent ?? undefined,
      discountValueInCents: newDeal.discountValueInCents ?? undefined,
      status: newDeal.status ?? 'SCHEDULED',
      views: 0,
      redemptions: 0,
      conversionRate: 0,
      linkedActivitiesCount: 0,
      startDate: newDeal.startDate,
      endDate: newDeal.endDate,
      createdAt: newDeal.createdAt,
      isExpiringSoon: false,
    };
    setDeals((prev) => [newItem, ...prev]);
  }

  function onDeleteDeal(dealId: string): void {
    const deal = deals.find((d) => d.id === dealId);
    if (deal == null) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(noopCatch);

    alert(
      t('bizDeals.deleteConfirmTitle'),
      t('bizDeals.deleteConfirmMessage'),
      [
        { text: t('bizDeals.deleteCancel'), style: 'cancel' },
        {
          text: t('bizDeals.deleteConfirmButton'),
          style: 'destructive',
          onPress: () => {
            setDeals((prev) => prev.filter((d) => d.id !== dealId));
            deleteDeal(supabaseClient, dealId as uuidstr).catch((err) => {
              console.error('onDeleteDeal error:', err);
              // Revert on failure
              setDeals((prev) => [deal, ...prev]);
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(noopCatch);
          },
        },
      ],
    );
  }

  return {
    isLoading,
    isRefreshing,
    error,
    filteredDeals,
    totalDealCount: deals.length,
    activeFilter,
    activeSortMode,
    filterOptions: FILTER_OPTIONS,
    sortOptions: SORT_OPTIONS,
    formatCount,
    formatDiscountValue,
    onFilterChange,
    onSortChange,
    onRefresh,
    onDeactivateDeal,
    onDuplicateDeal,
    onDeleteDeal,
  };
}
