-- Migration: Replace 'location' with 'address' and remove 'rank' column
-- This migration updates the users table structure

-- Add address column with default value
ALTER TABLE users 
ADD COLUMN address VARCHAR(255) DEFAULT 'Davao City, Davao del Sur';

-- Copy existing location data to address column
UPDATE users 
SET address = COALESCE(location, 'Davao City, Davao del Sur') 
WHERE location IS NOT NULL;

-- Drop the location column
ALTER TABLE users 
DROP COLUMN IF EXISTS location;

-- Drop the rank column and its index
DROP INDEX IF EXISTS idx_users_rank;
ALTER TABLE users 
DROP COLUMN IF EXISTS rank; 