import { useState, useEffect } from "react";
import { Bell, Check, X, Clock, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TripInvitation {
  id: string;
  trip_id: string;
  invited_by: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string | null;
  expires_at: string;
  created_at: string;
  // Optional fields that may not be loaded
  trip?: {
    name: string;
    description: string | null;
  };
  trips?: {
    name: string;
    description: string | null;
  };
  inviter?: {
    full_name: string | null;
    username: string | null;
    email: string;
    avatar_url: string | null;
  };
}

const InvitationNotifications = () => {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadInvitations();
  }, [user]);  const loadInvitations = async () => {
    try {
      // First, let's check if there are any invitations at all for this user
      const { data: allInvitations, error: allError } = await supabase
        .from('trip_invitations')
        .select('*')
        .or(`invited_email.eq.${user?.email},invited_user_id.eq.${user?.id}`);
      
      // Debug: Check pending status filter
      const { data: pendingOnly, error: pendingError } = await supabase
        .from('trip_invitations')
        .select('*')
        .or(`invited_email.eq.${user?.email},invited_user_id.eq.${user?.id}`)
        .eq('status', 'pending');
      
      // Debug: Check expiry filter
      const currentTime = new Date().toISOString();
      const { data: unexpired, error: unexpiredError } = await supabase
        .from('trip_invitations')
        .select('*')
        .or(`invited_email.eq.${user?.email},invited_user_id.eq.${user?.id}`)
        .eq('status', 'pending')
        .or(`expires_at.gt.${currentTime},expires_at.is.null`);
      
      // Load invitations with related data
      const { data: rawInvitations, error } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          trips!inner (
            id,
            name,
            description
          )
        `)
        .or(`invited_email.eq.${user?.email},invited_user_id.eq.${user?.id}`)
        .eq('status', 'pending')
        .or(`expires_at.gt.${currentTime},expires_at.is.null`)
        .order('created_at', { ascending: false });      if (error) {
        // Error loading invitations
        toast.error(`Error loading invitations: ${error.message}`);
        return;
      }

      // Now load inviter details for each invitation
      const enrichedInvitations = await Promise.all(
        (rawInvitations || []).map(async (invitation) => {
          try {            // Get inviter details from profiles
            const { data: inviterProfile } = await supabase
              .from('profiles')
              .select('full_name, username, email, avatar_url')
              .eq('id', invitation.invited_by)
              .single();

            return {
              ...invitation,
              inviter: inviterProfile ? {
                full_name: inviterProfile.full_name,
                username: inviterProfile.username,
                email: inviterProfile.email || '',
                avatar_url: inviterProfile.avatar_url
              } : null
            };          } catch (error) {
            // Error loading inviter details for invitation
            return invitation;
          }
        })
      );

      setInvitations(enrichedInvitations as TripInvitation[]);    } catch (error) {
      // Error loading invitations
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_trip_invitation', {
        invitation_id: invitationId
      });

      if (error) {
        // Error accepting invitation
        toast.error(`Failed to accept invitation: ${error.message}`);
        return;
      }

      if (data) {
        toast.success('Trip invitation accepted! Refreshing your trips...');
        loadInvitations(); // Refresh invitations
        
        // Refresh the main trips list by triggering a page reload or event
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Invitation acceptance returned false, likely expired or invalid
        toast.error('Invitation expired or invalid');
        loadInvitations(); // Refresh to remove invalid invitations
      }
    } catch (error) {
      // Error accepting invitation
      toast.error('Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('trip_invitations')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()        })
        .eq('id', invitationId);

      if (error) {
        // Error declining invitation
        toast.error('Failed to decline invitation');
        return;
      }

      toast.success('Trip invitation declined');
      loadInvitations(); // Refresh invitations
    } catch (error) {
      // Error declining invitation
      toast.error('Failed to decline invitation');
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const pendingCount = invitations.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">        <DialogHeader>          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Trip Invitations
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending invitations</p>
            </div>
          ) : (
            invitations.map((invitation) => (              <Card key={invitation.id} className="border-l-4 border-l-blue-500">                <CardHeader className="pb-3">
                  {/* Date badge - positioned at top right */}
                  <div className="flex justify-end mb-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(invitation.created_at)}
                    </Badge>
                  </div>
                  
                  {/* Main content area */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={invitation.inviter?.avatar_url || undefined} />
                      <AvatarFallback className="text-sm">
                        {invitation.inviter ? 
                          getInitials(invitation.inviter.full_name, invitation.inviter.email) : 
                          'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      {/* Inviter info */}
                      <div className="space-y-1 mb-2">
                        {invitation.inviter?.username && (
                          <Badge variant="outline" className="text-xs">
                            @{invitation.inviter.username}
                          </Badge>
                        )}
                        {invitation.inviter?.full_name && (
                          <div className="text-sm font-medium">
                            {invitation.inviter.full_name}
                          </div>
                        )}
                        {!invitation.inviter && (
                          <div className="text-sm font-medium">
                            Someone
                          </div>
                        )}
                      </div>
                      
                      {/* Invitation text */}
                      <p className="text-xs text-muted-foreground">
                        invited you to join <span className="font-medium text-foreground">{invitation.trips?.name || 'a trip'}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>                        <h4 className="font-medium">{invitation.trips?.name || 'Trip'}</h4>
                        {invitation.trips?.description && (
                          <p className="text-sm text-muted-foreground">
                            {invitation.trips.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {invitation.message && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm italic">"{invitation.message}"</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Expires: {formatDate(invitation.expires_at)}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationNotifications;
