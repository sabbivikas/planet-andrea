-- Seed user_app_profile data for test users
-- The trigger auto-creates rows, so we update existing ones
UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 2);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 3);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = false,
  verification_status = 'NOT_STARTED'
WHERE user_id = uuid_at(1, 4);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 5);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = false,
  verification_status = 'NOT_STARTED'
WHERE user_id = uuid_at(1, 6);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_business_owner = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 7);

-- Regular users (not business owners)
UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 1);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_verified = true,
  verification_status = 'VERIFIED'
WHERE user_id = uuid_at(1, 8);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_verified = false,
  verification_status = 'PENDING'
WHERE user_id = uuid_at(1, 9);

UPDATE private.user_app_profile SET
  is_onboarded = true,
  is_verified = false,
  verification_status = 'NOT_STARTED'
WHERE user_id = uuid_at(1, 10);

UPDATE private.user_app_profile SET
  is_onboarded = false,
  is_verified = false,
  verification_status = 'NOT_STARTED'
WHERE user_id = uuid_at(1, 11);

-- Seed verification documents for users with PENDING or VERIFIED status
INSERT INTO private.verification_document (id, user_id, id_document_url, selfie_url, submitted_at, reviewed_at)
VALUES
  -- User 1 (VERIFIED) - reviewed and approved
  (uuid_at(23, 1), uuid_at(1, 1), 'https://example.com/verification/user1/id_document.jpg', 'https://example.com/verification/user1/selfie.jpg', CURRENT_TIMESTAMP - interval '7 days', CURRENT_TIMESTAMP - interval '6 days'),
  -- User 2 (VERIFIED) - reviewed and approved
  (uuid_at(23, 2), uuid_at(1, 2), 'https://example.com/verification/user2/id_document.jpg', 'https://example.com/verification/user2/selfie.jpg', CURRENT_TIMESTAMP - interval '14 days', CURRENT_TIMESTAMP - interval '13 days'),
  -- User 3 (VERIFIED) - reviewed and approved
  (uuid_at(23, 3), uuid_at(1, 3), 'https://example.com/verification/user3/id_document.jpg', 'https://example.com/verification/user3/selfie.jpg', CURRENT_TIMESTAMP - interval '10 days', CURRENT_TIMESTAMP - interval '9 days'),
  -- User 5 (VERIFIED) - reviewed and approved
  (uuid_at(23, 4), uuid_at(1, 5), 'https://example.com/verification/user5/id_document.jpg', 'https://example.com/verification/user5/selfie.jpg', CURRENT_TIMESTAMP - interval '5 days', CURRENT_TIMESTAMP - interval '4 days'),
  -- User 7 (VERIFIED) - reviewed and approved
  (uuid_at(23, 5), uuid_at(1, 7), 'https://example.com/verification/user7/id_document.jpg', 'https://example.com/verification/user7/selfie.jpg', CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '2 days'),
  -- User 8 (VERIFIED) - reviewed and approved
  (uuid_at(23, 6), uuid_at(1, 8), 'https://example.com/verification/user8/id_document.jpg', 'https://example.com/verification/user8/selfie.jpg', CURRENT_TIMESTAMP - interval '8 days', CURRENT_TIMESTAMP - interval '7 days'),
  -- User 9 (PENDING) - submitted but not yet reviewed
  (uuid_at(23, 7), uuid_at(1, 9), 'https://example.com/verification/user9/id_document.jpg', 'https://example.com/verification/user9/selfie.jpg', CURRENT_TIMESTAMP - interval '1 day', NULL);

-- Seed user preferences for test users
UPDATE private.user_preference SET
  activity_categories = ARRAY['NIGHTLIFE', 'FOOD_AND_DRINKS', 'LIVE_MUSIC', 'OUTDOOR']::activity_category[],
  location_permission_granted = true
WHERE user_id = uuid_at(1, 1);

UPDATE private.user_preference SET
  activity_categories = ARRAY['NIGHTLIFE', 'FOOD_AND_DRINKS']::activity_category[],
  location_permission_granted = true
