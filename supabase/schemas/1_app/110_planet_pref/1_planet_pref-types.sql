CREATE TYPE public.activity_category AS ENUM (
  'NIGHTLIFE',
  'FOOD_AND_DRINKS',
  'OUTDOOR',
  'LIVE_MUSIC',
  'SPORTS',
  'ARTS',
  'GAMING',
  'WELLNESS',
  'COMEDY'
);

COMMENT ON TYPE public.activity_category IS '
description: Categories of activities available on Planet
values:
  NIGHTLIFE: Bars, clubs, and late-night venues
  FOOD_AND_DRINKS: Restaurants, cafes, and eateries
  OUTDOOR: Parks, hiking, and outdoor activities
  LIVE_MUSIC: Concerts, live performances, and music venues
  SPORTS: Sports events and athletic activities
  ARTS: Museums, galleries, and cultural experiences
  GAMING: Arcades, board game cafes, trivia, and escape rooms
  WELLNESS: Spas, yoga, and wellness activities
  COMEDY: Stand-up, improv, and comedy shows
';
