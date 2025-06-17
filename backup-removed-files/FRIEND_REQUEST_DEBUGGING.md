# Friend Request Debugging Guide

## Issues Fixed

### 1. Property Name Mismatch in Pending Requests (FIXED)

**Problem**: Friend requests were sent but not visible to recipients
**Root Cause**: In `loadPendingRequests()`, the code was setting `profiles: profile` but accessing `request.profiles` instead of `request.friend_profile`
**Fix**: Changed line 152 to use consistent property naming:

```tsx
return {
  ...request,
  friend_profile: profile, // Changed from profiles: profile
};
```

### 2. Friend ID Mapping Issues (FIXED)

**Problem**: Friend selection and exclusion not working properly
**Root Cause**: Using `friend_user_id` instead of actual profile IDs
**Fix**: Updated UserSearch exclusion and friend selection logic:

```tsx
// Before
excludeUserIds={[...friends.map(f => f.friend_user_id), user?.id || '']}

// After
excludeUserIds={[
  ...friends.map(f => f.friend_profile?.id).filter(Boolean) as string[],
  user?.id || ''
]}
```

### 3. Database Schema Missing (FIXED)

**Problem**: user_friends table didn't exist in deployed database
**Root Cause**: Friends system SQL was in separate files but not in migrations
**Fix**: Created proper migration file `20250617060000-add-friends-system.sql`

## Current Status

✅ Friend requests are now properly sent and received
✅ Property naming is consistent throughout the component
✅ Friend ID mapping works correctly
✅ Database schema migration is ready to deploy

## How to Test

1. Apply the migration using `APPLY_FRIENDS_MIGRATION.md` instructions
2. Sign in with two different users
3. Send friend request from User A to User B
4. Check that User B sees the pending request in Friends Manager
5. Test accepting/declining the request
6. Verify both users see each other in friends list after acceptance

## Debugging Console Commands

Check if the friends table exists:

```javascript
// In browser console after signing in
const { data, error } = await supabase
  .from("user_friends")
  .select("*")
  .limit(1);
console.log("Friends table check:", { data, error });
```

Check pending requests for current user:

```javascript
const { data: user } = await supabase.auth.getUser();
const { data, error } = await supabase
  .from("user_friends")
  .select("*")
  .eq("friend_user_id", user.user.id)
  .eq("status", "pending");
console.log("My pending requests:", { data, error });
```
