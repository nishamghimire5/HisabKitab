
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Mail, User, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trip } from "@/types/Trip";
import UserSearch from "./UserSearch";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
}

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
}

const CreateTripModal = ({ open, onOpenChange, onCreateTrip }: CreateTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [manualEmail, setManualEmail] = useState("");

  const handleAddMember = (user: UserProfile) => {
    if (!selectedMembers.some(member => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleAddManualEmail = () => {
    if (manualEmail.trim() && manualEmail.includes('@')) {
      // Create a temporary user object for manual email
      const tempUser: UserProfile = {
        id: `temp_${Date.now()}`,
        email: manualEmail.trim(),
        full_name: null,
        username: null,
        avatar_url: null,
        bio: null
      };
      
      if (!selectedMembers.some(member => member.email === tempUser.email)) {
        setSelectedMembers([...selectedMembers, tempUser]);
        setManualEmail("");
      }
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a trip");
      return;
    }

    setIsLoading(true);

    try {
      // Create trip with only the creator as initial member for security
      const newTrip = {
        name: tripName.trim(),
        description: description.trim(),
        members: [user.email!], // Only creator initially
        expenses: []
      };

      onCreateTrip(newTrip);

      // Show message about selected members
      if (selectedMembers.length > 0) {
        toast.info(`Trip created! Selected members (${selectedMembers.length}) will need to be invited separately for security.`);
      }

      // Reset form
      setTripName("");
      setDescription("");
      setSelectedMembers([]);
      setManualEmail("");
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Trip
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Thailand Trip 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the trip"
            />
          </div>          <div className="space-y-4">
            <Label>Trip Members</Label>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You'll be automatically included as the trip owner.
              </p>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-700">
                  <p className="font-medium">Security Notice</p>
                  <p>For security, only you will be added initially. You can invite others using "Manage Members" after creating the trip.</p>
                </div>
              </div>
            </div>
            
            {/* User Search */}
            <div className="space-y-2">
              <Label className="text-sm">Search Users</Label>
              <UserSearch 
                onUserSelect={handleAddMember}
                excludeUserIds={selectedMembers.map(m => m.id)}
                placeholder="Search users by username or email..."
              />
            </div>

            {/* Manual Email Input */}
            <div className="space-y-2">
              <Label className="text-sm">Or add email manually</Label>
              <div className="flex gap-2">
                <Input
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="friend@example.com"
                  type="email"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddManualEmail}
                  disabled={!manualEmail.trim() || !manualEmail.includes('@')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Selected Members ({selectedMembers.length})</Label>
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {selectedMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 bg-accent rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.full_name, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {member.username && (
                                <Badge variant="secondary" className="text-xs">
                                  @{member.username}
                                </Badge>
                              )}
                              {member.full_name && (
                                <span className="text-sm font-medium truncate">
                                  {member.full_name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripModal;
