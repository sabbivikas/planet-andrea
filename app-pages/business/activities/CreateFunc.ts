/**
 * Business logic for the Create Activity route
 */
import { useState, useEffect } from 'react';

import * as Haptics from 'expo-haptics';

import { CreateProps } from '@/app/business/activities/create';
import type { ActivityCategory, PriceRange, DealV1, BusinessV1 } from '@shared/generated-db-types';
import type { TranslationKeyType } from '@/i18n/types';
import { t } from '@/i18n';
import { useToastContext } from '@/comp-lib/toast/ToastContext';
import { supabaseClient } from '@/api/supabase-client';
import { readBusiness } from '@shared/planet-biz-db';
import { readAllDealsByBusiness, createActivity, linkDealToActivity } from '@shared/planet-activity-db';
import { uploadActivityImage } from '@/api/planet-activity-api';

// ── Types ──

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

export interface BoostTier {
  id: string;
  labelKey: TranslationKeyType;
  dailyBudgetInDollars: number;
  estimatedImpressions: number;
}

export interface ExistingDeal {
  id: string;
  headline: string;
}

// ── Helpers ──

function mapDealToExistingDeal(deal: DealV1): ExistingDeal {
  return {
    id: deal.id,
    headline: deal.headline ?? '',
  };
}

export interface FormValidationErrors {
  title?: string;
  category?: string;
  description?: string;
  primaryImageUrl?: string;
}

// ── Constants ──

const DESCRIPTION_MAX_LENGTH = 500;

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

const BOOST_TIERS: BoostTier[] = [
  { id: 'basic', labelKey: 'bizActivityCreate.boostTierBasic', dailyBudgetInDollars: 5, estimatedImpressions: 200 },
  { id: 'pro', labelKey: 'bizActivityCreate.boostTierPro', dailyBudgetInDollars: 15, estimatedImpressions: 800 },
  { id: 'max', labelKey: 'bizActivityCreate.boostTierMax', dailyBudgetInDollars: 50, estimatedImpressions: 3000 },
];

const MIN_BOOST_BUDGET_IN_DOLLARS = 1;
const MAX_BOOST_BUDGET_IN_DOLLARS = 100;

// ── Interface ──

export interface CreateFunc {
  isLoading: boolean;
  isSubmitting: boolean;
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
  linkedDealId?: string;
  boostEnabled: boolean;
  selectedBoostTierId?: string;
  boostBudgetInDollars: number;
  minBoostBudgetInDollars: number;
  maxBoostBudgetInDollars: number;
  isPreviewVisible: boolean;

  // Options
  categoryOptions: CategoryOption[];
  priceRangeOptions: PriceRangeOption[];
  tagOptions: TagOption[];
  boostTiers: BoostTier[];
  existingDeals: ExistingDeal[];

  // Validation
  validationErrors: FormValidationErrors;
  hasAttemptedSubmit: boolean;

  // Actions
  onTitleChange: (value: string) => void;
  onCategorySelect: (value: ActivityCategory) => void;
  onDescriptionChange: (value: string) => void;
  onImageUpload: () => void;
  onPriceRangeSelect: (value: PriceRange) => void;
  onOperatingHoursChange: (value: string) => void;
  onTagToggle: (value: string) => void;
  onLinkDeal: (dealId: string) => void;
  onUnlinkDeal: () => void;
  onToggleBoost: () => void;
  onBoostTierSelect: (tierId: string) => void;
  onBoostBudgetChange: (value: number) => void;
  onTogglePreview: () => void;
  onSubmit: () => void;

  // Computed
  isFormValid: boolean;
  estimatedBoostImpressions: number;
  linkedDealHeadline?: string;
}

/**
 * Custom hook that provides business logic for the Create Activity component
 */
