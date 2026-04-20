/**
 * Business logic for the Create Deal route
 */
import { useState, useEffect } from 'react';

import * as Haptics from 'expo-haptics';

import { CreateProps } from '@/app/business/deals/create';
import type { ActivityV1, DealType } from '@shared/generated-db-types';
import { toDateStr, toTimeStr, type datestr, type uuidstr } from '@shared/generated-db-types';
import type { TranslationKeyType } from '@/i18n/types';
import { t } from '@/i18n';
import { useToastContext } from '@/comp-lib/toast/ToastContext';
import { supabaseClient } from '@/api/supabase-client';
import { readBusiness } from '@shared/planet-biz-db';
import { readAllActivitiesByBusiness, createDeal } from '@shared/planet-activity-db';

// ── Types ──

export interface DealTypeOption {
  value: DealType;
  labelKey: TranslationKeyType;
  icon: string;
}

export interface DayOption {
  value: string;
  labelKey: TranslationKeyType;
}

export interface VenueActivity {
  id: string;
  title: string;
  category: string;
}

export interface DealFormValidationErrors {
  headline?: string;
  dealType?: string;
  dealValue?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  linkedActivities?: string;
}

// ── Constants ──

const TERMS_MAX_LENGTH = 500;

const DEAL_TYPE_OPTIONS: DealTypeOption[] = [
  { value: 'PERCENTAGE_OFF', labelKey: 'bizDealCreate.typePercentageOff', icon: '%' },
  { value: 'FIXED_AMOUNT', labelKey: 'bizDealCreate.typeFixedAmount', icon: '$' },
  { value: 'BOGO', labelKey: 'bizDealCreate.typeBogo', icon: '🔁' },
  { value: 'FREE_ITEM', labelKey: 'bizDealCreate.typeFreeItem', icon: '🎁' },
];

const DAY_OPTIONS: DayOption[] = [
  { value: 'MON', labelKey: 'bizDealCreate.dayMon' },
  { value: 'TUE', labelKey: 'bizDealCreate.dayTue' },
  { value: 'WED', labelKey: 'bizDealCreate.dayWed' },
  { value: 'THU', labelKey: 'bizDealCreate.dayThu' },
  { value: 'FRI', labelKey: 'bizDealCreate.dayFri' },
  { value: 'SAT', labelKey: 'bizDealCreate.daySat' },
  { value: 'SUN', labelKey: 'bizDealCreate.daySun' },
];

const DEAL_TYPES_WITHOUT_VALUE: DealType[] = ['BOGO', 'FREE_ITEM'];

const MAX_PERCENTAGE_VALUE = 100;
const DEFAULT_PER_USER_LIMIT = '1';
const REDEMPTION_CODE_LENGTH = 10;
const REDEMPTION_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRedemptionCode(): string {
  let code = '';
  for (let i = 0; i < REDEMPTION_CODE_LENGTH; i++) {
    code += REDEMPTION_CODE_CHARS.charAt(Math.floor(Math.random() * REDEMPTION_CODE_CHARS.length));
  }
  return code;
}

function mapActivityToVenueActivity(activity: ActivityV1): VenueActivity {
  return {
    id: activity.id,
    title: activity.title ?? '',
    category: activity.category ?? '',
  };
}

function formatDateToDateStr(date: Date): datestr {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return toDateStr(`${year}-${month}-${day}`);
}

function dollarsToCents(dollars: string): number | undefined {
  const num = Number(dollars);
  if (isNaN(num) || num <= 0) return undefined;
  return Math.round(num * 100);
}

// ── Interface ──

export interface CreateFunc {
  isLoading: boolean;
  isSubmitting: boolean;
  error?: Error;

  // Form state
  headline: string;
  selectedDealType?: DealType;
  dealValue: string;
  termsAndConditions: string;
  termsMaxLength: number;
  minimumGroupSize: string;
  minimumSpendInDollars: string;
  startDate?: Date;
  endDate?: Date;
  validTimeStart: string;
  validTimeEnd: string;
  dayRestrictions: string[];
  totalRedemptionLimit: string;
  perUserLimit: string;
  linkedActivityIds: string[];
  isPreviewVisible: boolean;

  // Options
  dealTypeOptions: DealTypeOption[];
  dayOptions: DayOption[];
  venueActivities: VenueActivity[];

  // Validation
  validationErrors: DealFormValidationErrors;
  hasAttemptedSubmit: boolean;

  // Computed
  isFormValid: boolean;
  isValueInputVisible: boolean;
  valueLabel: string;

  // Actions
  onHeadlineChange: (value: string) => void;
  onDealTypeSelect: (value: DealType) => void;
  onDealValueChange: (value: string) => void;
  onTermsChange: (value: string) => void;
  onGroupSizeChange: (value: string) => void;
  onSpendAmountChange: (value: string) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onTimeStartChange: (value: string) => void;
  onTimeEndChange: (value: string) => void;
  onDayToggle: (day: string) => void;
  onTotalLimitChange: (value: string) => void;
  onPerUserLimitChange: (value: string) => void;
  onActivityToggle: (activityId: string) => void;
  onTogglePreview: () => void;
  onSubmit: () => void;
}

