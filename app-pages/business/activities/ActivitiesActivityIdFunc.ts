/**
 * Business logic for the ActivitiesActivityId (Edit Activity) route
 */
import { useEffect, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';

import { ActivitiesActivityIdProps } from '@/app/business/activities/[activityId]';
import type {
  ActivityCategory,
  ActivityStatus,
  DealV1,
  PriceRange,
  uuidstr,
} from '@shared/generated-db-types';
import {
  readActivityEditDetail,
  updateActivity,
  deleteActivity,
  linkDealToActivity,
  unlinkDealFromActivity,
} from '@shared/planet-activity-db';
import { uploadActivityImage } from '@/api/planet-activity-api';
import { supabaseClient } from '@/api/supabase-client';
import type { TranslationKeyType } from '@/i18n/types';
import { t } from '@/i18n';
import { useToastContext } from '@/comp-lib/toast/ToastContext';
import { alert } from '@/utils/alert';

// ── Reuse types from Create flow ──

export interface CategoryOption {
  value: ActivityCategory;
  labelKey: TranslationKeyType;
  icon: string;
}

export interface PriceRangeOption {
  value: PriceRange;
  labelKey: TranslationKeyType;
}

export interface TagOption {
  value: string;
  labelKey: TranslationKeyType;
}

export interface ExistingDeal {
  id: string;
  headline: string;
}

export interface FormValidationErrors {
  title?: string;
  category?: string;
  description?: string;
  primaryImageUrl?: string;
}

export interface PerformanceMetric {
  labelKey: TranslationKeyType;
  value: string;
  trendPercent?: number;
}

export interface LinkedDealInfo {
  id: string;
  headline: string;
  dealType: string;
}

export interface BoostStatusInfo {
  isActive: boolean;
  tierLabel: string;
  remainingBudgetInDollars: number;
  totalBudgetInDollars: number;
  boostedImpressions: number;
}

// ── Constants ──

const DESCRIPTION_MAX_LENGTH = 500;
const CENTS_PER_DOLLAR = 100;

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'NIGHTLIFE', labelKey: 'bizActivityCreate.categoryNightlife', icon: '🌙' },
  { value: 'FOOD_AND_DRINKS', labelKey: 'bizActivityCreate.categoryFoodDrinks', icon: '🍔' },
  { value: 'OUTDOOR', labelKey: 'bizActivityCreate.categoryOutdoor', icon: '🌲' },
  { value: 'LIVE_MUSIC', labelKey: 'bizActivityCreate.categoryLiveMusic', icon: '🎵' },
  { value: 'SPORTS', labelKey: 'bizActivityCreate.categorySports', icon: '⚽' },
  { value: 'ARTS', labelKey: 'bizActivityCreate.categoryArts', icon: '🎨' },
  { value: 'GAMING', labelKey: 'bizActivityCreate.categoryGaming', icon: '🎮' },
  { value: 'WELLNESS', labelKey: 'bizActivityCreate.categoryWellness', icon: '🧘' },
];

const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: 'FREE', labelKey: 'bizActivityCreate.priceFree' },
  { value: 'LOW', labelKey: 'bizActivityCreate.priceLow' },
  { value: 'MEDIUM', labelKey: 'bizActivityCreate.priceMedium' },
  { value: 'HIGH', labelKey: 'bizActivityCreate.priceHigh' },
  { value: 'VERY_HIGH', labelKey: 'bizActivityCreate.priceVeryHigh' },
];

const TAG_OPTIONS: TagOption[] = [
  { value: 'group_friendly', labelKey: 'bizActivityCreate.tagGroupFriendly' },
  { value: 'outdoor', labelKey: 'bizActivityCreate.tagOutdoor' },
  { value: 'date_night', labelKey: 'bizActivityCreate.tagDateNight' },
  { value: 'late_night', labelKey: 'bizActivityCreate.tagLateNight' },
  { value: 'live_entertainment', labelKey: 'bizActivityCreate.tagLiveEntertainment' },
  { value: 'family_friendly', labelKey: 'bizActivityCreate.tagFamilyFriendly' },
];

const DEFAULT_BOOST_STATUS: BoostStatusInfo = {
  isActive: false,
  tierLabel: 'Basic',
  remainingBudgetInDollars: 0,
  totalBudgetInDollars: 0,
  boostedImpressions: 0,
};

// ── Helpers ──

function formatMetricValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString();
  }
  return String(value);
}

function buildPerformanceMetrics(
  totalImpressions: number,
  totalSwipes: number,
  conversionRatePercent: number,
): PerformanceMetric[] {
  return [
    { labelKey: 'bizActivityEdit.impressions', value: formatMetricValue(totalImpressions) },
    { labelKey: 'bizActivityEdit.swipes', value: formatMetricValue(totalSwipes) },
    { labelKey: 'bizActivityEdit.conversionRate', value: `${conversionRatePercent.toFixed(1)}%` },
  ];
}

