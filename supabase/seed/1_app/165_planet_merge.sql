-- Seed dummy merge request: Rooftop Regulars → Friday Night Crew, PENDING (fresh unread)
-- Reset to CURRENT_TIMESTAMP so it appears at the top of the TODAY section
INSERT INTO private.merge_request (id, created_at, updated_at, initiating_group_id, other_group_id, activity_id, status)
VALUES (
  uuid_at(50, 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  uuid_at(10, 5),  -- Rooftop Regulars (initiating)
  uuid_at(10, 1),  -- Friday Night Crew (receiving)
  uuid_at(14, 6),  -- Rooftop Drinks at 4 Bells Rooftop
  'PENDING'
);

-- Seed second dummy merge request: Taco Tuesday Squad → Weekend Explorers, PENDING
-- Taco Tuesday at Psycho Suzi's Motor Lounge tonight at 7PM, created 8 minutes ago
INSERT INTO private.merge_request (id, created_at, updated_at, initiating_group_id, other_group_id, activity_id, status)
VALUES (
  uuid_at(50, 2),
  CURRENT_TIMESTAMP - INTERVAL '8 minutes',
  CURRENT_TIMESTAMP - INTERVAL '8 minutes',
  uuid_at(10, 3),  -- Taco Tuesday Squad (initiating)
  uuid_at(10, 2),  -- Weekend Explorers (receiving)
  uuid_at(14, 2),  -- Taco Tuesday at Psycho Suzi's Motor Lounge
  'PENDING'
);
