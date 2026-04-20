-- Seed dummy notifications for all Friday Night Crew members
-- All MERGE_REQUEST notifications are unread and appear at the top of the TODAY section

-- Merge collision notifications for every Friday Night Crew member (6 members: users 1-6)
-- Triggered by Rooftop Regulars wanting to merge with Friday Night Crew at Rooftop Drinks
-- Timestamp is CURRENT_TIMESTAMP so the request always appears brand-new (TODAY section)
INSERT INTO private.notification (id, created_at, user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id, is_read)
VALUES
  (
    uuid_at(51, 1),
    CURRENT_TIMESTAMP,
    uuid_at(1, 1),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),   -- Friday Night Crew
    uuid_at(14, 6),   -- Rooftop Drinks
    uuid_at(50, 1),   -- merge request id
    false
  ),
  (
    uuid_at(51, 3),
    CURRENT_TIMESTAMP,
    uuid_at(1, 2),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),
    uuid_at(14, 6),
    uuid_at(50, 1),
    false
  ),
  (
    uuid_at(51, 4),
    CURRENT_TIMESTAMP,
    uuid_at(1, 3),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),
    uuid_at(14, 6),
    uuid_at(50, 1),
    false
  ),
  (
    uuid_at(51, 5),
    CURRENT_TIMESTAMP,
    uuid_at(1, 4),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),
    uuid_at(14, 6),
    uuid_at(50, 1),
    false
  ),
  (
    uuid_at(51, 6),
    CURRENT_TIMESTAMP,
    uuid_at(1, 5),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),
    uuid_at(14, 6),
    uuid_at(50, 1),
    false
  ),
  (
    uuid_at(51, 7),
    CURRENT_TIMESTAMP,
    uuid_at(1, 6),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Rooftop Regulars wants to merge planets at Rooftop Drinks tonight — 9 people total',
    uuid_at(10, 1),
    uuid_at(14, 6),
    uuid_at(50, 1),
    false
  );

-- Merge collision notifications for every Weekend Explorers member (3 members: users 2, 3, 1)
-- Triggered by Taco Tuesday Squad wanting to merge with Weekend Explorers at Taco Tuesday
-- Timestamp is 8 minutes ago to appear in TODAY section
INSERT INTO private.notification (id, created_at, user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id, is_read)
VALUES
  (
    uuid_at(51, 8),
    CURRENT_TIMESTAMP - INTERVAL '8 minutes',
    uuid_at(1, 2),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Taco Tuesday Squad wants to merge planets at Taco Tuesday tonight — 7 people total',
    uuid_at(10, 2),   -- Weekend Explorers
    uuid_at(14, 2),   -- Taco Tuesday at Psycho Suzi''s Motor Lounge
    uuid_at(50, 2),   -- second merge request id
    false
  ),
  (
    uuid_at(51, 9),
    CURRENT_TIMESTAMP - INTERVAL '8 minutes',
    uuid_at(1, 3),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Taco Tuesday Squad wants to merge planets at Taco Tuesday tonight — 7 people total',
    uuid_at(10, 2),
    uuid_at(14, 2),
    uuid_at(50, 2),
    false
  ),
  (
    uuid_at(51, 10),
    CURRENT_TIMESTAMP - INTERVAL '8 minutes',
    uuid_at(1, 1),
    'MERGE_REQUEST',
    'Planet Collision Detected!',
    'Taco Tuesday Squad wants to merge planets at Taco Tuesday tonight — 7 people total',
    uuid_at(10, 2),
    uuid_at(14, 2),
    uuid_at(50, 2),
    false
  );

-- Orbit activity notification for user 1 (ORBIT_ACTIVITY, 12 minutes ago, unread)
-- Night Owls (which user 1 is orbiting) has selected Rooftop Drinks, 1 spot remaining
INSERT INTO private.notification (id, created_at, user_id, type, title, body, linked_group_id, linked_activity_id, is_read)
VALUES (
  uuid_at(51, 2),
  CURRENT_TIMESTAMP - INTERVAL '12 minutes',
  uuid_at(1, 1),
  'ORBIT_ACTIVITY',
  'ORBIT ALERT! 🪐',
  'Night Owls selected Rooftop Drinks at 4 Bells Rooftop tonight — 1 spot still open. Want to join?',
  uuid_at(10, 8),   -- Night Owls group
  uuid_at(14, 6),   -- Rooftop Drinks
  false
);
