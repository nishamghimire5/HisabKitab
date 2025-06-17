# Database Migration Instructions

To apply the collaborative features migration to your Supabase database, follow these steps:

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/wlwazqzxmxmltpfpgvlg
2. Navigate to the "SQL Editor" in the sidebar
3. Click "New Query"

## Step 2: Run the Migration SQL

Copy and paste the entire contents of `supabase/migrations/20250617050000-add-usernames-and-invitations.sql` into the SQL editor and execute it.

The migration includes:

- ✅ Adding username and bio columns to profiles table
- ✅ Creating trip_members table for better member management
- ✅ Creating trip_invitations table for pending invitations
- ✅ Setting up Row Level Security (RLS) policies
- ✅ Creating functions for username generation and invitation handling

## Step 3: Verify Migration

After running the migration, you should see these new tables in your database:

- `profiles` (updated with username, bio columns)
- `trip_members`
- `trip_invitations`

## Features Available After Migration

1. **User Discovery**: Search for users by username or email
2. **Trip Invitations**: Send and receive trip invitations
3. **Shared Dashboard**: View both owned and shared trips
4. **Username Display**: Automatic username generation for new users
5. **Member Management**: Better role-based access control

## Testing

Once the migration is applied, you can test the new features:

1. Create a new account to see automatic username generation
2. Search for users by username in the CreateTripModal
3. Check the invitation notifications at the top of the dashboard
4. View shared trips in the dedicated section

The app will automatically work with the new database structure once the migration is applied.
