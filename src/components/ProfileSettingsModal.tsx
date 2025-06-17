import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Check, X } from 'lucide-react';

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSettingsModal = ({ open, onOpenChange }: ProfileSettingsModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, bio')
        .eq('id', user.id)
        .single();      if (error) {
        // Error loading profile
      } else {
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || ''
        });
      }    } catch (error) {
      // Error loading profile
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user?.id || '');      if (error) {
        // Error checking username
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(data.length === 0);
      }    } catch (error) {
      // Error checking username
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Clean username: lowercase, alphanumeric and underscores only
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username: cleanValue }));
    
    // Debounce username check
    setTimeout(() => checkUsernameAvailability(cleanValue), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.username && formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (formData.username && usernameAvailable === false) {
      toast.error('Username is not available');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          username: formData.username || null,
          bio: formData.bio || null
        })
        .eq('id', user.id);      if (error) {
        // Error updating profile
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully!');
        onOpenChange(false);
      }    } catch (error) {
      // Error updating profile
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter a unique username"
                className="pr-8"
              />
              {checkingUsername && (
                <div className="absolute right-2 top-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <Check className="absolute right-2 top-2 w-4 h-4 text-green-500" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <X className="absolute right-2 top-2 w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              Username must be at least 3 characters (letters, numbers, underscores only)
            </p>
            {usernameAvailable === false && (
              <p className="text-xs text-red-500">Username is already taken</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Input
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself"
            />
          </div>

          <div className="flex gap-2 pt-4">
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
              disabled={loading || checkingUsername || (formData.username && usernameAvailable === false)}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal;
