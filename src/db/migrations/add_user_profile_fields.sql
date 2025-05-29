-- Migration: Add missing UserProfile fields to users table
-- This adds the columns that exist in the UserProfile interface but are missing from the users table

-- Add username column (optional, unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add bio column (optional text field for user description)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add company column (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- Add facebook column (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);

-- Add phone number column (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(255);

-- Add rank column (optional, for user ranking/title)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rank VARCHAR(100);

-- Create index on username for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on rank for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);