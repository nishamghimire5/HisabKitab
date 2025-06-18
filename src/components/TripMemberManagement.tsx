import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserMinus, Send, AlertCircle, Mail, UserPlus } from "lucide-react";
import { Trip, GuestMember } from "@/types/Trip";
import TripInvitationModal from "./TripInvitationModal";
import FriendsManager from "./FriendsManager";
import GuestMemberManager from "./GuestMemberManager";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface TripMemberManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const TripMemberManagement = ({ open, onOpenChange, trip, onUpdateTrip }: TripMemberManagementProps) => {
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { getDisplayName, getUserProfile } = useUserProfiles(trip.members);

  const isOwner = user && trip.created_by === user.id;
  const handleInvitationSent = () => {
    toast.success("Invitations sent! Users will need to accept them to join the trip.");
  };

  const removeMemberFromTrip = async (email: string) => {
    if (!isOwner) {
      toast.error("Only the trip owner can remove members");
      return;
    }

    if (email === user?.email) {
      toast.error("You cannot remove yourself from the trip");
      return;
    }

    // Check if member has expenses
    const hasExpenses = trip.expenses.some(expense => 
      (Array.isArray(expense.paidBy) && expense.paidBy.some(p => p.member === email)) ||
      (Array.isArray(expense.participants) && expense.participants.some(p => 
        (typeof p === 'string' && p === email) || 
        (typeof p === 'object' && p.member === email)
      ))
    );

    if (hasExpenses) {
      if (!confirm(`${getDisplayName(email)} has expenses in this trip. Removing them may affect calculations. Continue?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const updatedMembers = trip.members.filter(member => member !== email);
      
      const { error } = await supabase
        .from('trips')
        .update({ members: updatedMembers })
        .eq('id', trip.id);      if (error) {
        toast.error('Failed to remove member from trip');
      } else {
        const updatedTrip = { ...trip, members: updatedMembers };
        onUpdateTrip(updatedTrip);
        toast.success(`${getDisplayName(email)} removed from trip`);
      }
    } catch (error) {
      toast.error('Failed to remove member from trip');
    } finally {
      setLoading(false);
    }
  };

  const inviteSelectedFriends = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select friends to invite");
      return;
    }    setLoading(true);
    try {
      // Get friend profiles to get their emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', selectedFriends);

      if (profilesError) {
        toast.error('Failed to get friend information');
        return;
      }// Send invitations to each friend
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
      
      const invitations = profiles.map(profile => ({
        trip_id: trip.id,
        invited_user_id: profile.id,
        invited_email: profile.email,
        invited_by: user?.id,
        status: 'pending',
        expires_at: expirationDate.toISOString()
      }));      const { data: insertedData, error: inviteError } = await supabase
        .from('trip_invitations')
        .insert(invitations)
        .select();

      if (inviteError) {
        toast.error('Failed to send invitations');
        return;
      }

      toast.success(`Invitations sent to ${selectedFriends.length} friend(s)!`);
      setSelectedFriends([]);
    } catch (error) {
      toast.error('Failed to invite friends');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleAddGuest = async (guest: GuestMember) => {
    if (!isOwner) {
      toast.error("Only the trip owner can add guest members");
      return;
    }    setLoading(true);    try {
      const updatedGuestMembers = [...(trip.guestMembers || []), guest];
      
      // For now, just update locally (in a real app, would save to database)
      const updatedTrip = { ...trip, guestMembers: updatedGuestMembers };
      onUpdateTrip(updatedTrip);
      toast.success(`${guest.name} added as temporary member`);
    } catch (error) {
      toast.error('Failed to add guest member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuest = async (guestId: string) => {
    if (!isOwner) {
      toast.error("Only the trip owner can remove guest members");
      return;
    }

    const guestToRemove = trip.guestMembers?.find(g => g.id === guestId);
    if (!guestToRemove) return;

    // Check if guest has expenses
    const hasExpenses = trip.expenses.some(expense => 
      (Array.isArray(expense.paidBy) && expense.paidBy.some(p => p.member === guestId && p.isGuest)) ||
      (Array.isArray(expense.participants) && expense.participants.some(p => 
        p.member === guestId && p.isGuest
      ))
    );

    if (hasExpenses) {
      if (!confirm(`${guestToRemove.name} has expenses in this trip. Removing them may affect calculations. Continue?`)) {
        return;
      }
    }

    setLoading(true);    try {
      const updatedGuestMembers = (trip.guestMembers || []).filter(guest => guest.id !== guestId);
        // For now, just update locally (in a real app, would save to database)
      const updatedTrip = { ...trip, guestMembers: updatedGuestMembers };
      onUpdateTrip(updatedTrip);
      toast.success(`${guestToRemove.name} removed from trip`);
    } catch (error) {
      toast.error('Failed to remove guest member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Trip Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Members */}
          <div>
            <h4 className="font-medium mb-3">Current Members ({trip.members.length})</h4>
            <div className="space-y-2">
              {trip.members.map((email, index) => {
                const profile = getUserProfile(email);
                const isCurrentUser = email === user?.email;
                const isTripOwner = trip.created_by === user?.id && email === user?.email;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(profile?.full_name, email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{getDisplayName(email)}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                      </div>
                      {isTripOwner && (
                        <Badge variant="secondary" className="text-xs">Owner</Badge>
                      )}
                      {isCurrentUser && !isTripOwner && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    {isOwner && !isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemberFromTrip(email)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Members */}
          {(trip.guestMembers && trip.guestMembers.length > 0) && (
            <div>
              <h4 className="font-medium mb-3">Temporary Members ({trip.guestMembers.length})</h4>
              <div className="space-y-2">
                {trip.guestMembers.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-orange-200 text-orange-800">
                          {guest.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{guest.name}</p>
                        <p className="text-xs text-gray-500">Temporary member</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">Guest</Badge>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGuest(guest.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Members */}
          {isOwner ? (
            <div className="space-y-4">
              <h4 className="font-medium">Invite New Members</h4>
              
              {/* Quick Add Friends */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">Quick Add Friends</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select friends to quickly invite to this trip.
                </p>
                
                <FriendsManager
                  onFriendSelect={setSelectedFriends}
                  selectedFriends={selectedFriends}
                  selectionMode={true}
                />
                
                {selectedFriends.length > 0 && (
                  <Button 
                    onClick={inviteSelectedFriends}
                    disabled={loading}
                    className="w-full"
                    variant="default"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Invite {selectedFriends.length} Friend{selectedFriends.length > 1 ? 's' : ''}
                  </Button>
                )}              </div>
              
              <Separator />

              {/* Guest Member Management */}
              <GuestMemberManager
                guestMembers={trip.guestMembers || []}
                onAddGuest={handleAddGuest}
                onRemoveGuest={handleRemoveGuest}
              />
              
              <Separator />
              
              <Button 
                onClick={() => setIsInvitationModalOpen(true)}
                variant="outline"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Custom Invitations
              </Button>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Secure Invitation System</p>
                  <p>Users will receive invitations and must accept them before joining the trip.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <AlertCircle className="w-4 h-4" />
              Only the trip owner can invite new members
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>        </div>
      </DialogContent>
      
      {/* Invitation Modal */}
      <TripInvitationModal
        open={isInvitationModalOpen}
        onOpenChange={setIsInvitationModalOpen}
        trip={trip}
        onInvitationSent={handleInvitationSent}
      />
    </Dialog>
  );
};

export default TripMemberManagement;
