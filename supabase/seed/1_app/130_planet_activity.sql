-- Seed businesses for Twin Cities venues
INSERT INTO private.business (id, owner_id, name, is_verified)
VALUES
  (uuid_at(13, 1), uuid_at(1, 2), 'Brit''s Pub', true),
  (uuid_at(13, 2), uuid_at(1, 3), 'Psycho Suzi''s Motor Lounge', true),
  (uuid_at(13, 3), uuid_at(1, 4), 'Amsterdam Bar and Hall', true),
  (uuid_at(13, 4), uuid_at(1, 5), 'Elsie''s Bowling and Restaurant', true),
  (uuid_at(13, 5), uuid_at(1, 6), 'Acme Comedy Co', true),
  (uuid_at(13, 6), uuid_at(1, 7), '4 Bells Rooftop', true),
  (uuid_at(13, 7), uuid_at(1, 8), 'Brave New Workshop', true),
  (uuid_at(13, 8), uuid_at(1, 9), 'Northeast Minneapolis Arts District', false),
  (uuid_at(13, 9), uuid_at(1, 10), 'Theodore Wirth Regional Park', false),
  (uuid_at(13, 10), uuid_at(1, 11), 'The Dakota Jazz Club', true),
  (uuid_at(13, 11), uuid_at(1, 2), 'Indeed Brewing Company', true),
  (uuid_at(13, 12), uuid_at(1, 3), 'The Escape Game', true),
  (uuid_at(13, 13), uuid_at(1, 4), 'Conga Latin Bistro', true),
  (uuid_at(13, 14), uuid_at(1, 5), 'Minneapolis Farmers Market', false);