function mapDealToLinkedInfo(deal: DealV1): LinkedDealInfo {
  return {
    id: deal.id,
    headline: deal.headline ?? '',
    dealType: deal.dealType ?? 'PERCENTAGE_OFF',
  };
}

function mapDealsToExistingDeals(deals: DealV1[]): ExistingDeal[] {
  return deals.map((d) => ({
    id: d.id,
    headline: d.headline ?? '',
  }));
}

// ── Interface ──

export interface ActivitiesActivityIdFunc {
  isLoading: boolean;
  isSaving: boolean;
  error?: Error;

  // Form state
  title: string;
  selectedCategory?: ActivityCategory;
  description: string;
  descriptionMaxLength: number;
  primaryImageUrl?: string;
  selectedPriceRange?: PriceRange;
  operatingHours: string;
  selectedTags: string[];
  isPaused: boolean;

  // Options
  categoryOptions: CategoryOption[];
  priceRangeOptions: PriceRangeOption[];
  tagOptions: TagOption[];

  // Performance (read-only)
  performanceMetrics: PerformanceMetric[];

  // Deal
  linkedDeal?: LinkedDealInfo;
  existingDeals: ExistingDeal[];

  // Boost
  boostStatus: BoostStatusInfo;

  // Validation
  validationErrors: FormValidationErrors;
  hasAttemptedSave: boolean;

  // Actions
  onTitleChange: (value: string) => void;
  onCategorySelect: (value: ActivityCategory) => void;
  onDescriptionChange: (value: string) => void;
  onImageUpload: () => void;
  onPriceRangeSelect: (value: PriceRange) => void;
  onOperatingHoursChange: (value: string) => void;
  onTagToggle: (value: string) => void;
  onTogglePause: () => void;
  onLinkDeal: (dealId: string) => void;
  onUnlinkDeal: () => void;
  onSave: () => void;
  onDelete: () => void;

  // Computed
  isFormValid: boolean;
}

/**
 * Custom hook that provides business logic for the Edit Activity component
 */
