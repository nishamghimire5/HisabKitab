import { useState, useEffect } from "react";
import { Search, UserPlus, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UserSearchProps {
  onUserSelect: (user: UserProfile) => void;
  excludeUserIds?: string[];
  placeholder?: string;
}

const UserSearch = ({ onUserSelect, excludeUserIds = [], placeholder = "Enter complete email or username (min 4 chars)..." }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const searchUsers = async () => {
      // Privacy-focused search: only search when we have a complete email or substantial username
      const isEmail = searchQuery.includes('@');
      const isCompleteEmail = isEmail && searchQuery.includes('.') && searchQuery.length > 5;
      const isSubstantialUsername = !isEmail && searchQuery.length >= 4;
      
      if (!searchQuery.trim() || (!isCompleteEmail && !isSubstantialUsername)) {
        setSearchResults([]);
        return;
      }      setLoading(true);      try {        // Try searching with username support first - use exact match for privacy
        let searchCondition;
        if (isEmail) {
          // For email, use exact match
          searchCondition = `email.eq.${searchQuery}`;
        } else {
          // For username, use exact match
          searchCondition = `username.eq.${searchQuery}`;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')          .or(searchCondition)
          .neq('id', user?.id) // Exclude current user
          .limit(5);

        if (error && error.message.includes('column "username" does not exist')) {
          // Fallback to exact email match only for privacy
          if (isEmail) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('profiles')
              .select('id, email, full_name, avatar_url')
              .eq('email', searchQuery)
              .neq('id', user?.id)
              .limit(5);
            
            if (fallbackError) {
              setSearchResults([]);
              toast.error('Search failed. Please try again.');
            } else {
              // Map fallback data to match UserProfile interface
              const mappedData = (fallbackData || []).map(profile => ({
                ...profile,
                username: null,
                bio: null
              })).filter(profile => 
                !excludeUserIds.includes(profile.id)
              );
              setSearchResults(mappedData);
            }          } else {
            // For username search when column doesn't exist
            setSearchResults([]);
            toast.info('Username search not available. Apply database migration to enable username search.');
          }
          return;        } else if (error) {
          toast.error('Search failed. Please try again.');
          return;
        }

        // Filter out excluded users
        const filteredResults = data?.filter(profile => 
          !excludeUserIds.includes(profile.id)
        ) || [];

        setSearchResults(filteredResults);
      } catch (error) {
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.id, excludeUserIds]);

  const handleUserSelect = (selectedUser: UserProfile) => {
    onUserSelect(selectedUser);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleUserSelect(profile)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile.full_name, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {profile.username && (
                        <Badge variant="secondary" className="text-xs">
                          @{profile.username}
                        </Badge>
                      )}
                      {profile.full_name && (
                        <span className="text-sm font-medium truncate">
                          {profile.full_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  
                  <Button size="sm" variant="ghost" className="shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}      {loading && searchQuery.length >= 4 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {searchQuery.length >= 4 && !loading && searchResults.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm">No users found</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSearch;