WHERE user_id = uuid_at(1, 2);

UPDATE private.user_preference SET
  activity_categories = ARRAY['SPORTS', 'OUTDOOR', 'GAMING']::activity_category[],
  location_permission_granted = true
WHERE user_id = uuid_at(1, 3);

-- Seed profile names for test users (extending the base profiles from 0_lib)
WITH profiles AS (
  VALUES
(uuid_at(1, 3), 'MALE'::gender_type, 'Marcus', 'Rivera', '1998-07-15'::date),
(uuid_at(1, 4), 'FEMALE', 'Priya', 'Sharma', '1999-11-22'),
(uuid_at(1, 5), 'MALE', 'Alex', 'Chen', '2001-04-10'),
(uuid_at(1, 6), 'FEMALE', 'Sofia', 'Morales', '1997-09-03'),
(uuid_at(1, 7), 'NON_BINARY', 'Riley', 'Kim', '2000-06-18'),
(uuid_at(1, 8), 'MALE', 'Ethan', 'Brooks', '1996-12-05'),
(uuid_at(1, 9), 'FEMALE', 'Zara', 'Okafor', '1999-02-28'),
(uuid_at(1, 10), 'MALE', 'Kai', 'Nakamura', '2000-08-14'),
(uuid_at(1, 11), 'FEMALE', 'Luna', 'Petrov', '1998-05-20')
)
UPDATE private.profile AS p SET
  gender = profiles.column2,
  given_name = profiles.column3,
  family_name = profiles.column4,
  birth_date = profiles.column5
FROM profiles
WHERE p.id = profiles.column1;

-- Set full_name and username for all test users so profile page displays names
UPDATE private.profile SET full_name = 'Joe Tester', username = 'joetester' WHERE id = uuid_at(1, 1);
UPDATE private.profile SET full_name = 'Jane Tester', username = 'janetester' WHERE id = uuid_at(1, 2);
UPDATE private.profile SET full_name = 'Marcus Rivera', username = 'marcusriv' WHERE id = uuid_at(1, 3);
UPDATE private.profile SET full_name = 'Priya Sharma', username = 'priyasharma' WHERE id = uuid_at(1, 4);
UPDATE private.profile SET full_name = 'Alex Chen', username = 'alexchen' WHERE id = uuid_at(1, 5);
UPDATE private.profile SET full_name = 'Sofia Morales', username = 'sofiamorales' WHERE id = uuid_at(1, 6);
UPDATE private.profile SET full_name = 'Riley Kim', username = 'rileykim' WHERE id = uuid_at(1, 7);
UPDATE private.profile SET full_name = 'Ethan Brooks', username = 'ethanbrooks' WHERE id = uuid_at(1, 8);
UPDATE private.profile SET full_name = 'Zara Okafor', username = 'zaraokafor' WHERE id = uuid_at(1, 9);
UPDATE private.profile SET full_name = 'Kai Nakamura', username = 'kainaka' WHERE id = uuid_at(1, 10);
UPDATE private.profile SET full_name = 'Luna Petrov', username = 'lunapet' WHERE id = uuid_at(1, 11);

-- Set location coordinates for verified users (Austin, TX area) for nearby user discovery
UPDATE private.user_app_profile SET location_latitude = 30.2672, location_longitude = -97.7431 WHERE user_id = uuid_at(1, 1);
UPDATE private.user_app_profile SET location_latitude = 30.2680, location_longitude = -97.7420 WHERE user_id = uuid_at(1, 2);
UPDATE private.user_app_profile SET location_latitude = 30.2700, location_longitude = -97.7500 WHERE user_id = uuid_at(1, 3);
UPDATE private.user_app_profile SET location_latitude = 30.2650, location_longitude = -97.7400 WHERE user_id = uuid_at(1, 5);
UPDATE private.user_app_profile SET location_latitude = 30.2610, location_longitude = -97.7350 WHERE user_id = uuid_at(1, 7);
UPDATE private.user_app_profile SET location_latitude = 30.2730, location_longitude = -97.7480 WHERE user_id = uuid_at(1, 8);