export function useActivitiesActivityId(props: ActivitiesActivityIdProps): ActivitiesActivityIdFunc {
  const activityId = props.urlParams.activityId as uuidstr;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Form state — populated from API on load
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | undefined>(undefined);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | undefined>(undefined);
  const [operatingHours, setOperatingHours] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [linkedDeal, setLinkedDeal] = useState<LinkedDealInfo | undefined>(undefined);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Read-only data from API
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [existingDeals, setExistingDeals] = useState<ExistingDeal[]>([]);
  const [boostStatus, setBoostStatus] = useState<BoostStatusInfo>(DEFAULT_BOOST_STATUS);

  // Keep a ref to the full deals list for linking
  const businessDealsRef = useRef<DealV1[]>([]);

  const { showSuccess, showError } = useToastContext();

  // ── Load activity data ──

  useEffect(() => {
    loadActivityDataAsync().catch((err) => {
      console.error('loadActivityData error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load activity'));
      setIsLoading(false);
    });
  }, [activityId]);

  async function loadActivityDataAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const detail = await readActivityEditDetail(supabaseClient, activityId);
      if (detail?.activity == null) {
        setError(new Error('Activity not found'));
        return;
      }

      const activity = detail.activity;

      // Populate form state
      setTitle(activity.title ?? '');
      setSelectedCategory(activity.category ?? undefined);
      setDescription(activity.description ?? '');
      setPrimaryImageUrl(activity.primaryImageUrl ?? undefined);
      setSelectedPriceRange(activity.priceRange ?? undefined);
      setOperatingHours(activity.operatingHours ?? '');
      setSelectedTags(activity.tags ?? []);
      setIsPaused(activity.status === 'PAUSED');

      // Linked deal
      if (detail.deal != null) {
        setLinkedDeal(mapDealToLinkedInfo(detail.deal));
      }

      // Performance metrics
      const metrics = detail.metrics;
      setPerformanceMetrics(
        buildPerformanceMetrics(
          metrics?.totalImpressions ?? 0,
          metrics?.totalSwipes ?? 0,
          metrics?.conversionRatePercent ?? 0,
        ),
      );

      // Boost status
      if (detail.boost != null) {
        const boost = detail.boost;
        setBoostStatus({
          isActive: boost.isActive,
          tierLabel: boost.tier ?? 'Basic',
          remainingBudgetInDollars: boost.remainingBudgetInCents / CENTS_PER_DOLLAR,
          totalBudgetInDollars: boost.dailyBudgetInCents / CENTS_PER_DOLLAR,
          boostedImpressions: boost.boostedImpressions,
        });
      }

      // Business deals for picker
      const deals = detail.businessDeals ?? [];
      businessDealsRef.current = deals;
      setExistingDeals(mapDealsToExistingDeals(deals));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Validation ──

  function computeValidationErrors(): FormValidationErrors {
    const errors: FormValidationErrors = {};
    if (title.trim().length === 0) {
      errors.title = t('bizActivityCreate.validationTitleRequired');
    }
    if (selectedCategory == null) {
      errors.category = t('bizActivityCreate.validationCategoryRequired');
    }
    if (description.trim().length === 0) {
      errors.description = t('bizActivityCreate.validationDescriptionRequired');
    }
    if (primaryImageUrl == null) {
      errors.primaryImageUrl = t('bizActivityCreate.validationImageRequired');
    }
    return errors;
  }

  const validationErrors = hasAttemptedSave ? computeValidationErrors() : {};
  const isFormValid =
    title.trim().length > 0 &&
    selectedCategory != null &&
    description.trim().length > 0 &&
    primaryImageUrl != null;

  // ── Actions ──

  function onTitleChange(value: string): void {
    setTitle(value);
  }

  function onCategorySelect(value: ActivityCategory): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedCategory(value);
  }

  function onDescriptionChange(value: string): void {
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  }

  function onImageUpload(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    uploadActivityImageAsync().catch((err) => {
      console.error('onImageUpload error:', err);
      showError(err instanceof Error ? err.message : 'Failed to upload image');
    });
  }

  async function uploadActivityImageAsync(): Promise<void> {
    const url = await uploadActivityImage(supabaseClient);
    if (url != null) {
      setPrimaryImageUrl(url);
    }
  }

  function onPriceRangeSelect(value: PriceRange): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedPriceRange((prev) => (prev === value ? undefined : value));
  }

  function onOperatingHoursChange(value: string): void {
    setOperatingHours(value);
  }

  function onTagToggle(value: string): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedTags((prev) => {
      if (prev.includes(value)) {
        return prev.filter((tag) => tag !== value);
      }
      return [...prev, value];
    });
  }

  function onTogglePause(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsPaused((prev) => !prev);
  }

  function onLinkDeal(dealId: string): void {
    Haptics.selectionAsync().catch(() => {});
    const deal = businessDealsRef.current.find((d) => d.id === dealId);
    if (deal != null) {
      setLinkedDeal(mapDealToLinkedInfo(deal));
    }
  }

  function onUnlinkDeal(): void {
    Haptics.selectionAsync().catch(() => {});
    setLinkedDeal(undefined);
  }

  function onSave(): void {
    setHasAttemptedSave(true);
    const errors = computeValidationErrors();
    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    saveActivityAsync().catch((err) => {
      console.error('onSave error:', err);
      setError(err instanceof Error ? err : new Error('Failed to save activity'));
      setIsSaving(false);
    });
  }

  async function saveActivityAsync(): Promise<void> {
    setIsSaving(true);
    try {
      await updateActivity(supabaseClient, activityId, {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory!,
        primaryImageUrl: primaryImageUrl!,
        priceRange: selectedPriceRange ?? 'FREE',
        operatingHours: operatingHours || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        status: isPaused ? 'PAUSED' : 'ACTIVE',
      });

      // Handle deal link/unlink
      const detail = await readActivityEditDetail(supabaseClient, activityId);
      const currentDealId = detail?.deal?.id;
      const newDealId = linkedDeal?.id;

      if (currentDealId != null && currentDealId !== newDealId) {
        await unlinkDealFromActivity(supabaseClient, currentDealId, activityId);
      }
      if (newDealId != null && newDealId !== currentDealId) {
        await linkDealToActivity(supabaseClient, newDealId, activityId);
      }

      showSuccess(t('bizActivityEdit.successMessage'));
      props.onNavigateToActivitiesAfterSave();
    } finally {
      setIsSaving(false);
    }
  }

  function onDelete(): void {
    alert(
      t('bizActivityEdit.deleteConfirmTitle'),
      t('bizActivityEdit.deleteConfirmMessage'),
      [
        { text: t('bizActivityEdit.deleteCancel'), style: 'cancel' },
        {
          text: t('bizActivityEdit.deleteConfirmButton'),
          style: 'destructive',
          onPress: () => {
            deleteActivityAsync().catch((err) => {
              console.error('onDelete error:', err);
              setError(err instanceof Error ? err : new Error('Failed to delete activity'));
            });
          },
        },
      ],
    );
  }

  async function deleteActivityAsync(): Promise<void> {
    await deleteActivity(supabaseClient, activityId);
    showSuccess(t('bizActivityEdit.deleteSuccessMessage'));
    props.onNavigateToActivitiesAfterSave();
  }

  return {
    isLoading,
    isSaving,
    error,

    title,
    selectedCategory,
    description,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    primaryImageUrl,
    selectedPriceRange,
    operatingHours,
    selectedTags,
    isPaused,

    categoryOptions: CATEGORY_OPTIONS,
    priceRangeOptions: PRICE_RANGE_OPTIONS,
    tagOptions: TAG_OPTIONS,

    performanceMetrics,

    linkedDeal,
    existingDeals,

    boostStatus,

    validationErrors,
    hasAttemptedSave,

    onTitleChange,
    onCategorySelect,
    onDescriptionChange,
    onImageUpload,
    onPriceRangeSelect,
    onOperatingHoursChange,
    onTagToggle,
    onTogglePause,
    onLinkDeal,
    onUnlinkDeal,
    onSave,
    onDelete,

    isFormValid,
  };
}
