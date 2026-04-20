-- Seed daily analytics data for Downtown Lounge (business uuid_at(13, 1)) — 30 days
INSERT INTO private.biz_analytics_daily (business_id, date, impressions, unique_viewers, swipes, deal_redemptions, revenue_estimate_in_cents)
VALUES
  (uuid_at(13, 1), CURRENT_DATE - interval '29 days', 1520, 580, 410, 8, 32000),
  (uuid_at(13, 1), CURRENT_DATE - interval '28 days', 1680, 620, 480, 12, 41000),
  (uuid_at(13, 1), CURRENT_DATE - interval '27 days', 1340, 510, 380, 6, 24000),
  (uuid_at(13, 1), CURRENT_DATE - interval '26 days', 1890, 710, 560, 14, 48000),
  (uuid_at(13, 1), CURRENT_DATE - interval '25 days', 2100, 790, 680, 18, 62000),
  (uuid_at(13, 1), CURRENT_DATE - interval '24 days', 2450, 920, 820, 22, 78000),
  (uuid_at(13, 1), CURRENT_DATE - interval '23 days', 1750, 660, 510, 10, 35000),
  (uuid_at(13, 1), CURRENT_DATE - interval '22 days', 1420, 540, 420, 9, 31000),
  (uuid_at(13, 1), CURRENT_DATE - interval '21 days', 1680, 630, 510, 11, 38000),
  (uuid_at(13, 1), CURRENT_DATE - interval '20 days', 1540, 580, 480, 10, 34000),
  (uuid_at(13, 1), CURRENT_DATE - interval '19 days', 2100, 790, 680, 16, 55000),
  (uuid_at(13, 1), CURRENT_DATE - interval '18 days', 2840, 1060, 920, 24, 85000),
  (uuid_at(13, 1), CURRENT_DATE - interval '17 days', 3200, 1200, 1050, 28, 98000),
  (uuid_at(13, 1), CURRENT_DATE - interval '16 days', 1700, 640, 540, 12, 42000),
  (uuid_at(13, 1), CURRENT_DATE - interval '15 days', 1480, 560, 430, 8, 29000),
  (uuid_at(13, 1), CURRENT_DATE - interval '14 days', 1620, 610, 490, 10, 36000),
  (uuid_at(13, 1), CURRENT_DATE - interval '13 days', 1580, 600, 470, 9, 33000),
  (uuid_at(13, 1), CURRENT_DATE - interval '12 days', 2050, 770, 650, 15, 52000),
  (uuid_at(13, 1), CURRENT_DATE - interval '11 days', 2780, 1040, 900, 23, 82000),
  (uuid_at(13, 1), CURRENT_DATE - interval '10 days', 3100, 1160, 1020, 26, 92000),
  (uuid_at(13, 1), CURRENT_DATE - interval '9 days', 1650, 620, 520, 11, 39000),
  (uuid_at(13, 1), CURRENT_DATE - interval '8 days', 1420, 530, 420, 8, 28000),
  (uuid_at(13, 1), CURRENT_DATE - interval '7 days', 1680, 630, 510, 12, 42000),
  (uuid_at(13, 1), CURRENT_DATE - interval '6 days', 1540, 580, 480, 10, 35000),
  (uuid_at(13, 1), CURRENT_DATE - interval '5 days', 2100, 790, 680, 17, 58000),
  (uuid_at(13, 1), CURRENT_DATE - interval '4 days', 2840, 1060, 920, 24, 86000),
  (uuid_at(13, 1), CURRENT_DATE - interval '3 days', 3200, 1200, 1050, 28, 99000),
  (uuid_at(13, 1), CURRENT_DATE - interval '2 days', 1700, 640, 540, 13, 45000),
  (uuid_at(13, 1), CURRENT_DATE - interval '1 day', 1580, 590, 490, 11, 38000),
  (uuid_at(13, 1), CURRENT_DATE, 1200, 450, 370, 7, 25000);

-- Seed daily analytics data for Sky Bar Austin (business uuid_at(13, 2)) — 14 days
INSERT INTO private.biz_analytics_daily (business_id, date, impressions, unique_viewers, swipes, deal_redemptions, revenue_estimate_in_cents)
VALUES
  (uuid_at(13, 2), CURRENT_DATE - interval '13 days', 2200, 830, 720, 15, 54000),
  (uuid_at(13, 2), CURRENT_DATE - interval '12 days', 2450, 920, 810, 18, 65000),
  (uuid_at(13, 2), CURRENT_DATE - interval '11 days', 1980, 740, 620, 12, 43000),
  (uuid_at(13, 2), CURRENT_DATE - interval '10 days', 2680, 1010, 880, 21, 76000),
  (uuid_at(13, 2), CURRENT_DATE - interval '9 days', 3100, 1160, 1020, 26, 92000),
  (uuid_at(13, 2), CURRENT_DATE - interval '8 days', 3500, 1310, 1180, 30, 108000),
  (uuid_at(13, 2), CURRENT_DATE - interval '7 days', 2100, 790, 660, 14, 48000),
  (uuid_at(13, 2), CURRENT_DATE - interval '6 days', 1900, 710, 590, 11, 40000),
  (uuid_at(13, 2), CURRENT_DATE - interval '5 days', 2300, 860, 740, 16, 56000),
  (uuid_at(13, 2), CURRENT_DATE - interval '4 days', 2150, 810, 690, 14, 50000),
  (uuid_at(13, 2), CURRENT_DATE - interval '3 days', 2900, 1090, 940, 22, 80000),
  (uuid_at(13, 2), CURRENT_DATE - interval '2 days', 3400, 1270, 1120, 28, 100000),
  (uuid_at(13, 2), CURRENT_DATE - interval '1 day', 3600, 1350, 1200, 32, 115000),
  (uuid_at(13, 2), CURRENT_DATE, 1800, 680, 560, 10, 36000);

-- Update subscription tier for Sky Bar Austin to PREMIUM for testing
UPDATE private.business SET subscription_tier = 'PREMIUM' WHERE id = uuid_at(13, 2);
