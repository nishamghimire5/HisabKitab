-- Add guest_members column to trips table
ALTER TABLE trips ADD COLUMN
IF NOT EXISTS guest_members JSONB DEFAULT '[]'::JSONB;

-- Add comment to explain the structure
COMMENT ON COLUMN trips.guest_members IS 'Array of guest member objects with id, name, isGuest, and createdAt fields';
