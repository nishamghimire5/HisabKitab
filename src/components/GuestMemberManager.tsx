import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Users } from "lucide-react";
import { GuestMember } from "@/types/Trip";

interface GuestMemberManagerProps {
  guestMembers: GuestMember[];
  onAddGuest: (guest: GuestMember) => void;
  onRemoveGuest: (guestId: string) => void;
  className?: string;
}

const GuestMemberManager = ({ 
  guestMembers, 
  onAddGuest, 
  onRemoveGuest, 
  className = "" 
}: GuestMemberManagerProps) => {
  const [newGuestName, setNewGuestName] = useState("");
  const handleAddGuest = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const trimmedName = newGuestName.trim();
    if (!trimmedName) return;

    // Check if guest name already exists
    const existingGuest = guestMembers.find(guest => 
      guest.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingGuest) {
      alert("A guest with this name already exists.");
      return;
    }

    const newGuest: GuestMember = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      isGuest: true,
      createdAt: new Date().toISOString()
    };

    onAddGuest(newGuest);
    setNewGuestName("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <Label className="text-sm font-medium">Temporary Members</Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Add people who don't have accounts yet. You can remove them later if not needed.
      </p>      {/* Add Guest Input */}
      <div className="flex gap-2">
        <Input
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddGuest(e);
            }
          }}
          placeholder="Enter name (e.g., John, Sarah)"
          className="flex-1"
        />
        <Button 
          type="button" 
          size="sm" 
          variant="outline"
          onClick={handleAddGuest}
        >
          <UserPlus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Guest List */}
      {guestMembers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Temporary members ({guestMembers.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {guestMembers.map((guest) => (
              <Badge 
                key={guest.id} 
                variant="secondary" 
                className="flex items-center gap-1 text-xs"
              >
                {guest.name}
                <button
                  type="button"
                  onClick={() => onRemoveGuest(guest.id)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                  title={`Remove ${guest.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestMemberManager;
