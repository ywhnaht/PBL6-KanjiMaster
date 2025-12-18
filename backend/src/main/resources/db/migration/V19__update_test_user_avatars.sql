-- Migration to update avatar URLs for test users
-- Created: 2025-12-18
-- Description: Fix avatar URLs to use DiceBear API instead of broken Pinterest links

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440003';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440004';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440005';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440006';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440008';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440009';

UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
