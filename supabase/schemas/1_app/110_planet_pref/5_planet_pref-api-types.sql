CREATE TYPE public."UserPreferenceV1" AS (
  "userId" uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "activityCategories" public.activity_category[],
  "locationPermissionGranted" bool_notnull,
  "pushNotificationsEnabled" bool_notnull,
  "battleNotificationsEnabled" bool_notnull,
  "groupActivityNotificationsEnabled" bool_notnull,
  "dealNotificationsEnabled" bool_notnull,
  "friendActivityNotificationsEnabled" bool_notnull
);
