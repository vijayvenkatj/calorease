-- Seed data for user: c90c6159-bcf3-4993-8967-44aa4d5d08b3
-- Creates 7 days of food logs with 2000+ calories per day
-- Also adds weight logs for analytics

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM food_logs WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3';
-- DELETE FROM weight_logs WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3';

-- DAY 1 (6 days ago) - Total: ~2150 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Oatmeal with Banana & Almonds', 450, 15, 65, 15, NOW() - INTERVAL '6 days' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Shake', 280, 30, 25, 8, NOW() - INTERVAL '6 days' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Grilled Chicken Caesar Salad', 650, 45, 35, 32, NOW() - INTERVAL '6 days' + INTERVAL '12.5 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Apple with Peanut Butter', 220, 8, 28, 12, NOW() - INTERVAL '6 days' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Grilled Steak with Vegetables', 750, 52, 45, 38, NOW() - INTERVAL '6 days' + INTERVAL '19 hours');

INSERT INTO weight_logs (user_id, weight, date, notes, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 75.2, (CURRENT_DATE - INTERVAL '6 days')::text, 'Starting weight', NOW() - INTERVAL '6 days' + INTERVAL '7 hours');

-- DAY 2 (5 days ago) - Total: ~2180 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Scrambled Eggs & Toast', 520, 28, 45, 22, NOW() - INTERVAL '5 days' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Greek Yogurt with Honey', 180, 18, 22, 4, NOW() - INTERVAL '5 days' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Turkey & Cheese Sandwich', 580, 38, 52, 22, NOW() - INTERVAL '5 days' + INTERVAL '13 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Mixed Nuts', 200, 6, 8, 18, NOW() - INTERVAL '5 days' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Chicken Stir-Fry with Rice', 680, 48, 72, 20, NOW() - INTERVAL '5 days' + INTERVAL '19 hours');

-- DAY 3 (4 days ago) - Total: ~2100 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Greek Yogurt Parfait', 380, 25, 48, 10, NOW() - INTERVAL '4 days' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Bar', 250, 20, 30, 8, NOW() - INTERVAL '4 days' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Quinoa Buddha Bowl', 620, 28, 75, 24, NOW() - INTERVAL '4 days' + INTERVAL '12.5 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Apple with Peanut Butter', 220, 8, 28, 12, NOW() - INTERVAL '4 days' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Pasta with Meat Sauce', 720, 42, 85, 25, NOW() - INTERVAL '4 days' + INTERVAL '19 hours');

INSERT INTO weight_logs (user_id, weight, date, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 74.8, (CURRENT_DATE - INTERVAL '4 days')::text, NOW() - INTERVAL '4 days' + INTERVAL '7 hours');

-- DAY 4 (3 days ago) - Total: ~2200 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Protein Pancakes with Berries', 480, 30, 55, 12, NOW() - INTERVAL '3 days' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Shake', 280, 30, 25, 8, NOW() - INTERVAL '3 days' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Beef Burrito Bowl', 720, 42, 68, 30, NOW() - INTERVAL '3 days' + INTERVAL '13 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Greek Yogurt with Honey', 180, 18, 22, 4, NOW() - INTERVAL '3 days' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Baked Salmon with Potatoes', 650, 46, 58, 24, NOW() - INTERVAL '3 days' + INTERVAL '19 hours');

-- DAY 5 (2 days ago) - Total: ~2150 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Avocado Toast & Poached Eggs', 510, 22, 42, 28, NOW() - INTERVAL '2 days' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Bar', 250, 20, 30, 8, NOW() - INTERVAL '2 days' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Salmon & Rice Bowl', 680, 40, 62, 28, NOW() - INTERVAL '2 days' + INTERVAL '12.5 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Mixed Nuts', 200, 6, 8, 18, NOW() - INTERVAL '2 days' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Turkey Meatballs & Spaghetti', 700, 45, 78, 22, NOW() - INTERVAL '2 days' + INTERVAL '19 hours');

INSERT INTO weight_logs (user_id, weight, date, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 75.0, (CURRENT_DATE - INTERVAL '2 days')::text, NOW() - INTERVAL '2 days' + INTERVAL '7 hours');

-- DAY 6 (yesterday) - Total: ~2170 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Oatmeal with Banana & Almonds', 450, 15, 65, 15, NOW() - INTERVAL '1 day' + INTERVAL '8 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Shake', 280, 30, 25, 8, NOW() - INTERVAL '1 day' + INTERVAL '10 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Grilled Chicken Caesar Salad', 650, 45, 35, 32, NOW() - INTERVAL '1 day' + INTERVAL '13 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Apple with Peanut Butter', 220, 8, 28, 12, NOW() - INTERVAL '1 day' + INTERVAL '15 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Grilled Steak with Vegetables', 750, 52, 45, 38, NOW() - INTERVAL '1 day' + INTERVAL '19 hours');

-- DAY 7 (today) - Total: ~2120 calories
INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fats, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'breakfast', 'Scrambled Eggs & Toast', 520, 28, 45, 22, NOW() - INTERVAL '2 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Greek Yogurt with Honey', 180, 18, 22, 4, NOW() - INTERVAL '30 minutes'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'lunch', 'Turkey & Cheese Sandwich', 580, 38, 52, 22, NOW() + INTERVAL '1 hour'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'snack', 'Protein Bar', 250, 20, 30, 8, NOW() + INTERVAL '3 hours'),
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 'dinner', 'Chicken Stir-Fry with Rice', 680, 48, 72, 20, NOW() + INTERVAL '8 hours');

INSERT INTO weight_logs (user_id, weight, date, notes, logged_at) VALUES
('c90c6159-bcf3-4993-8967-44aa4d5d08b3', 74.6, CURRENT_DATE::text, 'Week complete!', NOW() - INTERVAL '2 hours');

-- Verify the inserted data
SELECT 
  DATE(logged_at) as date,
  COUNT(*) as entries,
  SUM(calories::numeric) as total_calories
FROM food_logs 
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
GROUP BY DATE(logged_at)
ORDER BY DATE(logged_at) DESC;

SELECT 
  date,
  weight
FROM weight_logs
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
ORDER BY date DESC;

