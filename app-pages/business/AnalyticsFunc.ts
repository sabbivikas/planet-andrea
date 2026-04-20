/**
 * Business logic for the Analytics route
 */
import { useState, useEffect, useRef } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import { readBusiness } from '@shared/planet-biz-db';
import {
  readBizAnalyticsOverview,
  readBizAnalyticsDailyMetrics,
  readBizActivityBreakdown,
  readBizDealPerformance,
} from '@shared/planet-biz-dash-db';
import type {
  BizAnalyticsOverviewV1,
  BizAnalyticsDailyV1,
  BizActivityAnalyticsV1,
  BizDealAnalyticsV1,
  uuidstr,
  datestr,
} from '@shared/generated-db-types';
import { toDateStr } from '@shared/generated-db-types';
import { AnalyticsProps } from '@/app/business/analytics';

// ── Time period types ──

export type TimePeriod = '7d' | '30d' | '90d' | 'custom';

export interface TimePeriodOption {
  value: TimePeriod;
  labelKey: string;
}

export const TIME_PERIOD_OPTIONS: readonly TimePeriodOption[] = [
  { value: '7d', labelKey: 'bizAnalytics.period7d' },
  { value: '30d', labelKey: 'bizAnalytics.period30d' },
  { value: '90d', labelKey: 'bizAnalytics.period90d' },
  { value: 'custom', labelKey: 'bizAnalytics.periodCustom' },
] as const;

// ── Metric types ──

export type TrendDirection = 'up' | 'down' | 'flat';

export interface OverviewMetric {
  id: string;
  labelKey: string;
  formattedValue: string;
  trendDirection: TrendDirection;
  trendPercentage: number;
}

// ── Chart data types ──

export interface ChartDataPoint {
  label: string;
  value: number;
}

// ── Activity breakdown types ──

export interface ActivityBreakdownItem {
  id: string;
  title: string;
  impressions: number;
  swipes: number;
  conversionPercent: number;
}

// ── Deal performance types ──

export interface DealPerformanceItem {
  id: string;
  headline: string;
  redemptionRatePercent: number;
  peakTime: string;
  totalRedemptions: number;
}

// ── Helpers ──

const THOUSAND = 1000;
const CENTS_PER_DOLLAR = 100;
const PERIOD_DAYS: Record<TimePeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  'custom': 30,
};

const DAY_LABELS: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Day labels ordered Mon–Sun for chart display */
const CHART_DAY_ORDER: readonly string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatCompactNumber(value: number): string {
  if (value >= THOUSAND) {
    return `${(value / THOUSAND).toFixed(1)}k`;
  }
  return String(value);
}

function formatCurrency(cents: number): string {
  const dollars = cents / CENTS_PER_DOLLAR;
  if (dollars >= THOUSAND) {
    return `$${(dollars / THOUSAND).toFixed(1)}k`;
  }
  return `$${dollars.toFixed(0)}`;
}

function computeTrend(current: number, previous: number): { direction: TrendDirection; percentage: number } {
  if (previous === 0) {
    return { direction: current > 0 ? 'up' : 'flat', percentage: current > 0 ? 100 : 0 };
  }
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(change));
  if (change > 0) return { direction: 'up', percentage: rounded };
  if (change < 0) return { direction: 'down', percentage: rounded };
  return { direction: 'flat', percentage: 0 };
}

