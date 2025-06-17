import { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, Search, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import UserSearch from "./UserSearch";
import { useUserProfiles } from "@/hooks/useUserProfiles";

interface Friend {
  id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend_profile?: {
    id: string;
    email: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface FriendsManagerProps {
  onFriendSelect?: (friendIds: string[]) => void;
  selectedFriends?: string[];
  selectionMode?: boolean;
}

const FriendsManager = ({ onFriendSelect, selectedFriends = [], selectionMode = false }: FriendsManagerProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);  const [open, setOpen] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(selectedFriends);
  const { user } = useAuth();
  
  // Initialize useUserProfiles with empty array first, then update with actual emails
  const friendEmails = friends.map(f => f.friend_profile?.email).filter(Boolean) as string[];
  const { getUserDisplayName } = useUserProfiles(friendEmails);

  useEffect(() => {
    if (!user) return;
    loadFriends();
    loadPendingRequests();
  }, [user]);  const loadFriends = async () => {
    try {
      // Load accepted friendships where current user is either the requester or the friend
      // We'll load both directions and combine the results
      const [friendships1, friendships2] = await Promise.all([
        // User is the requester
        supabase
          .from('user_friends')
          .select('*')
          .eq('user_id', user?.id)
          .eq('status', 'accepted'),
        
        // User is the friend
        supabase
          .from('user_friends')
          .select('*')
          .eq('friend_user_id', user?.id)
          .eq('status', 'accepted')
      ]);

      // Check for errors
      if (friendships1.error || friendships2.error) {
        const error = friendships1.error || friendships2.error;
        console.error('Error loading friends:', error);
        // If table doesn't exist, just set empty friends list
        if (error?.message.includes('relation "user_friends" does not exist')) {
          console.info('Friends table not created yet. Run create-friends-system.sql to enable friends feature.');
          setFriends([]);
        }
        return;
      }

      // Load profile data for friends and combine results
      const allFriendships = [
        ...(friendships1.data || []),
        ...(friendships2.data || [])
      ];

      const friendshipsWithProfiles = await Promise.all(
        allFriendships.map(async (friendship) => {
          try {
            // Determine which user is the friend (not the current user)
            const friendId = friendship.user_id === user?.id ? friendship.friend_user_id : friendship.user_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, email, full_name, username, avatar_url')
              .eq('id', friendId)
              .single();

            return {
              ...friendship,
              friend_profile: profile
            };
          } catch (error) {
            console.warn('Error loading friend profile:', friendship.id, error);
            return friendship;
          }
        })
      );

      console.log('Loaded friends:', friendshipsWithProfiles);
      setFriends(friendshipsWithProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };const loadPendingRequests = async () => {
    try {
      // Load pending friend requests sent TO the current user
      const { data: requests, error } = await supabase
        .from('user_friends')
        .select('*')
        .eq('friend_user_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pending requests:', error);
        // If table doesn't exist, just set empty pending requests
        if (error.message.includes('relation "user_friends" does not exist')) {
          setPendingRequests([]);
        }
        return;
      }

      // Load profile data for each requester
      const requestsWithProfiles = await Promise.all(
        (requests || []).map(async (request) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, email, full_name, username, avatar_url')
              .eq('id', request.user_id)
              .single();            return {
              ...request,
              friend_profile: profile
            };
          } catch (error) {
            console.warn('Error loading profile for request:', request.id, error);
            return request;
          }
        })
      );      console.log('Loaded pending requests:', requestsWithProfiles);
      console.log('Current user ID:', user?.id);
      console.log('Requests for current user:', requestsWithProfiles.filter(r => r.friend_user_id === user?.id));
      setPendingRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      setPendingRequests([]);
    }
  };  const sendFriendRequest = async (friendProfile: any) => {
    try {
      console.log('Sending friend request from', user?.id, 'to', friendProfile.id);
      
      // Check if friendship already exists in either direction
      const [check1, check2] = await Promise.all([
        supabase
          .from('user_friends')
          .select('*')
          .eq('user_id', user?.id)
          .eq('friend_user_id', friendProfile.id)
          .maybeSingle(),
        
        supabase
          .from('user_friends')
          .select('*')
          .eq('user_id', friendProfile.id)
          .eq('friend_user_id', user?.id)
          .maybeSingle()      ]);

      console.log('Existing friendship check:', { check1: check1.data, check2: check2.data });

      const existing = check1.data || check2.data;
      
      if (existing) {
        if (existing.status === 'pending') {
          toast.error('Friend request already sent or pending');
        } else if (existing.status === 'accepted') {
          toast.error('You are already friends');
        } else {
          toast.error('Friend request already exists');
        }
        return;
      }      const { data: insertData, error } = await supabase
        .from('user_friends')
        .insert({
          user_id: user?.id,
          friend_user_id: friendProfile.id,
          status: 'pending'
        })
        .select()
        .single();

      console.log('Friend request insert result:', { data: insertData, error });

      if (error) {
        console.error('Error sending friend request:', error);
        if (error.message.includes('relation "user_friends" does not exist')) {
          toast.error('Friends feature not available yet. Please contact admin to set up the friends system.');
        } else if (error.code === '23505') {
          // Duplicate key constraint - friendship already exists
          toast.error('Friend request already exists');
        } else {
          toast.error('Failed to send friend request');
        }
        return;
      }      toast.success(`Friend request sent to ${getUserDisplayName(friendProfile.email, friendProfile.full_name, friendProfile.username)}!`);
      
      // Refresh pending requests in case there are any changes
      loadPendingRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const respondToFriendRequest = async (requestId: string, response: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('user_friends')
        .update({ status: response })
        .eq('id', requestId);

      if (error) {
        console.error('Error responding to friend request:', error);
        toast.error('Failed to respond to friend request');
        return;
      }

      toast.success(`Friend request ${response}!`);
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Failed to respond to friend request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('Error removing friend:', error);
        toast.error('Failed to remove friend');
        return;
      }

      toast.success('Friend removed');
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelection = selectedFriendIds.includes(friendId)
      ? selectedFriendIds.filter(id => id !== friendId)
      : [...selectedFriendIds, friendId];
    
    setSelectedFriendIds(newSelection);
    onFriendSelect?.(newSelection);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };
  const getFriendProfile = (friendship: Friend) => {
    // Return the profile of the friend (not the current user)
    // Since we load friendships in both directions and map them correctly,
    // friend_profile should always contain the correct friend info
    return friendship.friend_profile;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Friends {friends.length > 0 && `(${friends.length})`}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friends Manager
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                loadFriends();
                loadPendingRequests();
              }}
              className="h-8 px-2"
            >
              🔄 Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Friend Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Add Friends</h3>            <UserSearch
              onUserSelect={sendFriendRequest}
              excludeUserIds={[
                ...friends.map(f => f.friend_profile?.id).filter(Boolean) as string[], 
                user?.id || ''
              ]}
              placeholder="Search for friends by email or username..."
            />
          </div>

          <Separator />

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Pending Requests</h3>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 bg-accent rounded-lg">                    <Avatar className="w-8 h-8">
                      <AvatarImage src={request.friend_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(request.friend_profile?.full_name, request.friend_profile?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {getUserDisplayName(request.friend_profile?.email || '', request.friend_profile?.full_name, request.friend_profile?.username)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Wants to be friends
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => respondToFriendRequest(request.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => respondToFriendRequest(request.id, 'declined')}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Friends List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Your Friends</h3>
              {selectionMode && (
                <Badge variant="secondary">
                  {selectedFriendIds.length} selected
                </Badge>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No friends yet</p>
                <p className="text-xs">Start by adding some friends above!</p>
              </div>
            ) : (
              <div className="space-y-2">                {friends.map((friendship) => {
                  const friendProfile = getFriendProfile(friendship);
                  const isSelected = selectedFriendIds.includes(friendProfile?.id || '');
                  
                  return (
                    <div 
                      key={friendship.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectionMode 
                          ? `cursor-pointer hover:bg-accent ${isSelected ? 'bg-primary/10 border-primary' : ''}` 
                          : 'hover:bg-accent'
                      }`}
                      onClick={selectionMode ? () => toggleFriendSelection(friendProfile?.id || '') : undefined}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friendProfile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(friendProfile?.full_name, friendProfile?.email || '')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {getUserDisplayName(friendProfile?.email || '', friendProfile?.full_name, friendProfile?.username)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{friendProfile?.email}</span>
                        </div>
                      </div>
                      
                      {!selectionMode && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFriend(friendship.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {selectionMode && isSelected && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendsManager;
