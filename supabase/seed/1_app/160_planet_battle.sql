-- Seed an active battle for the Friday Night Crew group (user 1 is a member)
-- ends_at = 167 hours from now (voting closes 1 hour before event at 7 days out)
INSERT INTO private.battle (id, group_id, phase, duration_in_min, started_at, ends_at)
VALUES
  (uuid_at(15, 1), uuid_at(10, 1), 'VOTING_OPEN', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '167 hours');

-- Seed a second active battle for Rooftop Regulars (user 1 is a member)
-- ends_at = 167 hours from now (voting closes 1 hour before event at 7 days out)
INSERT INTO private.battle (id, group_id, phase, duration_in_min, started_at, ends_at)
VALUES
  (uuid_at(15, 2), uuid_at(10, 5), 'VOTING_OPEN', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '167 hours');

-- Seed completed battles (WINNER_REVEALED) for recent results
INSERT INTO private.battle (id, group_id, phase, duration_in_min, started_at, ends_at, winning_activity_id)
VALUES
  (uuid_at(15, 3), uuid_at(10, 2), 'WINNER_REVEALED', 3, CURRENT_TIMESTAMP - interval '2 hours', CURRENT_TIMESTAMP - interval '1 hour 57 minutes', uuid_at(14, 6)),
  (uuid_at(15, 4), uuid_at(10, 4), 'WINNER_REVEALED', 3, CURRENT_TIMESTAMP - interval '6 hours', CURRENT_TIMESTAMP - interval '5 hours 57 minutes', uuid_at(14, 4)),
  (uuid_at(15, 5), uuid_at(10, 1), 'WINNER_REVEALED', 3, CURRENT_TIMESTAMP - interval '22 hours', CURRENT_TIMESTAMP - interval '21 hours 57 minutes', uuid_at(14, 5));

-- Seed notifications for test user (woz@example.com = uuid_at(1, 1))
INSERT INTO private.notification (id, user_id, type, title, body, linked_group_id, linked_activity_id, linked_battle_id, is_read, created_at)
VALUES
  (uuid_at(20, 1), uuid_at(1, 1), 'BATTLE_STARTED', 'Friday Night Crew', 'Battle is live! Vote for tonight''s plan now.', uuid_at(10, 1), NULL, uuid_at(15, 1), false, CURRENT_TIMESTAMP - interval '12 minutes'),
  (uuid_at(20, 2), uuid_at(1, 1), 'DEAL_EXPIRING', 'Rooftop Sunset Lounge', '2-for-1 cocktails deal expires in 2 hours.', NULL, uuid_at(14, 4), NULL, false, CURRENT_TIMESTAMP - interval '45 minutes'),
  (uuid_at(20, 3), uuid_at(1, 1), 'GROUP_INVITE', 'Weekend Warriors', 'Alex invited you to join the group.', uuid_at(10, 2), NULL, NULL, false, CURRENT_TIMESTAMP - interval '3 hours'),
  (uuid_at(20, 4), uuid_at(1, 1), 'BATTLE_ENDED', 'Taco Tuesday Squad', 'Winner: Karaoke Night! Check the results.', uuid_at(10, 3), NULL, uuid_at(15, 5), true, CURRENT_TIMESTAMP - interval '26 hours'),
  (uuid_at(20, 5), uuid_at(1, 1), 'FRIEND_JOINED', 'Maya joined Planet', 'Your friend Maya is now on Planet. Add them to a group!', NULL, NULL, NULL, true, CURRENT_TIMESTAMP - interval '53 hours');

-- Seed battle finalists for active battle 1 (Friday Night Crew)
INSERT INTO private.battle_finalist (id, battle_id, activity_id, vote_count)
VALUES
  (uuid_at(16, 1), uuid_at(15, 1), uuid_at(14, 4), 2),
  (uuid_at(16, 2), uuid_at(15, 1), uuid_at(14, 5), 0),
  (uuid_at(16, 3), uuid_at(15, 1), uuid_at(14, 6), 2),
  (uuid_at(16, 12), uuid_at(15, 1), uuid_at(14, 7), 0),
  (uuid_at(16, 13), uuid_at(15, 1), uuid_at(14, 8), 0);

-- Seed battle finalists for active battle 2 (Rooftop Regulars)
INSERT INTO private.battle_finalist (id, battle_id, activity_id, vote_count)
VALUES
  (uuid_at(16, 4), uuid_at(15, 2), uuid_at(14, 6), 2),
  (uuid_at(16, 5), uuid_at(15, 2), uuid_at(14, 8), 0);