function getDateRange(period: TimePeriod): { startDate: datestr; endDate: datestr } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = PERIOD_DAYS[period];
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: toDateStr(start.toISOString().split('T')[0]),
    endDate: toDateStr(end.toISOString().split('T')[0]),
  };
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function buildOverviewMetrics(overview: BizAnalyticsOverviewV1): OverviewMetric[] {
  const impressionsTrend = computeTrend(overview.totalImpressions, overview.prevTotalImpressions);
  const viewersTrend = computeTrend(overview.totalUniqueViewers, overview.prevTotalUniqueViewers);
  const swipeRateTrend = computeTrend(overview.swipeRatePercent ?? 0, overview.prevSwipeRatePercent ?? 0);
  const redemptionsTrend = computeTrend(overview.totalDealRedemptions, overview.prevTotalDealRedemptions);
  const revenueTrend = computeTrend(overview.revenueEstimateInCents, overview.prevRevenueEstimateInCents);

  return [
    { id: 'impressions', labelKey: 'bizAnalytics.impressions', formattedValue: formatCompactNumber(overview.totalImpressions), trendDirection: impressionsTrend.direction, trendPercentage: impressionsTrend.percentage },
    { id: 'unique_viewers', labelKey: 'bizAnalytics.uniqueViewers', formattedValue: formatCompactNumber(overview.totalUniqueViewers), trendDirection: viewersTrend.direction, trendPercentage: viewersTrend.percentage },
    { id: 'swipe_rate', labelKey: 'bizAnalytics.swipeRate', formattedValue: `${overview.swipeRatePercent ?? 0}%`, trendDirection: swipeRateTrend.direction, trendPercentage: swipeRateTrend.percentage },
    { id: 'deal_redemptions', labelKey: 'bizAnalytics.dealRedemptions', formattedValue: String(overview.totalDealRedemptions), trendDirection: redemptionsTrend.direction, trendPercentage: redemptionsTrend.percentage },
    { id: 'est_revenue', labelKey: 'bizAnalytics.estRevenue', formattedValue: formatCurrency(overview.revenueEstimateInCents), trendDirection: revenueTrend.direction, trendPercentage: revenueTrend.percentage },
  ];
}

function buildImpressionsChart(dailyMetrics: BizAnalyticsDailyV1[]): ChartDataPoint[] {
  return dailyMetrics.map((day) => {
    const d = new Date(day.date + 'T00:00:00');
    const dayIndex = d.getUTCDay();
    return { label: DAY_LABELS[dayIndex], value: day.impressions };
  });
}

function buildSwipesByDay(dailyMetrics: BizAnalyticsDailyV1[]): ChartDataPoint[] {
  const buckets: Record<string, number> = {};
  for (const label of DAY_LABELS) {
    buckets[label] = 0;
  }
  for (const day of dailyMetrics) {
    const d = new Date(day.date + 'T00:00:00');
    const dayIndex = d.getUTCDay();
    const label = DAY_LABELS[dayIndex];
    buckets[label] += day.swipes;
  }
  return CHART_DAY_ORDER.map((label) => ({ label, value: buckets[label] }));
}

function buildActivityBreakdown(activities: BizActivityAnalyticsV1[]): ActivityBreakdownItem[] {
  return activities.map((a) => ({
    id: a.activityId,
    title: a.title ?? 'Untitled',
    impressions: a.impressions,
    swipes: a.swipes,
    conversionPercent: Math.round(a.conversionPercent ?? 0),
  }));
}

function buildDealPerformance(deals: BizDealAnalyticsV1[]): DealPerformanceItem[] {
  return deals.map((d) => ({
    id: d.dealId,
    headline: d.headline ?? 'Untitled Deal',
    redemptionRatePercent: Math.round(d.redemptionRatePercent ?? 0),
    peakTime: formatHour(d.peakHour),
    totalRedemptions: d.totalRedemptions,
  }));
}

const EMPTY_OVERVIEW_METRICS: OverviewMetric[] = [
  { id: 'impressions', labelKey: 'bizAnalytics.impressions', formattedValue: '0', trendDirection: 'flat', trendPercentage: 0 },
  { id: 'unique_viewers', labelKey: 'bizAnalytics.uniqueViewers', formattedValue: '0', trendDirection: 'flat', trendPercentage: 0 },
  { id: 'swipe_rate', labelKey: 'bizAnalytics.swipeRate', formattedValue: '0%', trendDirection: 'flat', trendPercentage: 0 },
  { id: 'deal_redemptions', labelKey: 'bizAnalytics.dealRedemptions', formattedValue: '0', trendDirection: 'flat', trendPercentage: 0 },
  { id: 'est_revenue', labelKey: 'bizAnalytics.estRevenue', formattedValue: '$0', trendDirection: 'flat', trendPercentage: 0 },
];

/**
 * Interface for the return value of the useAnalytics hook
 */
export interface AnalyticsFunc {
  isLoading: boolean;
  error?: Error;

