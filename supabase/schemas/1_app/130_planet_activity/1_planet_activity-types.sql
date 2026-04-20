CREATE TYPE public.activity_status AS ENUM (
  'ACTIVE',
  'PAUSED',
  'PENDING_REVIEW'
);

COMMENT ON TYPE public.activity_status IS '
description: Current status of an activity card
values:
  ACTIVE: Activity card is live and visible
  PAUSED: Temporarily hidden
  PENDING_REVIEW: Awaiting approval
';

CREATE TYPE public.price_range AS ENUM (
  'FREE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'VERY_HIGH'
);

COMMENT ON TYPE public.price_range IS '
description: Price level indicator for activities
values:
  FREE: No cost
  LOW: Budget friendly
  MEDIUM: Moderate pricing
  HIGH: Premium pricing
  VERY_HIGH: Luxury pricing
';

CREATE TYPE public.deal_type AS ENUM (
  'PERCENTAGE_OFF',
  'FIXED_AMOUNT',
  'BOGO',
  'FREE_ITEM'
);

COMMENT ON TYPE public.deal_type IS '
description: Type of discount offered by a deal
values:
  PERCENTAGE_OFF: Percentage discount
  FIXED_AMOUNT: Fixed dollar amount off
  BOGO: Buy one get one
  FREE_ITEM: Free item with purchase
';

CREATE TYPE public.deal_status AS ENUM (
  'ACTIVE',
  'EXPIRED',
  'SCHEDULED'
);

COMMENT ON TYPE public.deal_status IS '
description: Current status of a deal
values:
  ACTIVE: Deal is currently available
  EXPIRED: Deal has passed its end date
  SCHEDULED: Deal starts in the future
';
