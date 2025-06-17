import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Mail, Send, AlertCircle } from "lucide-react";
import { Trip } from "@/types/Trip";
import UserSearch from "./UserSearch";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TripInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  onInvitationSent: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

const TripInvitationModal = ({ open, onOpenChange, trip, onInvitationSent }: TripInvitationModalProps) => {
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { getDisplayName } = useUserProfiles(trip.members);

  const handleUserSelect = (selectedUser: UserProfile) => {
    // Check if user is already in trip
    if (trip.members.includes(selectedUser.email)) {
      toast.error("User is already a member of this trip");
      return;
    }

    // Check if user is already selected
    if (selectedUsers.find(u => u.id === selectedUser.id)) {
      toast.error("User is already selected");
      return;
    }

    setSelectedUsers(prev => [...prev, selectedUser]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddEmailInvitation = () => {
    if (!manualEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email is already in trip
    if (trip.members.includes(manualEmail)) {
      toast.error("User is already a member of this trip");
      return;
    }

    // Add email-based invitation
    const emailUser: UserProfile = {
      id: `email-${manualEmail}`,
      email: manualEmail,
      full_name: null,
      username: null,
      avatar_url: null
    };

    if (selectedUsers.find(u => u.email === manualEmail)) {
      toast.error("Email is already added");
      return;
    }

    setSelectedUsers(prev => [...prev, emailUser]);
    setManualEmail("");
  };

  const sendInvitations = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to invite");
      return;
    }    setLoading(true);
    try {
      const invitations = selectedUsers.map(selectedUser => ({
        trip_id: trip.id,        invited_user_id: selectedUser.id.startsWith('email-') ? null : selectedUser.id,
        invited_email: selectedUser.email,
        invited_by: user?.id,
        message: invitationMessage.trim() || null,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('trip_invitations')
        .insert(invitations)
        .select();

      if (error) {
        toast.error(`Failed to send invitations: ${error.message}`);
        return;
      }      if (!data || data.length === 0) {
        toast.error('Invitations may not have been sent due to permissions. Check with admin.');
        return;
      }

      toast.success(`Successfully sent ${invitations.length} invitation(s)!`);
      setSelectedUsers([]);
      setInvitationMessage("");
      onInvitationSent();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayNameForUser = (user: UserProfile) => {
    if (user.full_name) return user.full_name;
    if (user.username) return `@${user.username}`;
    return user.email.split('@')[0];
  };

  const getInitials = (user: UserProfile) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Invite Members to {trip.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Search */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Search Users
            </Label>
            <UserSearch
              onUserSelect={handleUserSelect}
              excludeUserIds={[user?.id || '', ...selectedUsers.map(u => u.id)]}
              placeholder="Search by username or email..."
            />
          </div>

          {/* Manual Email Entry */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Or Invite by Email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmailInvitation()}
              />
              <Button
                onClick={handleAddEmailInvitation}
                variant="outline"
                size="sm"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Users to Invite ({selectedUsers.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedUser.avatar_url || ''} />
                        <AvatarFallback>{getInitials(selectedUser)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{getDisplayNameForUser(selectedUser)}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                      {selectedUser.id.startsWith('email-') && (
                        <Badge variant="outline" className="text-xs">Email</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRemoveUser(selectedUser.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitation Message */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Personal Message (Optional)
            </Label>
            <Textarea
              placeholder="Add a personal message to your invitation..."
              value={invitationMessage}
              onChange={(e) => setInvitationMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Invitation System</p>
              <p>Users will receive invitations and must accept them before joining the trip. They can also decline invitations.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={sendInvitations}
              disabled={loading || selectedUsers.length === 0}
              className="flex-1"
            >
              {loading ? 'Sending...' : `Send ${selectedUsers.length} Invitation(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripInvitationModal;