  // Time period
  selectedPeriod: TimePeriod;
  onSelectPeriod: (period: TimePeriod) => void;

  // Comparison toggle
  showComparison: boolean;
  onToggleComparison: () => void;

  // Overview metrics
  overviewMetrics: OverviewMetric[];

  // Chart data
  impressionsChartData: ChartDataPoint[];
  swipesByDayData: ChartDataPoint[];

  // Activity breakdown
  activityBreakdown: ActivityBreakdownItem[];

  // Deal performance
  dealPerformance: DealPerformanceItem[];

  // Premium
  isPremium: boolean;

  // Actions
  onExportCsv: () => void;
  onUpgrade: () => void;
}

/**
 * Custom hook that provides business logic for the Analytics component
 */
export function useAnalytics(props: AnalyticsProps): AnalyticsFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  const [showComparison, setShowComparison] = useState(false);

  const [businessId, setBusinessId] = useState<uuidstr | undefined>(undefined);
  const [isPremium, setIsPremium] = useState(false);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetric[]>(EMPTY_OVERVIEW_METRICS);
  const [impressionsChartData, setImpressionsChartData] = useState<ChartDataPoint[]>([]);
  const [swipesByDayData, setSwipesByDayData] = useState<ChartDataPoint[]>([]);
  const [activityBreakdown, setActivityBreakdown] = useState<ActivityBreakdownItem[]>([]);
  const [dealPerformance, setDealPerformance] = useState<DealPerformanceItem[]>([]);

  const businessIdRef = useRef<uuidstr | undefined>(undefined);

  // Load business on mount
  useEffect(() => {
    loadBusinessAsync().catch((err) => {
      console.error('loadBusinessAsync error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    });

    async function loadBusinessAsync(): Promise<void> {
      const biz = await readBusiness(supabaseClient);
      if (biz?.id != null) {
        businessIdRef.current = biz.id;
        setBusinessId(biz.id);
        setIsPremium(biz.subscriptionTier === 'PREMIUM');
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Load analytics when businessId or selectedPeriod changes
  useEffect(() => {
    if (businessId == null) return;

    loadAnalyticsAsync(businessId, selectedPeriod).catch((err) => {
      console.error('loadAnalyticsAsync error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    });

    async function loadAnalyticsAsync(bizId: uuidstr, period: TimePeriod): Promise<void> {
      setIsLoading(true);
      setError(undefined);

      const { startDate, endDate } = getDateRange(period);

      const [overview, daily, activities, deals] = await Promise.all([
        readBizAnalyticsOverview(supabaseClient, bizId, startDate, endDate),
        readBizAnalyticsDailyMetrics(supabaseClient, bizId, startDate, endDate),
        readBizActivityBreakdown(supabaseClient, bizId),
        readBizDealPerformance(supabaseClient, bizId),
      ]);

      if (overview != null) {
        setOverviewMetrics(buildOverviewMetrics(overview));
      } else {
        setOverviewMetrics(EMPTY_OVERVIEW_METRICS);
      }

      setImpressionsChartData(buildImpressionsChart(daily));
      setSwipesByDayData(buildSwipesByDay(daily));
      setActivityBreakdown(buildActivityBreakdown(activities));
      setDealPerformance(buildDealPerformance(deals));
      setIsLoading(false);
    }
  }, [businessId, selectedPeriod]);

  function onSelectPeriod(period: TimePeriod): void {
    setSelectedPeriod(period);
  }

  function onToggleComparison(): void {
    setShowComparison((prev) => !prev);
  }

  function onExportCsv(): void {
    // NOTE: CSV export requires a backend endpoint; logging for now
    console.log('Export analytics data as CSV');
  }

  function onUpgrade(): void {
    // NOTE: Upgrade flow navigation to be implemented with subscription system
    console.log('Navigate to upgrade/subscription flow');
  }

  return {
    isLoading,
    error,
    selectedPeriod,
    onSelectPeriod,
    showComparison,
    onToggleComparison,
    overviewMetrics,
    impressionsChartData,
    swipesByDayData,
    activityBreakdown,
    dealPerformance,
    isPremium,
    onExportCsv,
    onUpgrade,
  };
}
