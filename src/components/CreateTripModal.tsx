
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Trip } from "@/types/Trip";

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
}

const CreateTripModal = ({ open, onOpenChange, onCreateTrip }: CreateTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  const handleAddMember = () => {
    setMembers([...members, ""]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripName.trim()) return;
    
    const validMembers = members
      .map(member => member.trim())
      .filter(member => member.length > 0);
    
    // Note: Creator's email will be automatically added, so we only need 1+ additional member
    if (validMembers.length < 1) {
      alert("Please add at least 1 member to the trip.");
      return;
    }

    onCreateTrip({
      name: tripName.trim(),
      description: description.trim(),
      members: validMembers,
      expenses: []
    });

    // Reset form
    setTripName("");
    setDescription("");
    setMembers([""]);
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
          </div>          <div className="space-y-3">
            <Label>Trip Members (Email Addresses)</Label>
            <p className="text-sm text-muted-foreground">
              Add the email addresses of people you want to share this trip with. You'll be automatically included.
            </p>
            {members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  placeholder={`member${index + 1}@example.com`}
                  type="email"
                  required={index < 1}
                />
                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveMember(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMember}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
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
