import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Trip } from "@/types/Trip";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, "id" | "createdAt">) => void;
}

const CreateTripModal = ({ open, onOpenChange, onCreateTrip }: CreateTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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

    try {
      // Create trip with only the creator as member for security
      const newTrip = {
        name: tripName.trim(),
        description: description.trim(),
        members: [user.email!], // Only creator initially
        expenses: []
      };

      onCreateTrip(newTrip);

      // Reset form
      setTripName("");
      setDescription("");
      
      toast.success("Trip created! Use 'Manage Members' to invite others securely.");
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the trip"
            />
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
