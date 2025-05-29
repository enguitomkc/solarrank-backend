-- Migration: Remove address column from users table
-- This removes the address column since location already exists

-- Drop address column
ALTER TABLE users 
DROP COLUMN IF EXISTS address; 