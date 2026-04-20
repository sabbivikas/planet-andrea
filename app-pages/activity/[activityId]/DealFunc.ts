/**
 * Business logic for the Deal route
 */
import { useState, useEffect, useMemo } from 'react';

import { format } from 'date-fns';

import { supabaseClient } from '@/api/supabase-client';
import { type DealRedeemDetailV1, type DealType, type uuidstr, toUuidStr } from '@shared/generated-db-types';
import { readDealRedeemDetailByActivity, redeemDeal } from '@shared/planet-activity-db';
import { DealProps } from '@/app/activity/[activityId]/deal';

// ── Types ──

export interface DealDetailData {
  id: string;
  headline: string;
  dealType: DealType;
  discountLabel: string;
  termsAndConditions: string;
  expiryDate: string;
  validHours: string;
  minGroupSize: number;
  perUserLimit: number;
  totalRedemptionLimit?: number;
  redemptionsUsed: number;
  redemptionCode: string;
  qrCodeValue: string;
  venueName: string;
}

export type RedemptionState = 'available' | 'confirming' | 'redeemed';

/**
 * Interface for the return value of the useDeal hook
 */
export interface DealFunc {
  isLoading: boolean;
  error?: Error;
  deal?: DealDetailData;
  redemptionState: RedemptionState;
  isFullScreenMode: boolean;
  isTermsExpanded: boolean;
  onToggleFullScreen: () => void;
  onRequestRedemption: () => void;
  onConfirmRedemption: () => void;
  onCancelRedemption: () => void;
  onToggleTerms: () => void;
  onGoBack: () => void;
  onDismissToDiscover: () => void;
}

// ── Helpers ──

const QR_CODE_PREFIX = 'planet://deal/';
const QR_CODE_REDEEM_PARAM = '/redeem?code=';
const DEFAULT_MIN_GROUP_SIZE = 1;
const DEFAULT_PER_USER_LIMIT = 1;
const FETCH_TIMEOUT_IN_MS = 5000;

// ── Fallback deal for demo (when activity has no deal in DB) ──

const FALLBACK_DEAL_ID = 'demo-deal-001';
const FALLBACK_REDEMPTION_CODE = '842671';

const FALLBACK_DEAL: DealDetailData = {
  id: FALLBACK_DEAL_ID,
  headline: '20% off group cocktails',
  dealType: 'PERCENTAGE_OFF',
  discountLabel: '20% OFF',
  termsAndConditions: 'Min. 4 people · Valid Thu–Sat after 7 PM · Cannot be combined with other offers.',
  expiryDate: 'Mar 31, 2026',
  validHours: '7 PM – Close',
  minGroupSize: 4,
  perUserLimit: 1,
  totalRedemptionLimit: undefined,
  redemptionsUsed: 0,
  redemptionCode: FALLBACK_REDEMPTION_CODE,
  qrCodeValue: `${QR_CODE_PREFIX}${FALLBACK_DEAL_ID}${QR_CODE_REDEEM_PARAM}${FALLBACK_REDEMPTION_CODE}`,
  venueName: 'Sky Bar Austin',
};

function buildQrCodeValue(dealId: string, redemptionCode: string): string {
  return `${QR_CODE_PREFIX}${dealId}${QR_CODE_REDEEM_PARAM}${redemptionCode}`;
}

function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatDiscountLabel(dealType: DealType, percentValue?: number, centsValue?: number): string {
  switch (dealType) {
    case 'PERCENTAGE_OFF':
      return `${percentValue ?? 0}% OFF`;
    case 'FIXED_AMOUNT':
      return `$${((centsValue ?? 0) / 100).toFixed(0)} OFF`;
    case 'BOGO':
      return 'BOGO';
    case 'FREE_ITEM':
      return 'FREE';
    default:
      return 'DEAL';
  }
}

function formatExpiryDate(endDate: string): string {
  try {
    return format(new Date(endDate), 'MMM d, yyyy');
  } catch {
    return endDate;
  }
}

function formatTimeLabel(time: string): string {
  try {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return minutes > 0 ? `${displayHours}:${minutesStr} ${suffix}` : `${displayHours} ${suffix}`;
  } catch {
    return time;
  }
}

function formatValidHours(timeStart?: string, timeEnd?: string): string {
  if (timeStart == null && timeEnd == null) {
    return 'All day';
  }
  const startLabel = timeStart != null ? formatTimeLabel(timeStart) : 'Open';
  const endLabel = timeEnd != null ? formatTimeLabel(timeEnd) : 'Close';
  return `${startLabel} – ${endLabel}`;
}

