import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Users } from "lucide-react";
import { Trip } from "@/types/Trip";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import FriendsManager from "./FriendsManager";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, "id" | "createdAt">) => void;
}

const CreateTripModal = ({ open, onOpenChange, onCreateTrip }: CreateTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedFriendProfiles, setSelectedFriendProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Update friend profiles when selection changes
  useEffect(() => {
    const fetchFriendProfiles = async () => {
      if (selectedFriends.length === 0) {
        setSelectedFriendProfiles([]);
        return;
      }

      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name, username')
          .in('id', selectedFriends);

        setSelectedFriendProfiles(profiles || []);      } catch (error) {
        // Error fetching friend profiles
      }
    };

    fetchFriendProfiles();
  }, [selectedFriends]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {      // Create trip with only the creator as member for security
      const newTrip = {
        name: tripName.trim(),
        description: description.trim(),
        members: [user.email!], // Only creator initially - friends will be invited
        expenses: [],
        initialFriends: selectedFriends // Pass selected friends for invitation after creation
      };

      onCreateTrip(newTrip);      // Reset form
      setTripName("");
      setDescription("");
      setSelectedFriends([]);
      setSelectedFriendProfiles([]);
      
      if (selectedFriends.length > 0) {
        toast.success(`Trip created! Invitations will be sent to ${selectedFriends.length} friend(s).`);
      } else {
        toast.success("Trip created! Use 'Manage Members' to invite others securely.");
      }    } catch (error) {
      // Error creating trip
      toast.error('Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Name */}
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Weekend Getaway"
              required
            />
          </div>          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the trip"
            />
          </div>

          <Separator />

          {/* Friend Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <Label>Invite Friends (Optional)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Select friends to invite to this trip. They'll receive invitations after the trip is created.
            </p>
            
            <FriendsManager
              onFriendSelect={setSelectedFriends}
              selectedFriends={selectedFriends}
              selectionMode={true}
            />
              {selectedFriends.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedFriendProfiles.map((friend) => (
                  <Badge key={friend.id} variant="secondary" className="text-xs">
                    {friend.full_name || friend.username || friend.email?.split('@')[0]}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Secure Trip Creation</p>
              <p>You'll be added as the trip owner. After creation, use "Manage Members" to send secure invitations to others.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !tripName.trim()}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripModal;
