# Invitation System Debugging Guide

## Current Issue

Invitations are showing as "sent" but friends are not receiving them in their notifications.

## Debugging Steps Added

### 1. Enhanced Console Logging

Added detailed logging to track the invitation flow:

**In Index.tsx (Trip Creation):**

- Logs friend IDs being invited
- Logs friend profiles retrieved
- Logs invitation data being inserted
- Logs insertion results

**In TripMemberManagement.tsx (Quick Add Friends):**

- Logs selected friends
- Logs friend profile lookup
- Logs invitation insertion results

**In InvitationNotifications.tsx (Loading Invitations):**

- Logs current user info
- Logs all invitations found for user (by email AND ID)
- Logs pending invitations specifically

### 2. Debug Button Added

Added a "Debug" button in the Trip Invitations dialog that:

- Shows all invitations in the database
- Tests user-specific invitations by email
- Tests user-specific invitations by user ID
- Displays results in browser console

### 3. Improved Query Logic

Changed invitation loading to use OR condition:

```typescript
.or(`invited_email.eq.${user?.email},invited_user_id.eq.${user?.id}`)
```

## How to Debug

### Step 1: Test with Console Logs

1. Open browser dev tools (F12)
2. Go to Console tab
3. Try sending a friend invitation
4. Watch console logs to see:
   - If friends are found
   - If invitations are created
   - If there are any errors

### Step 2: Use Debug Button

1. Click the bell icon (Trip Invitations)
2. Click the "Debug" button in the top-right
3. Check console for detailed invitation data

### Step 3: Manual Database Check

Run the `debug-invitations.sql` script in Supabase SQL Editor to check:

- If invitations are actually being inserted
- If RLS policies are blocking access
- If email/ID matching is working

## Common Issues to Check

### 1. Email Mismatch

- Check if friend's email in profiles matches their auth email
- Verify user's own email is correct

### 2. RLS Policy Issues

- Invitations might be blocked by Row Level Security
- Check if policies allow reading invitations

### 3. Expiration Issues

- Check if invitations are expiring too quickly
- Verify expires_at field is set correctly

### 4. User ID vs Email Matching

- Some invitations use user_id, others use email
- Make sure both methods are checked

## Expected Console Output

When working correctly, you should see:

```
Sending invitations to friends: [friend-id-1, friend-id-2] for trip: trip-id
Friend profiles retrieved: [{id: "...", email: "friend@example.com"}, ...]
Invitations to insert: [{trip_id: "...", invited_user_id: "...", invited_email: "...", ...}]
Invitation insert result: [{id: "...", trip_id: "...", ...}]
```

When loading invitations:

```
Loading invitations for user: user@example.com User ID: user-id
All invitations for user (email or ID): [invitation objects]
Pending invitations query result: [filtered invitations]
```

## Test Case Analysis

Based on your console logs, we have a specific invitation to test:

**Invitation Details:**

- Invitation ID: `36ce708f-0ee2-401c-b3a8-4d03088d4921`
- Trip ID: `0042493f-3aaf-430b-b12d-930c6068c1ba`
- Invited User ID: `be8ce1d1-5139-444a-80d5-13f79f3ce244`
- Invited Email: `ng21041720@student.ku.edu.np`
- Invited By: `214764d6-ce48-4059-a1e3-553ebd8aa532`
- Status: `pending`

**Next Steps:**

1. Sign in as the invited user (`ng21041720@student.ku.edu.np`)
2. Open the Trip Invitations dialog (bell icon)
3. Click the "Debug" button
4. Check console logs to see if this specific invitation is found

**Expected Debug Output:**
When the invited user clicks Debug, you should see:

```
=== INVITATION DEBUG ===
Current user: {email: "ng21041720@student.ku.edu.np", id: "be8ce1d1-5139-444a-80d5-13f79f3ce244"}
All invitations in database: [should include our invitation]
Invitations by email: [should include our invitation]
Invitations by user ID: [should include our invitation]
```

## Targeted SQL Test

Run this in Supabase SQL Editor to check the specific invitation:

```sql
-- Check if the specific invitation exists
SELECT * FROM trip_invitations
WHERE id = '36ce708f-0ee2-401c-b3a8-4d03088d4921';

-- Check all invitations for the invited email
SELECT * FROM trip_invitations
WHERE invited_email = 'ng21041720@student.ku.edu.np';

-- Check all invitations for the invited user ID
SELECT * FROM trip_invitations
WHERE invited_user_id = 'be8ce1d1-5139-444a-80d5-13f79f3ce244';

-- Test the exact query used by the app
SELECT
  ti.*,
  t.id as trip_id_check,
  t.name as trip_name,
  t.description as trip_description
FROM trip_invitations ti
LEFT JOIN trips t ON t.id = ti.trip_id
WHERE (ti.invited_email = 'ng21041720@student.ku.edu.np' OR ti.invited_user_id = 'be8ce1d1-5139-444a-80d5-13f79f3ce244')
AND ti.status = 'pending'
AND ti.expires_at > NOW();
```

## Next Steps Based on Results

**If invitations are not being inserted:**

- Check RLS policies on trip_invitations
- Verify user permissions
- Check for constraint violations

**If invitations are inserted but not loaded:**

- Check email matching
- Verify RLS policies for SELECT
- Check invitation status and expiration

**If friend profiles are not found:**

- Verify friends relationship exists
- Check profile data integrity
- Ensure friend selection is working correctly
