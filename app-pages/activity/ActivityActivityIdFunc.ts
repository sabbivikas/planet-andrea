import { useState } from 'react';

import { t } from '@/i18n';
import { type ActivityCategory, type PriceRange } from '@shared/generated-db-types';
import { ActivityActivityIdProps } from '@/app/activity/[activityId]';

// ── Types ──

export interface ActivityImageData {
  id: string;
  url: string;
}

export interface ActivityDetailData {
  id: string;
  title: string;
  venueName: string;
  category: ActivityCategory;
  categoryLabel: string;
  images: ActivityImageData[];
  description: string;
  rating: number;
  reviewCount: number;
  distanceInKm: number;
  priceRange: PriceRange;
  priceLabel: string;
  address: string;
  operatingHours: string;
  phone: string;
  latitude: number;
  longitude: number;
  tags: string[];
}

export interface DealData {
  id: string;
  headline: string;
  discountLabel: string;
  expiryDate: string;
  termsPreview: string;
}

export interface ReviewData {
  id: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  text: string;
  source: string;
}

export interface ActivityActivityIdFunc {
  isLoading: boolean;
  error?: Error;
  activity?: ActivityDetailData;
  deal?: DealData;
  reviews: ReviewData[];
  groupInterestCount: number;
  isLiked: boolean;
  activeImageIndex: number;
  isDescriptionExpanded: boolean;
  showDealModal: boolean;
  onToggleLike: () => void;
  onShare: () => void;
  onGetDeal: () => void;
  onViewDeal: () => void;
  onCloseDealModal: () => void;
  onRedeemDeal: () => void;
  onImageIndexChange: (index: number) => void;
  onToggleDescription: () => void;
  onOpenDirections: () => void;
}

// ── Helpers ──

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  NIGHTLIFE: 'Nightlife',
  FOOD_AND_DRINKS: 'Food & Drinks',
  OUTDOOR: 'Outdoor',
  LIVE_MUSIC: 'Live Music',
  SPORTS: 'Sports',
  ARTS: 'Arts',
  GAMING: 'Gaming',
  WELLNESS: 'Wellness',
  COMEDY: 'Comedy',
};

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  FREE: 'Free',
  LOW: '$',
  MEDIUM: '$$',
  HIGH: '$$$',
  VERY_HIGH: '$$$$',
};

// ── Dummy Data ──

const DUMMY_ACTIVITY: ActivityDetailData = {
  id: 'act-1',
  title: 'Rooftop Sunset Lounge',
  venueName: 'Sky Bar Austin',
  category: 'NIGHTLIFE',
  categoryLabel: CATEGORY_LABELS.NIGHTLIFE,
  images: [
    {
      id: 'img-1',
      url: 'https://images.pexels.com/photos/4457038/pexels-photo-4457038.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    },
    {
      id: 'img-2',
      url: 'https://images.pexels.com/photos/167514/pexels-photo-167514.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    },
    {
      id: 'img-3',
      url: 'https://images.pexels.com/photos/7429770/pexels-photo-7429770.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    },
  ],
  description:
    'Perched 30 stories above downtown Austin, Sky Bar delivers panoramic sunset views, craft cocktails, and a curated DJ lineup every Friday and Saturday. The rooftop terrace features lounge seating, fire pits, and a full bar menu with shareable plates. Perfect for groups looking to kick off the night with style.',
  rating: 4.7,
  reviewCount: 238,
  distanceInKm: 0.8,
  priceRange: 'MEDIUM',
  priceLabel: PRICE_RANGE_LABELS.MEDIUM,
  address: '401 Congress Ave, Austin, TX 78701',
  operatingHours: 'Thu–Sat 5 PM – 2 AM · Sun 4 PM – 11 PM',
  phone: '(512) 555-0147',
  latitude: 30.2672,
  longitude: -97.7431,
  tags: ['Rooftop', 'Cocktails', 'DJ', 'Views'],
};

const DUMMY_DEAL: DealData = {
  id: 'deal-1',
  headline: '20% off group cocktails',
  discountLabel: '20% OFF',
  expiryDate: 'Mar 31, 2026',
  termsPreview: 'Min. 4 people · Valid Thu–Sat after 7 PM',
};

const DUMMY_REVIEWS: ReviewData[] = [
  {
    id: 'rev-1',
    authorName: 'Sarah M.',
    authorInitial: 'S',
    rating: 5,
    text: 'Incredible views and the cocktails are next level. Brought my whole crew and we had a blast!',
    source: 'Google',
  },
  {
    id: 'rev-2',
    authorName: 'Marcus T.',
    authorInitial: 'M',
    rating: 4,
    text: 'Great vibe for a Friday night. Music was on point. Gets crowded after 10 PM though.',
    source: 'Yelp',
  },
  {
    id: 'rev-3',
    authorName: 'Jess K.',
    authorInitial: 'J',
    rating: 5,
    text: 'Best rooftop in Austin, hands down. The sunset hour is absolutely magical.',
    source: 'Google',
  },
  {
    id: 'rev-4',
    authorName: 'David L.',
    authorInitial: 'D',
    rating: 4,
    text: 'Solid spot for groups. The fire pits are a nice touch. Drinks are a bit pricey but worth it.',
    source: 'TripAdvisor',
  },
];

const DUMMY_GROUP_INTEREST_COUNT = 12;

/**
 * Custom hook that provides business logic for the ActivityActivityId component
 */
export function useActivityActivityId(props: ActivityActivityIdProps): ActivityActivityIdFunc {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  // TODO: Fetch activity data using readActivityById(supabaseClient, props.urlParams.activityId)
  const activity = DUMMY_ACTIVITY;
  const deal = DUMMY_DEAL;
  const reviews = DUMMY_REVIEWS;
  const groupInterestCount = DUMMY_GROUP_INTEREST_COUNT;

  function onToggleLike(): void {
    // TODO: Call like/unlike API with activity.id
    setIsLiked((prev) => !prev);
  }

  function onShare(): void {
    // TODO: Implement share via Share.share() with activity deep link
  }

  function onGetDeal(): void {
    props.onNavigateToDeal({ activityId: props.urlParams.activityId });
  }

  function onViewDeal(): void {
    setShowDealModal(true);
  }

  function onCloseDealModal(): void {
    setShowDealModal(false);
  }

  function onRedeemDeal(): void {
    setShowDealModal(false);
    props.onNavigateToDeal({ activityId: props.urlParams.activityId });
  }

  function onImageIndexChange(index: number): void {
    setActiveImageIndex(index);
  }

  function onToggleDescription(): void {
    setIsDescriptionExpanded((prev) => !prev);
  }

  function onOpenDirections(): void {
    // TODO: Open native maps with activity.latitude, activity.longitude
  }

  return {
    isLoading,
    error,
    activity,
    deal,
    reviews,
    groupInterestCount,
    isLiked,
    activeImageIndex,
    isDescriptionExpanded,
    showDealModal,
    onToggleLike,
    onShare,
    onGetDeal,
    onViewDeal,
    onCloseDealModal,
    onRedeemDeal,
    onImageIndexChange,
    onToggleDescription,
    onOpenDirections,
  };
}