-- Seed 15 Twin Cities activities
INSERT INTO private.activity (id, business_id, title, description, category, primary_image_url, price_range, latitude, longitude, address, status, rating)
VALUES
  (uuid_at(14, 1), uuid_at(13, 1), 'Trivia Night', 'Teams of 2 to 6 compete for prizes every Tuesday night', 'GAMING', 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800', 'LOW', 44.9741, -93.2760, 'Brit''s Pub, Minneapolis MN', 'ACTIVE', 4.5),
  (uuid_at(14, 2), uuid_at(13, 2), 'Taco Tuesday', 'Tiki bar tacos on the Mississippi riverbank', 'FOOD_AND_DRINKS', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', 'LOW', 44.9983, -93.2477, 'Psycho Suzi''s Motor Lounge, Minneapolis MN', 'ACTIVE', 4.3),
  (uuid_at(14, 3), uuid_at(13, 3), 'Open Mic Night', 'Local artists take the stage every week', 'LIVE_MUSIC', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'FREE', 44.9510, -93.0870, 'Amsterdam Bar and Hall, Saint Paul MN', 'ACTIVE', 4.6),
  (uuid_at(14, 4), uuid_at(13, 4), 'Cosmic Bowling', 'Neon bowling with cocktails and live DJ', 'SPORTS', 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800', 'MEDIUM', 44.9920, -93.2530, 'Elsie''s Bowling and Restaurant, Minneapolis MN', 'ACTIVE', 4.4),
  (uuid_at(14, 5), uuid_at(13, 5), 'Stand Up Comedy', 'Minneapolis''s longest running comedy showcase', 'COMEDY', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800', 'MEDIUM', 44.9806, -93.2720, 'Acme Comedy Co, Minneapolis MN', 'ACTIVE', 4.8),
  (uuid_at(14, 6), uuid_at(13, 6), 'Rooftop Drinks', 'Panoramic views of downtown Minneapolis skyline', 'NIGHTLIFE', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', 'HIGH', 44.9778, -93.2650, '4 Bells Rooftop, Minneapolis MN', 'ACTIVE', 4.7),
  (uuid_at(14, 7), uuid_at(13, 7), 'Improv Show', 'Award winning improv comedy since 1958', 'COMEDY', 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800', 'MEDIUM', 44.9799, -93.2780, 'Brave New Workshop, Minneapolis MN', 'ACTIVE', 4.9),
  (uuid_at(14, 8), uuid_at(13, 2), 'Karaoke Night', 'Sing your heart out on the river', 'NIGHTLIFE', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', 'LOW', 44.9983, -93.2477, 'Psycho Suzi''s, Minneapolis MN', 'ACTIVE', 4.2),
  (uuid_at(14, 9), uuid_at(13, 8), 'Northeast Art Crawl', 'Self guided tour of 40 plus local galleries and studios', 'ARTS', 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800', 'FREE', 44.9990, -93.2530, 'Northeast Minneapolis Arts District MN', 'ACTIVE', 4.5),
  (uuid_at(14, 10), uuid_at(13, 9), 'Sunset Hike', 'Guided trail walk through 740 acres of urban wilderness', 'OUTDOOR', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'FREE', 44.9870, -93.3210, 'Theodore Wirth Regional Park, Minneapolis MN', 'ACTIVE', 4.7),
  (uuid_at(14, 11), uuid_at(13, 10), 'Jazz Night', 'World class jazz in an intimate downtown venue', 'LIVE_MUSIC', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800', 'MEDIUM', 44.9780, -93.2700, 'The Dakota Jazz Club, Minneapolis MN', 'ACTIVE', 4.9),
  (uuid_at(14, 12), uuid_at(13, 11), 'Brewery Tour', 'Behind the scenes tour with tastings of 6 craft beers', 'FOOD_AND_DRINKS', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', 'LOW', 44.9890, -93.2480, 'Indeed Brewing Company, Minneapolis MN', 'ACTIVE', 4.6),
  (uuid_at(14, 13), uuid_at(13, 12), 'Escape Room', '60 minutes to solve the mystery before time runs out', 'GAMING', 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800', 'MEDIUM', 44.9740, -93.2740, 'The Escape Game, Minneapolis MN', 'ACTIVE', 4.5),
  (uuid_at(14, 14), uuid_at(13, 13), 'Salsa Dancing', 'Beginner friendly salsa lessons followed by open dancing', 'NIGHTLIFE', 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800', 'LOW', 44.9490, -93.2880, 'Conga Latin Bistro, Minneapolis MN', 'ACTIVE', 4.4),
  (uuid_at(14, 15), uuid_at(13, 14), 'Farmers Market', '200 plus vendors of local produce food and handmade goods', 'OUTDOOR', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800', 'FREE', 44.9840, -93.2680, 'Minneapolis Farmers Market MN', 'ACTIVE', 4.8);

-- Seed deals for select activities
INSERT INTO private.deal (id, business_id, headline, deal_type, discount_value_in_percent, terms_and_conditions, minimum_group_size, total_redemption_limit, per_user_redemption_limit, valid_time_start, valid_time_end, start_date, end_date, redemption_code, status)
VALUES
  (uuid_at(17, 1), uuid_at(13, 1), 'First drink free with team signup', 'FREE_ITEM', NULL, 'Valid for team signups of 2 or more. One free well drink or domestic beer per person. Must present code before ordering. Valid Tuesdays only.', 2, 100, 1, '18:00', '23:00', CURRENT_DATE, CURRENT_DATE + interval '90 days', 'TRIVFREE01', 'ACTIVE'),
  (uuid_at(17, 2), uuid_at(13, 2), '$3 street tacos all night', 'FIXED_AMOUNT', NULL, 'All street tacos discounted to $3 each. Dine-in only. Valid Tuesdays only. Cannot be combined with other offers.', NULL, NULL, 1, '17:00', '23:00', CURRENT_DATE, CURRENT_DATE + interval '60 days', 'TACO3TUES', 'ACTIVE'),
  (uuid_at(17, 3), uuid_at(13, 4), '$10 per person for groups of 4+', 'FIXED_AMOUNT', NULL, 'Valid for groups of 4 or more. Includes shoe rental. Valid Friday and Saturday after 8 PM only.', 4, 50, 1, '20:00', '01:00', CURRENT_DATE, CURRENT_DATE + interval '90 days', 'COSMO10GRP', 'ACTIVE'),
  (uuid_at(17, 4), uuid_at(13, 2), 'Free song with any cocktail', 'FREE_ITEM', NULL, 'Order any cocktail and get one free karaoke song pass. One per person per visit. Cannot be combined with other offers.', NULL, 200, 1, '19:00', '01:00', CURRENT_DATE, CURRENT_DATE + interval '60 days', 'SINGFREE01', 'ACTIVE'),
  (uuid_at(17, 5), uuid_at(13, 11), 'Free pint with tour ticket', 'FREE_ITEM', NULL, 'Receive one complimentary pint of any flagship beer with tour ticket purchase. Must be 21 or older. One per person.', NULL, 150, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE + interval '90 days', 'BREWTOUR01', 'ACTIVE');

INSERT INTO private.deal (id, business_id, headline, deal_type, discount_value_in_percent, terms_and_conditions, minimum_group_size, total_redemption_limit, per_user_redemption_limit, start_date, end_date, redemption_code, status)
VALUES
  (uuid_at(17, 6), uuid_at(13, 12), '10% off groups of 5+', 'PERCENTAGE_OFF', 10, 'Valid for groups of 5 or more. Applies to standard room bookings only. Cannot be combined with other promotions.', 5, 100, 1, CURRENT_DATE, CURRENT_DATE + interval '90 days', 'ESCAPE10GP', 'ACTIVE');

-- Link deals to activities
INSERT INTO private.deal_activity (id, deal_id, activity_id)
VALUES
  (uuid_at(18, 1), uuid_at(17, 1), uuid_at(14, 1)),
  (uuid_at(18, 2), uuid_at(17, 2), uuid_at(14, 2)),
  (uuid_at(18, 3), uuid_at(17, 3), uuid_at(14, 4)),
  (uuid_at(18, 4), uuid_at(17, 4), uuid_at(14, 8)),
  (uuid_at(18, 5), uuid_at(17, 5), uuid_at(14, 12)),
  (uuid_at(18, 6), uuid_at(17, 6), uuid_at(14, 13));

-- Seed deal metrics
INSERT INTO private.deal_metrics (deal_id, total_views, total_redemptions, conversion_rate_percent)
VALUES
  (uuid_at(17, 1), 3420, 187, 5.5),
  (uuid_at(17, 2), 5810, 342, 5.9),
  (uuid_at(17, 3), 1890, 64, 3.4),
  (uuid_at(17, 4), 2150, 98, 4.6),
  (uuid_at(17, 5), 1420, 89, 6.3),
  (uuid_at(17, 6), 960, 48, 5.0);

-- Seed deal redemptions
INSERT INTO private.deal_redemption (id, deal_id, user_id)
VALUES
  (uuid_at(22, 1), uuid_at(17, 1), uuid_at(1, 3)),
  (uuid_at(22, 2), uuid_at(17, 1), uuid_at(1, 5)),
  (uuid_at(22, 3), uuid_at(17, 2), uuid_at(1, 1)),
  (uuid_at(22, 4), uuid_at(17, 3), uuid_at(1, 4)),
  (uuid_at(22, 5), uuid_at(17, 5), uuid_at(1, 1));

-- Seed activity metrics for all 15 activities
INSERT INTO private.activity_metrics (activity_id, total_impressions, total_swipes, conversion_rate_percent)
VALUES
  (uuid_at(14, 1), 8432, 2105, 24.9),
  (uuid_at(14, 2), 12847, 3291, 25.6),
  (uuid_at(14, 3), 5210, 1840, 35.3),
  (uuid_at(14, 4), 9870, 2650, 26.8),
  (uuid_at(14, 5), 15320, 4102, 26.8),
  (uuid_at(14, 6), 11200, 3890, 34.7),
  (uuid_at(14, 7), 6540, 1920, 29.4),
  (uuid_at(14, 8), 10100, 3150, 31.2),
  (uuid_at(14, 9), 4320, 1580, 36.6),
  (uuid_at(14, 10), 7650, 2340, 30.6),
  (uuid_at(14, 11), 13100, 4200, 32.1),
  (uuid_at(14, 12), 8900, 2780, 31.2),
  (uuid_at(14, 13), 6200, 1950, 31.5),
  (uuid_at(14, 14), 5400, 1620, 30.0),
  (uuid_at(14, 15), 9100, 3100, 34.1);

-- Seed activity boosts for select activities
INSERT INTO private.activity_boost (id, activity_id, is_active, tier, daily_budget_in_cents, remaining_budget_in_cents, boosted_impressions)
VALUES
  (uuid_at(24, 1), uuid_at(14, 5), true, 'PRO', 7500, 4200, 2340),
  (uuid_at(24, 2), uuid_at(14, 6), true, 'MAX', 15000, 9800, 5120),
  (uuid_at(24, 3), uuid_at(14, 11), false, 'BASIC', 2500, 0, 890);
