
import { useState, useEffect } from 'react';
import { User, LogOut, Settings, BookOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProfileSettingsModal from './ProfileSettingsModal';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ username: string | null; full_name: string | null } | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
        try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();

        if (!error) {
          setProfile(data);
        }
      } catch (error) {
        // Silent failure - profile will use default values
      }
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const username = profile?.username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          {username && (
            <p className="text-xs text-blue-600">@{username}</p>
          )}
          <p className="text-xs text-gray-500">{user?.email}</p>        </div>
        <DropdownMenuSeparator />
        <div className="lg:hidden">
          <DropdownMenuItem onClick={() => navigate('/docs')}>
            <BookOpen className="mr-2 h-4 w-4" />
            User Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/about')}>
            <Info className="mr-2 h-4 w-4" />
            About & Contact
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </div>
        <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ProfileSettingsModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </DropdownMenu>
  );
};

export default UserMenu;
