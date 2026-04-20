/**
 * Business logic for the Dashboard route
 */
import { useState, useEffect, useRef } from 'react';

import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { DashboardProps } from '@/app/business/dashboard';
import { readBusiness } from '@shared/planet-biz-db';
import type { BusinessV1 } from '@shared/generated-db-types';
import type { TranslationKeyType } from '@/i18n/types';

// ── Metric item type ──

export type TrendDirection = 'up' | 'down' | 'flat';

export interface MetricItem {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  trendDirection: TrendDirection;
  trendPercentage: number;
  translationKey: TranslationKeyType;
}

// ── Promotion item type ──

export interface PromotionItem {
  id: string;
  activityTitle: string;
  budgetRemainingInDollars: number;
  impressions: number;
  isLowBudget: boolean;
}

// ── Activity feed item type ──

export type FeedEventType = 'group_interest' | 'deal_redeemed' | 'super_like';

export interface ActivityFeedItem {
  id: string;
  eventType: FeedEventType;
  description: string;
  timeAgo: string;
}

// ── Alert item type ──

export type AlertSeverity = 'warning' | 'info';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
}

// ── Constants ──

const TOAST_DURATION_IN_MS = 2500;

// ── Helpers ──

const THOUSAND = 1000;

function formatMetricValue(value: number): string {
  if (value >= THOUSAND) {
    return `${(value / THOUSAND).toFixed(1)}k`;
  }
  return String(value);
}

function buildMetric(
  id: string,
  label: string,
  value: number,
  trendDirection: TrendDirection,
  trendPercentage: number,
  translationKey: TranslationKeyType,
): MetricItem {
  return {
    id,
    label,
    value,
    formattedValue: formatMetricValue(value),
    trendDirection,
    trendPercentage,
    translationKey,
  };
}

// ── Stub data ──

const STUB_METRICS: MetricItem[] = [
  buildMetric('impressions', 'Impressions', 12480, 'up', 18, 'bizDashboard.impressions'),
  buildMetric('swipes', 'Swipes', 3842, 'up', 12, 'bizDashboard.swipes'),
  buildMetric('group_interests', 'Group Interests', 284, 'down', 5, 'bizDashboard.groupInterests'),
  buildMetric('deal_redemptions', 'Redemptions', 97, 'up', 24, 'bizDashboard.dealRedemptions'),
];

const LOW_BUDGET_THRESHOLD_IN_DOLLARS = 25;

const STUB_PROMOTIONS: PromotionItem[] = [
  { id: 'promo-1', activityTitle: 'Friday Night DJ Set', budgetRemainingInDollars: 45, impressions: 2340, isLowBudget: false },
  { id: 'promo-2', activityTitle: 'Happy Hour BOGO', budgetRemainingInDollars: 120, impressions: 1580, isLowBudget: false },
  { id: 'promo-3', activityTitle: 'Weekend Brunch Special', budgetRemainingInDollars: 18, impressions: 890, isLowBudget: true },
];

const STUB_FEED: ActivityFeedItem[] = [
  { id: 'feed-1', eventType: 'group_interest', description: 'Friday Night Crew added your venue to their picks', timeAgo: '5m ago' },
  { id: 'feed-2', eventType: 'deal_redeemed', description: 'Happy Hour BOGO redeemed by a group of 4', timeAgo: '23m ago' },
  { id: 'feed-3', eventType: 'super_like', description: 'Downtown Explorers super liked DJ Night', timeAgo: '1h ago' },
  { id: 'feed-4', eventType: 'group_interest', description: 'Weekend Warriors swiped right on Brunch Special', timeAgo: '2h ago' },
];

const STUB_ALERTS: AlertItem[] = [
  { id: 'alert-1', severity: 'warning', message: 'Friday Night DJ Set budget is running low ($18 left)' },
  { id: 'alert-2', severity: 'info', message: 'Happy Hour BOGO deal expires in 3 days' },
];

/**
 * Interface for the return value of the useDashboard hook
 */
export interface DashboardFunc {
  isLoading: boolean;
  error?: Error;