/**
 * Custom hook that provides business logic for the Create Deal component
 */
export function useCreate(props: CreateProps): CreateFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Form state
  const [headline, setHeadline] = useState('');
  const [selectedDealType, setSelectedDealType] = useState<DealType | undefined>(undefined);
  const [dealValue, setDealValue] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [minimumGroupSize, setMinimumGroupSize] = useState('');
  const [minimumSpendInDollars, setMinimumSpendInDollars] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [validTimeStart, setValidTimeStart] = useState('');
  const [validTimeEnd, setValidTimeEnd] = useState('');
  const [dayRestrictions, setDayRestrictions] = useState<string[]>([]);
  const [totalRedemptionLimit, setTotalRedemptionLimit] = useState('');
  const [perUserLimit, setPerUserLimit] = useState(DEFAULT_PER_USER_LIMIT);
  const [linkedActivityIds, setLinkedActivityIds] = useState<string[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Backend data
  const [businessId, setBusinessId] = useState<uuidstr | undefined>(undefined);
  const [venueActivities, setVenueActivities] = useState<VenueActivity[]>([]);

  const { showSuccess, showError } = useToastContext();

  // ── Load venue activities on mount ──

  useEffect(() => {
    loadVenueDataAsync().catch((err) => {
      console.error('loadVenueDataAsync error:', err);
      setError(err instanceof Error ? err : new Error('Failed to load venue data'));
      setIsLoading(false);
    });
  }, []);

  async function loadVenueDataAsync(): Promise<void> {
    setIsLoading(true);
    try {
      const business = await readBusiness(supabaseClient);
      if (business == null) {
        setVenueActivities([]);
        return;
      }
      setBusinessId(business.id);

      const activities = await readAllActivitiesByBusiness(supabaseClient, business.id);
      setVenueActivities(activities.map(mapActivityToVenueActivity));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Computed ──

  const isValueInputVisible = selectedDealType != null && !DEAL_TYPES_WITHOUT_VALUE.includes(selectedDealType);

  const valueLabel = selectedDealType === 'PERCENTAGE_OFF'
    ? t('bizDealCreate.valuePercentLabel')
    : t('bizDealCreate.valueDollarLabel');

  // ── Validation ──

  function computeValidationErrors(): DealFormValidationErrors {
    const errors: DealFormValidationErrors = {};
    if (headline.trim().length === 0) {
      errors.headline = t('bizDealCreate.validationHeadlineRequired');
    }
    if (selectedDealType == null) {
      errors.dealType = t('bizDealCreate.validationDealTypeRequired');
    }
    if (isValueInputVisible) {
      if (dealValue.trim().length === 0) {
        errors.dealValue = t('bizDealCreate.validationValueRequired');
      } else {
        const numericValue = Number(dealValue);
        if (isNaN(numericValue) || numericValue <= 0) {
          errors.dealValue = t('bizDealCreate.validationValueInvalid');
        } else if (selectedDealType === 'PERCENTAGE_OFF' && numericValue > MAX_PERCENTAGE_VALUE) {
          errors.dealValue = t('bizDealCreate.validationValueInvalid');
        }
      }
    }
    if (startDate == null) {
      errors.startDate = t('bizDealCreate.validationStartDateRequired');
    }
    if (endDate == null) {
      errors.endDate = t('bizDealCreate.validationEndDateRequired');
    }
    if (startDate != null && endDate != null && endDate <= startDate) {
      errors.dateRange = t('bizDealCreate.validationDateRange');
    }
    if (linkedActivityIds.length === 0) {
      errors.linkedActivities = t('bizDealCreate.validationActivityRequired');
    }
    return errors;
  }

  const validationErrors = hasAttemptedSubmit ? computeValidationErrors() : {};
  const isFormValid = headline.trim().length > 0
    && selectedDealType != null
    && (!isValueInputVisible || (dealValue.trim().length > 0 && !isNaN(Number(dealValue)) && Number(dealValue) > 0))
    && startDate != null
    && endDate != null
    && (startDate == null || endDate == null || endDate > startDate)
    && linkedActivityIds.length > 0;

  // ── Actions ──

  function onHeadlineChange(value: string): void {
    setHeadline(value);
  }

  function onDealTypeSelect(value: DealType): void {
    Haptics.selectionAsync().catch(() => {});
    setSelectedDealType(value);
    if (DEAL_TYPES_WITHOUT_VALUE.includes(value)) {
      setDealValue('');
    }
  }

  function onDealValueChange(value: string): void {
    // Allow only numeric input with optional decimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    setDealValue(sanitized);
  }

  function onTermsChange(value: string): void {
    if (value.length <= TERMS_MAX_LENGTH) {
      setTermsAndConditions(value);
    }
  }

  function onGroupSizeChange(value: string): void {
    const sanitized = value.replace(/[^0-9]/g, '');
    setMinimumGroupSize(sanitized);
  }

  function onSpendAmountChange(value: string): void {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setMinimumSpendInDollars(sanitized);
  }

  function onStartDateChange(date: Date): void {
    setStartDate(date);
  }

  function onEndDateChange(date: Date): void {
    setEndDate(date);
  }

  function onTimeStartChange(value: string): void {
    setValidTimeStart(value);
  }

  function onTimeEndChange(value: string): void {
    setValidTimeEnd(value);
  }

  function onDayToggle(day: string): void {
    Haptics.selectionAsync().catch(() => {});
    setDayRestrictions((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  }

  function onTotalLimitChange(value: string): void {
    const sanitized = value.replace(/[^0-9]/g, '');
    setTotalRedemptionLimit(sanitized);
  }

  function onPerUserLimitChange(value: string): void {
    const sanitized = value.replace(/[^0-9]/g, '');
    setPerUserLimit(sanitized);
  }

  function onActivityToggle(activityId: string): void {
    Haptics.selectionAsync().catch(() => {});
    setLinkedActivityIds((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      }
      return [...prev, activityId];
    });
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
    submitDealAsync().catch((err) => {
      console.error('onSubmit error:', err);
      setError(err instanceof Error ? err : new Error('Failed to create deal'));
      setIsSubmitting(false);
    });
  }

  async function submitDealAsync(): Promise<void> {
    if (businessId == null || selectedDealType == null || startDate == null || endDate == null) {
      return;
    }
    setIsSubmitting(true);
    try {
      const discountValueInPercent = selectedDealType === 'PERCENTAGE_OFF' && dealValue.trim().length > 0
        ? Number(dealValue)
        : undefined;
      const discountValueInCents = selectedDealType === 'FIXED_AMOUNT' && dealValue.trim().length > 0
        ? dollarsToCents(dealValue)
        : undefined;
      const groupSize = minimumGroupSize.trim().length > 0 ? Number(minimumGroupSize) : undefined;
      const spendCents = minimumSpendInDollars.trim().length > 0 ? dollarsToCents(minimumSpendInDollars) : undefined;
      const totalLimit = totalRedemptionLimit.trim().length > 0 ? Number(totalRedemptionLimit) : undefined;
      const perUser = perUserLimit.trim().length > 0 ? Number(perUserLimit) : undefined;

      await createDeal(supabaseClient, {
        businessId,
        headline: headline.trim(),
        dealType: selectedDealType,
        termsAndConditions: termsAndConditions.trim().length > 0 ? termsAndConditions.trim() : ' ',
        startDate: formatDateToDateStr(startDate),
        endDate: formatDateToDateStr(endDate),
        redemptionCode: generateRedemptionCode(),
        discountValueInPercent,
        discountValueInCents,
        minimumGroupSize: groupSize,
        minimumSpendInCents: spendCents,
        validTimeStart: validTimeStart.trim().length > 0 ? toTimeStr(validTimeStart.trim()) : undefined,
        validTimeEnd: validTimeEnd.trim().length > 0 ? toTimeStr(validTimeEnd.trim()) : undefined,
        totalRedemptionLimit: totalLimit,
        perUserRedemptionLimit: perUser,
        activityIds: linkedActivityIds as uuidstr[],
      });

      showSuccess(t('bizDealCreate.successMessage'));
      props.onNavigateToDeals();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create deal';
      showError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isLoading,
    isSubmitting,
    error,

    headline,
    selectedDealType,
    dealValue,
    termsAndConditions,
    termsMaxLength: TERMS_MAX_LENGTH,
    minimumGroupSize,
    minimumSpendInDollars,
    startDate,
    endDate,
    validTimeStart,
    validTimeEnd,
    dayRestrictions,
    totalRedemptionLimit,
    perUserLimit,
    linkedActivityIds,
    isPreviewVisible,

    dealTypeOptions: DEAL_TYPE_OPTIONS,
    dayOptions: DAY_OPTIONS,
    venueActivities,

    validationErrors,
    hasAttemptedSubmit,

    isFormValid,
    isValueInputVisible,
    valueLabel,

    onHeadlineChange,
    onDealTypeSelect,
    onDealValueChange,
    onTermsChange,
    onGroupSizeChange,
    onSpendAmountChange,
    onStartDateChange,
    onEndDateChange,
    onTimeStartChange,
    onTimeEndChange,
    onDayToggle,
    onTotalLimitChange,
    onPerUserLimitChange,
    onActivityToggle,
    onTogglePreview,
    onSubmit,
  };
}
