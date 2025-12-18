-- Migration to add is_banned field to users table
-- Created: 2025-12-16
-- Description: Add ban/unban functionality for admin

ALTER TABLE users 
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT FALSE AFTER is_verified;

ALTER TABLE users 
ADD COLUMN banned_at TIMESTAMP NULL AFTER is_banned;

ALTER TABLE users 
ADD COLUMN ban_reason TEXT NULL AFTER banned_at;

-- Add index for banned users query
CREATE INDEX idx_users_banned ON users(is_banned);
