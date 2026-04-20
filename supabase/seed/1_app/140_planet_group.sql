-- Seed groups for test users
INSERT INTO private.planet_group (id, name, is_open_to_strangers, max_group_size, visibility, created_by_id, photo_url)
VALUES
  (uuid_at(10, 1), 'Friday Night Crew', false, 10, 'PRIVATE', uuid_at(1, 1), 'planet://A'),
  (uuid_at(10, 2), 'Weekend Explorers', true, 8, 'PUBLIC', uuid_at(1, 2), 'planet://B'),
  (uuid_at(10, 3), 'Taco Tuesday Squad', false, 8, 'PRIVATE', uuid_at(1, 1), 'https://images.pexels.com/photos/16617977/pexels-photo-16617977.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  (uuid_at(10, 4), 'Downtown Explorers', false, 6, 'PRIVATE', uuid_at(1, 3), 'planet://C'),
  (uuid_at(10, 5), 'Rooftop Regulars', true, 10, 'PUBLIC', uuid_at(1, 1), 'planet://D');

-- Seed group members
INSERT INTO private.group_member (id, group_id, user_id, is_owner)
VALUES
  -- Friday Night Crew (user 1 owner + users 2, 3, 4, 5, 6)
  (uuid_at(11, 1), uuid_at(10, 1), uuid_at(1, 1), true),
  (uuid_at(11, 2), uuid_at(10, 1), uuid_at(1, 2), false),
  (uuid_at(11, 18), uuid_at(10, 1), uuid_at(1, 3), false),
  (uuid_at(11, 19), uuid_at(10, 1), uuid_at(1, 4), false),
  (uuid_at(11, 20), uuid_at(10, 1), uuid_at(1, 5), false),
  (uuid_at(11, 21), uuid_at(10, 1), uuid_at(1, 6), false),
  -- Weekend Explorers (user 2 owner + user 3 + user 1)
  (uuid_at(11, 3), uuid_at(10, 2), uuid_at(1, 2), true),
  (uuid_at(11, 4), uuid_at(10, 2), uuid_at(1, 3), false),
  (uuid_at(11, 5), uuid_at(10, 2), uuid_at(1, 1), false),
  -- Taco Tuesday Squad (user 1 owner + users 4, 5, 6)
  (uuid_at(11, 6), uuid_at(10, 3), uuid_at(1, 1), true),
  (uuid_at(11, 7), uuid_at(10, 3), uuid_at(1, 4), false),
  (uuid_at(11, 8), uuid_at(10, 3), uuid_at(1, 5), false),
  (uuid_at(11, 9), uuid_at(10, 3), uuid_at(1, 6), false),
  -- Downtown Explorers (user 3 owner + user 1 + user 7)
  (uuid_at(11, 10), uuid_at(10, 4), uuid_at(1, 3), true),
  (uuid_at(11, 11), uuid_at(10, 4), uuid_at(1, 1), false),
  (uuid_at(11, 12), uuid_at(10, 4), uuid_at(1, 7), false),
  -- Rooftop Regulars (user 1 owner + users 2, 8, 9, 10)
  (uuid_at(11, 13), uuid_at(10, 5), uuid_at(1, 1), true),
  (uuid_at(11, 14), uuid_at(10, 5), uuid_at(1, 2), false),
  (uuid_at(11, 15), uuid_at(10, 5), uuid_at(1, 8), false),
  (uuid_at(11, 16), uuid_at(10, 5), uuid_at(1, 9), false),
  (uuid_at(11, 17), uuid_at(10, 5), uuid_at(1, 10), false);

-- Seed swipes for "DECIDING" status on Taco Tuesday Squad and Rooftop Regulars
INSERT INTO private.swipe (id, user_id, activity_id, group_id, action)
VALUES
  (uuid_at(19, 1), uuid_at(1, 1), uuid_at(14, 2), uuid_at(10, 3), 'LIKE'),
  (uuid_at(19, 2), uuid_at(1, 4), uuid_at(14, 2), uuid_at(10, 3), 'SUPER_LIKE'),
  (uuid_at(19, 3), uuid_at(1, 1), uuid_at(14, 4), uuid_at(10, 5), 'LIKE'),
  (uuid_at(19, 4), uuid_at(1, 2), uuid_at(14, 4), uuid_at(10, 5), 'LIKE');

-- Seed additional swipes for user 1 profile activity history
INSERT INTO private.swipe (id, user_id, activity_id, group_id, action)
VALUES
  (uuid_at(19, 5), uuid_at(1, 1), uuid_at(14, 5), NULL, 'LIKE'),
  (uuid_at(19, 6), uuid_at(1, 1), uuid_at(14, 6), NULL, 'SUPER_LIKE'),
  (uuid_at(19, 7), uuid_at(1, 1), uuid_at(14, 7), NULL, 'LIKE'),
  (uuid_at(19, 8), uuid_at(1, 1), uuid_at(14, 8), NULL, 'LIKE'),
  (uuid_at(19, 9), uuid_at(1, 1), uuid_at(14, 1), NULL, 'SUPER_LIKE'),
  (uuid_at(19, 10), uuid_at(1, 1), uuid_at(14, 3), NULL, 'PASS');

-- Seed group conversations for chat preview
INSERT INTO private.conversation (id, subject, owner_entity_id)
VALUES
  (uuid_at(30, 1), 'Friday Night Crew Chat', uuid_at(1, 1)),
  (uuid_at(30, 2), 'Weekend Explorers Chat', uuid_at(1, 2)),
  (uuid_at(30, 3), 'Taco Tuesday Squad Chat', uuid_at(1, 1));

INSERT INTO private.conversation_participant (conversation_id, entity_id)
VALUES
  -- Friday Night Crew Chat
  (uuid_at(30, 1), uuid_at(1, 1)),
  (uuid_at(30, 1), uuid_at(1, 2)),
  (uuid_at(30, 1), uuid_at(1, 3)),
  (uuid_at(30, 1), uuid_at(1, 4)),
  (uuid_at(30, 1), uuid_at(1, 5)),
  (uuid_at(30, 1), uuid_at(1, 6)),
  -- Weekend Explorers Chat
  (uuid_at(30, 2), uuid_at(1, 2)),
  (uuid_at(30, 2), uuid_at(1, 3)),
  (uuid_at(30, 2), uuid_at(1, 1)),
  -- Taco Tuesday Squad Chat
  (uuid_at(30, 3), uuid_at(1, 1)),
  (uuid_at(30, 3), uuid_at(1, 4)),
  (uuid_at(30, 3), uuid_at(1, 5)),
  (uuid_at(30, 3), uuid_at(1, 6));

INSERT INTO private.conversation_message (id, conversation_id, prev_message_id, author_entity_id, content_text)
VALUES
  -- Friday Night Crew Chat messages
  (uuid_at(31, 1), uuid_at(30, 1), null, uuid_at(1, 2), 'Hey everyone! Ready for tonight?'),
  (uuid_at(31, 2), uuid_at(30, 1), uuid_at(31, 1), uuid_at(1, 1), 'Absolutely! Let''s do this 🔥'),
  -- Weekend Explorers Chat messages
  (uuid_at(31, 3), uuid_at(30, 2), null, uuid_at(1, 3), 'Found some cool spots downtown'),
  (uuid_at(31, 4), uuid_at(30, 2), uuid_at(31, 3), uuid_at(1, 2), 'Share the links!'),
  -- Taco Tuesday Squad Chat messages
  (uuid_at(31, 5), uuid_at(30, 3), null, uuid_at(1, 4), 'Taco Tuesday is the best day'),
  (uuid_at(31, 6), uuid_at(30, 3), uuid_at(31, 5), uuid_at(1, 1), 'Facts. Who''s in this week?');

-- Link conversations to groups
UPDATE private.planet_group SET conversation_id = uuid_at(30, 1) WHERE id = uuid_at(10, 1);
UPDATE private.planet_group SET conversation_id = uuid_at(30, 2) WHERE id = uuid_at(10, 2);
UPDATE private.planet_group SET conversation_id = uuid_at(30, 3) WHERE id = uuid_at(10, 3);

-- Seed group chat messages with context for message types (system, activity share)
-- Update existing conversation messages with context
UPDATE private.conversation_message SET context = '{"messageType": "TEXT"}' WHERE id IN (
  uuid_at(31, 1), uuid_at(31, 2), uuid_at(31, 3), uuid_at(31, 4), uuid_at(31, 5), uuid_at(31, 6)
);

-- Add richer chat messages for Friday Night Crew
INSERT INTO private.conversation_message (id, conversation_id, prev_message_id, author_entity_id, content_text, context)
VALUES
  -- System message: Kai joined
  (uuid_at(31, 10), uuid_at(30, 1), uuid_at(31, 2), uuid_at(0, 0), '🎉 Kai joined the group', '{"messageType": "SYSTEM"}'),
  -- Marcus: opening message
  (uuid_at(31, 11), uuid_at(30, 1), uuid_at(31, 10), uuid_at(1, 3), 'Yo crew, tonight is going to be legendary 🚀', '{"messageType": "TEXT"}'),
  -- Kai shares Neon Bowl activity
  (uuid_at(31, 12), uuid_at(30, 1), uuid_at(31, 11), uuid_at(1, 5), NULL, ('{"messageType": "ACTIVITY_SHARE", "sharedActivityId": "' || uuid_at(14, 5)::text || '"}')::jsonb),
  -- Dana: Let's figure out tonight
  (uuid_at(31, 13), uuid_at(30, 1), uuid_at(31, 12), uuid_at(1, 6), 'Let''s figure out tonight! Who''s swiped already?', '{"messageType": "TEXT"}'),
  -- Dana: bowling alley deal
  (uuid_at(31, 14), uuid_at(30, 1), uuid_at(31, 13), uuid_at(1, 6), 'Just super liked the bowling alley — they have a neon night deal 🎳', '{"messageType": "TEXT"}'),
  -- Marcus: Karaoke or rooftop
  (uuid_at(31, 15), uuid_at(30, 1), uuid_at(31, 14), uuid_at(1, 3), 'Karaoke or rooftop? I super liked both 😍', '{"messageType": "TEXT"}'),
  -- User 1 (Joe): good vibes
  (uuid_at(31, 16), uuid_at(30, 1), uuid_at(31, 15), uuid_at(1, 1), 'I''m down for anything with good vibes 🎶', '{"messageType": "TEXT"}'),
  -- Jess shares Rooftop Sunset Lounge activity
  (uuid_at(31, 17), uuid_at(30, 1), uuid_at(31, 16), uuid_at(1, 2), 'Check this out — it''s perfect for tonight!', ('{"messageType": "ACTIVITY_SHARE", "sharedActivityId": "' || uuid_at(14, 4)::text || '"}')::jsonb),
  -- Priya: cocktails
  (uuid_at(31, 18), uuid_at(30, 1), uuid_at(31, 17), uuid_at(1, 4), 'Omg yes the rooftop has 2-for-1 cocktails tonight 🍹', '{"messageType": "TEXT"}'),
  -- System message: battle started
  (uuid_at(31, 19), uuid_at(30, 1), uuid_at(31, 18), uuid_at(0, 0), '⚔️ A battle has started! Vote now.', '{"messageType": "SYSTEM"}'),
  -- Recent messages: Alex, Priya, Sofia
  (uuid_at(31, 20), uuid_at(30, 1), uuid_at(31, 19), uuid_at(1, 5), 'Anyone down for bowling tonight?', '{"messageType": "TEXT"}'),
  (uuid_at(31, 21), uuid_at(30, 1), uuid_at(31, 20), uuid_at(1, 4), 'Yes! What time?', '{"messageType": "TEXT"}'),
  (uuid_at(31, 22), uuid_at(30, 1), uuid_at(31, 21), uuid_at(1, 6), 'I''m in, 8pm works for me.', '{"messageType": "TEXT"}');

-- Seed reactions on chat messages
INSERT INTO private.group_chat_reaction (id, message_id, user_id, emoji)
VALUES
  -- Reactions on Marcus's "legendary" message (uuid_at(31, 11))
  (uuid_at(32, 1), uuid_at(31, 11), uuid_at(1, 1), '🚀'),
  (uuid_at(32, 2), uuid_at(31, 11), uuid_at(1, 2), '🚀'),
  (uuid_at(32, 3), uuid_at(31, 11), uuid_at(1, 4), '🚀'),
  (uuid_at(32, 4), uuid_at(31, 11), uuid_at(1, 5), '🚀'),
  (uuid_at(32, 5), uuid_at(31, 11), uuid_at(1, 6), '🚀'),
  -- Reactions on Marcus's "Karaoke or rooftop" message (uuid_at(31, 15))
  (uuid_at(32, 6), uuid_at(31, 15), uuid_at(1, 2), '😍'),
  (uuid_at(32, 7), uuid_at(31, 15), uuid_at(1, 4), '😍'),
  (uuid_at(32, 8), uuid_at(31, 15), uuid_at(1, 1), '👍'),
  (uuid_at(32, 9), uuid_at(31, 15), uuid_at(1, 5), '👍'),
  (uuid_at(32, 10), uuid_at(31, 15), uuid_at(1, 6), '👍'),
  -- Reactions on Priya's cocktails message (uuid_at(31, 18))
  (uuid_at(32, 11), uuid_at(31, 18), uuid_at(1, 1), '🔥'),
  (uuid_at(32, 12), uuid_at(31, 18), uuid_at(1, 2), '🔥'),
  (uuid_at(32, 13), uuid_at(31, 18), uuid_at(1, 3), '🔥'),
  (uuid_at(32, 14), uuid_at(31, 18), uuid_at(1, 5), '🔥');

-- Seed additional swipes for group activity feed on Friday Night Crew
INSERT INTO private.swipe (id, user_id, activity_id, group_id, action)
VALUES
  (uuid_at(19, 11), uuid_at(1, 2), uuid_at(14, 4), uuid_at(10, 1), 'SUPER_LIKE'),
  (uuid_at(19, 12), uuid_at(1, 1), uuid_at(14, 5), uuid_at(10, 1), 'LIKE'),
  (uuid_at(19, 13), uuid_at(1, 2), uuid_at(14, 6), uuid_at(10, 1), 'LIKE'),
  (uuid_at(19, 14), uuid_at(1, 1), uuid_at(14, 4), uuid_at(10, 1), 'LIKE');

-- Seed pending invites targeting user 1 (woz@example.com)
INSERT INTO private.invite (id, group_id, invited_by_user_id, invited_user_id, invite_code, is_accepted)
VALUES
  (uuid_at(12, 1), uuid_at(10, 2), uuid_at(1, 2), uuid_at(1, 1), 'INVITE01CODE', false),
  (uuid_at(12, 2), uuid_at(10, 1), uuid_at(1, 2), uuid_at(1, 1), 'INVITE02CODE', false);

-- Seed invites sent from Friday Night Crew (group 10,1) for the invite screen
INSERT INTO private.invite (id, group_id, invited_by_user_id, invited_user_id, invite_code, is_accepted)
VALUES
  (uuid_at(12, 3), uuid_at(10, 1), uuid_at(1, 1), uuid_at(1, 3), 'FNC3INVITE', false),
  (uuid_at(12, 4), uuid_at(10, 1), uuid_at(1, 1), uuid_at(1, 5), 'FNC5INVITE', true),
  (uuid_at(12, 5), uuid_at(10, 1), uuid_at(1, 1), NULL, 'FNCLINKINV', false);

-- Seed 4 open planet groups (visible in OPEN PLANETS tab, not joined by test user 1)
INSERT INTO private.planet_group (id, name, is_open_to_strangers, max_group_size, visibility, created_by_id, latitude, longitude, featured_activity_name)
VALUES
  (uuid_at(10, 6), 'Weekend Warriors', true, 8, 'PUBLIC', uuid_at(1, 4), 44.9720, -93.2650, 'Cosmic Bowling'),
  (uuid_at(10, 7), 'Taco Tuesdays',    true, 6, 'PUBLIC', uuid_at(1, 5), 44.9604, -93.2650, NULL),
  (uuid_at(10, 8), 'Night Owls',       true, 6, 'PUBLIC', uuid_at(1, 6), 44.9662, -93.2650, 'Rooftop Drinks'),
  (uuid_at(10, 9), 'Art Crawlers',     true, 6, 'PUBLIC', uuid_at(1, 7), 44.9474, -93.2650, 'Northeast Art Crawl');

-- Seed orbit record: user 1 orbiting Night Owls (for orbit notification demo)
INSERT INTO private.group_orbit (id, group_id, user_id)
VALUES
  (uuid_at(52, 1), uuid_at(10, 8), uuid_at(1, 1));

-- Seed members for open planet groups (user 1 is NOT a member so they appear in Open Planets tab)
INSERT INTO private.group_member (id, group_id, user_id, is_owner)
VALUES
  -- Weekend Warriors (6 members: users 4-9)
  (uuid_at(11, 22), uuid_at(10, 6), uuid_at(1, 4), true),
  (uuid_at(11, 23), uuid_at(10, 6), uuid_at(1, 5), false),
  (uuid_at(11, 24), uuid_at(10, 6), uuid_at(1, 6), false),
  (uuid_at(11, 25), uuid_at(10, 6), uuid_at(1, 7), false),
  (uuid_at(11, 26), uuid_at(10, 6), uuid_at(1, 8), false),
  (uuid_at(11, 27), uuid_at(10, 6), uuid_at(1, 9), false),
  -- Taco Tuesdays (3 members: users 5-7)
  (uuid_at(11, 28), uuid_at(10, 7), uuid_at(1, 5), true),
  (uuid_at(11, 29), uuid_at(10, 7), uuid_at(1, 6), false),
  (uuid_at(11, 30), uuid_at(10, 7), uuid_at(1, 7), false),
  -- Night Owls (4 members: users 6-9)
  (uuid_at(11, 31), uuid_at(10, 8), uuid_at(1, 6), true),
  (uuid_at(11, 32), uuid_at(10, 8), uuid_at(1, 7), false),
  (uuid_at(11, 33), uuid_at(10, 8), uuid_at(1, 8), false),
  (uuid_at(11, 34), uuid_at(10, 8), uuid_at(1, 9), false),
  -- Art Crawlers (5 members: users 4-8)
  (uuid_at(11, 35), uuid_at(10, 9), uuid_at(1, 4), true),
  (uuid_at(11, 36), uuid_at(10, 9), uuid_at(1, 5), false),
  (uuid_at(11, 37), uuid_at(10, 9), uuid_at(1, 6), false),
  (uuid_at(11, 38), uuid_at(10, 9), uuid_at(1, 7), false),
  (uuid_at(11, 39), uuid_at(10, 9), uuid_at(1, 8), false);