export function useCreate(props: CreateProps): CreateFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [business, setBusiness] = useState<BusinessV1 | undefined>(undefined);
  const [existingDeals, setExistingDeals] = useState<ExistingDeal[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | undefined>(undefined);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | undefined>(undefined);
  const [operatingHours, setOperatingHours] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [linkedDealId, setLinkedDealId] = useState<string | undefined>(undefined);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [selectedBoostTierId, setSelectedBoostTierId] = useState<string | undefined>(undefined);
  const [boostBudgetInDollars, setBoostBudgetInDollars] = useState(MIN_BOOST_BUDGET_IN_DOLLARS);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { showSuccess, showError } = useToastContext();

  // ── Load business and deals on mount ──

  useEffect(() => {
    loadBusinessDataAsync().catch((err) => {
      console.error('loadBusinessDataAsync error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load business data'));
      setIsLoading(false);
    });
  }, []);

  async function loadBusinessDataAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const biz = await readBusiness(supabaseClient);
      setBusiness(biz);
      if (biz != null) {
        const deals = await readAllDealsByBusiness(supabaseClient, biz.id);
        setExistingDeals(deals.filter((d) => d.status === 'ACTIVE').map(mapDealToExistingDeal));
      }
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

  const validationErrors = hasAttemptedSubmit ? computeValidationErrors() : {};
  const isFormValid = title.trim().length > 0
    && selectedCategory != null
    && description.trim().length > 0
    && primaryImageUrl != null;

  // ── Computed ──

  const selectedBoostTier = BOOST_TIERS.find((tier) => tier.id === selectedBoostTierId);
  const estimatedBoostImpressions = selectedBoostTier != null
    ? Math.round((boostBudgetInDollars / selectedBoostTier.dailyBudgetInDollars) * selectedBoostTier.estimatedImpressions)
    : 0;

  const linkedDeal = existingDeals.find((deal) => deal.id === linkedDealId);
  const linkedDealHeadline = linkedDeal?.headline;

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
    handleImageUploadAsync().catch((err) => {
      console.error('onImageUpload error:', err);
      if (err instanceof Error && err.message !== 'Image picker cancelled') {
        showError(err.message);
      }
    });
  }

  async function handleImageUploadAsync(): Promise<void> {
    const imageUrl = await uploadActivityImage(supabaseClient);
    if (imageUrl != null) {
      setPrimaryImageUrl(imageUrl);
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

  function onLinkDeal(dealId: string): void {
    Haptics.selectionAsync().catch(() => {});
    setLinkedDealId(dealId);
  }

  function onUnlinkDeal(): void {
    Haptics.selectionAsync().catch(() => {});
    setLinkedDealId(undefined);
  }

  function onToggleBoost(): void {
    Haptics.selectionAsync().catch(() => {});
    setBoostEnabled((prev) => !prev);
    if (!boostEnabled && selectedBoostTierId == null) {
      setSelectedBoostTierId('basic');
    }
  }

  function onBoostTierSelect(tierId: string): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedBoostTierId(tierId);
    const tier = BOOST_TIERS.find((bt) => bt.id === tierId);
    if (tier != null) {
      setBoostBudgetInDollars(tier.dailyBudgetInDollars);
    }
  }

  function onBoostBudgetChange(value: number): void {
    setBoostBudgetInDollars(Math.round(value));
  }

  function onTogglePreview(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsPreviewVisible((prev) => !prev);
  }

  function onSubmit(): void {
    setHasAttemptedSubmit(true);
    const errors = computeValidationErrors();
    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    submitActivityAsync().catch((err) => {
      console.error('onSubmit error:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to create activity');
      setError(errorObj);
      showError(errorObj.message);
      setIsSubmitting(false);
    });
  }

  async function submitActivityAsync(): Promise<void> {
    if (business == null) {
      throw new Error('Business profile not loaded');
    }
    if (selectedCategory == null || primaryImageUrl == null) {
      throw new Error('Missing required fields');
    }

    setIsSubmitting(true);
    try {
      const newActivity = await createActivity(supabaseClient, {
        businessId: business.id,
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        primaryImageUrl: primaryImageUrl,
        priceRange: selectedPriceRange ?? 'FREE',
        address: '',
        latitude: 0,
        longitude: 0,
        operatingHours: operatingHours.length > 0 ? operatingHours : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      if (linkedDealId != null) {
        await linkDealToActivity(supabaseClient, linkedDealId, newActivity.id);
      }

      showSuccess(t('bizActivityCreate.successMessage'));
      props.onNavigateToActivities();
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isLoading,
    isSubmitting,
    error,

    title,
    selectedCategory,
    description,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    primaryImageUrl,
    selectedPriceRange,
    operatingHours,
    selectedTags,
    linkedDealId,
    boostEnabled,
    selectedBoostTierId,
    boostBudgetInDollars,
    minBoostBudgetInDollars: MIN_BOOST_BUDGET_IN_DOLLARS,
    maxBoostBudgetInDollars: MAX_BOOST_BUDGET_IN_DOLLARS,
    isPreviewVisible,

    categoryOptions: CATEGORY_OPTIONS,
    priceRangeOptions: PRICE_RANGE_OPTIONS,
    tagOptions: TAG_OPTIONS,
    boostTiers: BOOST_TIERS,
    existingDeals,

    validationErrors,
    hasAttemptedSubmit,

    onTitleChange,
    onCategorySelect,
    onDescriptionChange,
    onImageUpload,
    onPriceRangeSelect,
    onOperatingHoursChange,
    onTagToggle,
    onLinkDeal,
    onUnlinkDeal,
    onToggleBoost,
    onBoostTierSelect,
    onBoostBudgetChange,
    onTogglePreview,
    onSubmit,

    isFormValid,
    estimatedBoostImpressions,
    linkedDealHeadline,
  };
}