-- Seed battle finalists for completed battles
INSERT INTO private.battle_finalist (id, battle_id, activity_id, vote_count)
VALUES
  (uuid_at(16, 6), uuid_at(15, 3), uuid_at(14, 6), 3),
  (uuid_at(16, 7), uuid_at(15, 3), uuid_at(14, 7), 1),
  (uuid_at(16, 8), uuid_at(15, 4), uuid_at(14, 4), 2),
  (uuid_at(16, 9), uuid_at(15, 4), uuid_at(14, 8), 1),
  (uuid_at(16, 10), uuid_at(15, 5), uuid_at(14, 5), 4),
  (uuid_at(16, 11), uuid_at(15, 5), uuid_at(14, 1), 1),
  (uuid_at(16, 14), uuid_at(15, 5), uuid_at(14, 6), 2),
  (uuid_at(16, 15), uuid_at(15, 5), uuid_at(14, 8), 1);

-- Seed votes for active battle 1 (users 2, 3, 5 voted)
INSERT INTO private.vote (id, battle_id, user_id, activity_id, rank)
VALUES
  (uuid_at(21, 1), uuid_at(15, 1), uuid_at(1, 2), uuid_at(14, 4), 1),
  (uuid_at(21, 6), uuid_at(15, 1), uuid_at(1, 3), uuid_at(14, 4), 1),
  (uuid_at(21, 7), uuid_at(15, 1), uuid_at(1, 3), uuid_at(14, 6), 2),
  (uuid_at(21, 8), uuid_at(15, 1), uuid_at(1, 5), uuid_at(14, 6), 1);

-- Seed votes for active battle 2 (users 2 and 8 voted for activity 6)
INSERT INTO private.vote (id, battle_id, user_id, activity_id, rank)
VALUES
  (uuid_at(21, 2), uuid_at(15, 2), uuid_at(1, 2), uuid_at(14, 6), 1),
  (uuid_at(21, 3), uuid_at(15, 2), uuid_at(1, 8), uuid_at(14, 6), 1);

-- Seed votes for user 1 on completed battles (winning votes for battlesWon stat)
-- Battle 15,3: winner is activity 14,6 — user 1 voted for it
INSERT INTO private.vote (id, battle_id, user_id, activity_id, rank)
VALUES
  (uuid_at(21, 4), uuid_at(15, 3), uuid_at(1, 1), uuid_at(14, 6), 1);

-- Seed battle_mini_game_result records for active battle 1 (Friday Night Crew, REACTION_TIME)
-- Joe Tester (user 1) not seeded — his record is created when he plays through the app
-- Ranked fastest to slowest: Jane 445ms (won), Marcus 512ms, Priya 789ms, Alex 923ms, Sofia 1104ms
INSERT INTO private.battle_mini_game_result (id, battle_id, user_id, game_type, won, reaction_time_in_ms)
VALUES
  (uuid_at(22, 1), uuid_at(15, 1), uuid_at(1, 2), 'REACTION_TIME', true,  445),
  (uuid_at(22, 2), uuid_at(15, 1), uuid_at(1, 3), 'REACTION_TIME', false, 512),
  (uuid_at(22, 3), uuid_at(15, 1), uuid_at(1, 4), 'REACTION_TIME', false, 789),
  (uuid_at(22, 4), uuid_at(15, 1), uuid_at(1, 5), 'REACTION_TIME', false, 923),
  (uuid_at(22, 5), uuid_at(15, 1), uuid_at(1, 6), 'REACTION_TIME', false, 1104);

-- Battle 15,5: winner is activity 14,5 — user 1 voted for it
-- Users 1, 2, 5, 6 voted for winner (14,5); users 3, 4 voted for others
INSERT INTO private.vote (id, battle_id, user_id, activity_id, rank)
VALUES
  (uuid_at(21, 5), uuid_at(15, 5), uuid_at(1, 1), uuid_at(14, 5), 1),
  (uuid_at(21, 9), uuid_at(15, 5), uuid_at(1, 2), uuid_at(14, 5), 1),
  (uuid_at(21, 10), uuid_at(15, 5), uuid_at(1, 3), uuid_at(14, 6), 1),
  (uuid_at(21, 11), uuid_at(15, 5), uuid_at(1, 4), uuid_at(14, 6), 1),
  (uuid_at(21, 12), uuid_at(15, 5), uuid_at(1, 5), uuid_at(14, 5), 1),
  (uuid_at(21, 13), uuid_at(15, 5), uuid_at(1, 6), uuid_at(14, 5), 1),
  (uuid_at(21, 14), uuid_at(15, 5), uuid_at(1, 3), uuid_at(14, 8), 2),
  (uuid_at(21, 15), uuid_at(15, 5), uuid_at(1, 4), uuid_at(14, 1), 2);
