-- Migration: Add energy column to posts table
-- This adds the energy field that tracks the total votes for a post

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 0;

-- Create index on energy for sorting posts by energy
CREATE INDEX IF NOT EXISTS idx_posts_energy ON posts(energy); 