function mapRedeemDetailToDealData(detail: DealRedeemDetailV1): DealDetailData | undefined {
  const deal = detail.deal;
  if (deal == null) {
    return undefined;
  }

  const dealType = deal.dealType ?? 'PERCENTAGE_OFF';
  const redemptionCode = deal.redemptionCode ?? '';

  return {
    id: deal.id,
    headline: deal.headline ?? '',
    dealType,
    discountLabel: formatDiscountLabel(
      dealType,
      deal.discountValueInPercent ?? undefined,
      deal.discountValueInCents ?? undefined,
    ),
    termsAndConditions: deal.termsAndConditions ?? '',
    expiryDate: formatExpiryDate(deal.endDate),
    validHours: formatValidHours(
      deal.validTimeStart ?? undefined,
      deal.validTimeEnd ?? undefined,
    ),
    minGroupSize: deal.minimumGroupSize ?? DEFAULT_MIN_GROUP_SIZE,
    perUserLimit: deal.perUserRedemptionLimit ?? DEFAULT_PER_USER_LIMIT,
    totalRedemptionLimit: deal.totalRedemptionLimit ?? undefined,
    redemptionsUsed: detail.redemptionsUsed ?? 0,
    redemptionCode,
    qrCodeValue: buildQrCodeValue(deal.id, redemptionCode),
    venueName: detail.businessName ?? '',
  };
}

/**
 * Custom hook that provides business logic for the Deal component
 */
export function useDeal(props: DealProps): DealFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [deal, setDeal] = useState<DealDetailData | undefined>(undefined);
  const [dealId, setDealId] = useState<uuidstr | undefined>(undefined);
  const [redemptionState, setRedemptionState] = useState<RedemptionState>('available');
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);

  const [sessionCode] = useState<string>(generateSessionCode);
  const sessionFallbackDeal = useMemo<DealDetailData>(() => ({
    ...FALLBACK_DEAL,
    redemptionCode: sessionCode,
    qrCodeValue: buildQrCodeValue(FALLBACK_DEAL_ID, sessionCode),
  }), [sessionCode]);

  const activityId = props.urlParams.activityId;

  useEffect(() => {
    if (activityId == null) {
      setIsLoading(false);
      return;
    }

    async function fetchDealAsync(): Promise<void> {
      setIsLoading(true);
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Deal fetch timeout')), FETCH_TIMEOUT_IN_MS),
        );
        const detail = await Promise.race([
          readDealRedeemDetailByActivity(supabaseClient, toUuidStr(activityId)),
          timeoutPromise,
        ]);
        if (detail != null) {
          const mapped = mapRedeemDetailToDealData(detail);
          setDeal(mapped ?? sessionFallbackDeal);
          setDealId(detail.deal?.id);
          if (detail.userAlreadyRedeemed) {
            setRedemptionState('redeemed');
          }
        } else {
          setDeal(sessionFallbackDeal);
          setDealId(toUuidStr(FALLBACK_DEAL_ID));
        }
      } catch (err) {
        console.warn('fetchDealAsync: using demo deal due to error:', err);
        setDeal(sessionFallbackDeal);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDealAsync();
  }, [activityId]);

  function onToggleFullScreen(): void {
    setIsFullScreenMode((prev) => !prev);
  }

  function onRequestRedemption(): void {
    setRedemptionState('confirming');
  }

  function onConfirmRedemption(): void {
    if (dealId == null) {
      // Demo mode: simulate redemption without a real API call
      setRedemptionState('redeemed');
      return;
    }
    confirmRedemptionAsync(dealId).catch((err) => {
      console.warn('onConfirmRedemption error:', err);
      setRedemptionState('available');
    });
  }

  async function confirmRedemptionAsync(id: uuidstr): Promise<void> {
    await redeemDeal(supabaseClient, id);
    setRedemptionState('redeemed');
  }

  function onCancelRedemption(): void {
    setRedemptionState('available');
  }

  function onToggleTerms(): void {
    setIsTermsExpanded((prev) => !prev);
  }

  function onGoBack(): void {
    props.onGoBack();
  }

  function onDismissToDiscover(): void {
    props.onDismissToDiscover();
  }

  return {
    isLoading,
    error,
    deal,
    redemptionState,
    isFullScreenMode,
    isTermsExpanded,
    onToggleFullScreen,
    onRequestRedemption,
    onConfirmRedemption,
    onCancelRedemption,
    onToggleTerms,
    onGoBack,
    onDismissToDiscover,
  };
}
