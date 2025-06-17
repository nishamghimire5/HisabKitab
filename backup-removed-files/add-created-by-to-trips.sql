-- Add created_by field to trips table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Add created_by column to trips table
ALTER TABLE public.trips ADD COLUMN
IF NOT EXISTS created_by UUID REFERENCES auth.users
(id);

-- Create index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_trips_created_by ON public.trips
(created_by);