  // Venue identity
  businessName: string;
  businessLogoUrl?: string;
  isVerified: boolean;

  // Metrics
  metrics: MetricItem[];

  // Promotions
  promotions: PromotionItem[];

  // Activity feed
  activityFeed: ActivityFeedItem[];

  // Alerts
  alerts: AlertItem[];

  // Tier
  isFreeTier: boolean;

  // Actions
  onUpgrade: () => void;
  onRequestPayout: () => void;
  onManageBilling: () => void;
  onSeeProPlans: () => void;

  // Payment toast
  paymentToast?: string;

  // AI bottom sheet
  aiBottomSheetVisible: boolean;
  onOpenAiBottomSheet: () => void;
  onCloseAiBottomSheet: () => void;
  onAskAiQuestion: () => void;
}

/**
 * Custom hook that provides business logic for the Dashboard component
 */
export function useDashboard(props: DashboardProps): DashboardFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [business, setBusiness] = useState<BusinessV1 | undefined>(undefined);
  const [paymentToast, setPaymentToast] = useState<string | undefined>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [aiBottomSheetVisible, setAiBottomSheetVisible] = useState(false);

  const supabase = useSupabaseClient();

  useEffect(() => {
    loadBusinessDataAsync();
  }, []);

  function loadBusinessDataAsync(): void {
    loadBusinessData().catch((err) => {
      console.error('loadBusinessData error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load business data'));
      setIsLoading(false);
    });
  }

  async function loadBusinessData(): Promise<void> {
    setIsLoading(true);
    try {
      const result = await readBusiness(supabase);
      setBusiness(result);
    } catch (err) {
      console.error('Failed to load business:', err);
      setError(err instanceof Error ? err : new Error('Failed to load business'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Derived values ──

  const businessName = business?.name ?? 'My Venue';
  const businessLogoUrl = business?.logoUrl ?? undefined;
  const isVerified = business?.isVerified ?? false;

  // TODO: Replace stub metrics with real data from analytics API
  const metrics = STUB_METRICS;

  // TODO: Replace stub promotions with real data from promotions API
  const promotions = STUB_PROMOTIONS;

  // TODO: Replace stub feed with real data from activity feed API
  const activityFeed = STUB_FEED;

  // TODO: Replace stub alerts with real data from alerts API
  const alerts = STUB_ALERTS;

  // TODO: Replace with real subscription tier check
  const isFreeTier = true;

  // TODO: Implement upgrade flow navigation
  function onUpgrade(): void {
    console.log('TODO: Navigate to upgrade/subscription flow');
  }

  function showPaymentToastMessage(message: string): void {
    if (toastTimerRef.current != null) {
      clearTimeout(toastTimerRef.current);
    }
    setPaymentToast(message);
    toastTimerRef.current = setTimeout(() => {
      setPaymentToast(undefined);
    }, TOAST_DURATION_IN_MS);
  }

  function onRequestPayout(): void {
    showPaymentToastMessage('Payout feature coming soon');
  }

  function onManageBilling(): void {
    showPaymentToastMessage('Billing portal coming soon');
  }

  function onSeeProPlans(): void {
    showPaymentToastMessage('Plans coming soon');
  }

  function onOpenAiBottomSheet(): void {
    setAiBottomSheetVisible(true);
  }

  function onCloseAiBottomSheet(): void {
    setAiBottomSheetVisible(false);
  }

  function onAskAiQuestion(): void {
    setAiBottomSheetVisible(false);
    showPaymentToastMessage('Planet Insights AI available on Pro plan');
  }

  return {
    isLoading,
    error,
    businessName,
    businessLogoUrl,
    isVerified,
    metrics,
    promotions,
    activityFeed,
    alerts,
    isFreeTier,
    onUpgrade,
    onRequestPayout,
    onManageBilling,
    onSeeProPlans,
    paymentToast,
    aiBottomSheetVisible,
    onOpenAiBottomSheet,
    onCloseAiBottomSheet,
    onAskAiQuestion,
  };
}
