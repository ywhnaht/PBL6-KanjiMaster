-- Migration to fix foreign key constraints for CASCADE DELETE
-- Created: 2025-12-16
-- Description: Update all foreign keys to properly cascade delete when user is deleted

-- Fix user_roles table
ALTER TABLE user_roles 
DROP FOREIGN KEY user_roles_ibfk_1;

ALTER TABLE user_roles 
DROP FOREIGN KEY user_roles_ibfk_2;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_ibfk_1 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_ibfk_2 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

-- Fix user_profiles table
ALTER TABLE user_profiles 
DROP FOREIGN KEY user_profiles_ibfk_1;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_ibfk_1 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix kanji_progress table
ALTER TABLE kanji_progress 
DROP FOREIGN KEY kanji_progress_ibfk_1;

ALTER TABLE kanji_progress
ADD CONSTRAINT kanji_progress_ibfk_1 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix quiz_history table (if not already has CASCADE)
ALTER TABLE quiz_history 
DROP FOREIGN KEY quiz_history_ibfk_1;

ALTER TABLE quiz_history
ADD CONSTRAINT quiz_history_ibfk_1 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Note: 
-- - notebook_entries, notebooks, search_history, battle_history, notifications already have ON DELETE CASCADE
-- - user_incorrect_questions already has ON DELETE CASCADE
