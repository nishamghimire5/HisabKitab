import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export const useUserProfiles = (emails: string[] = []) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Ensure emails is an array and has content
      const validEmails = Array.isArray(emails) ? emails.filter(Boolean) : [];
      
      if (!validEmails.length) {
        setProfiles([]);
        setLoading(false);
        return;
      }      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, username, avatar_url')
          .in('email', validEmails);

        if (error) {
          setProfiles([]);
        } else {
          setProfiles(data || []);
        }
      } catch (error) {
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [Array.isArray(emails) ? emails.join(',') : '']);

  const getDisplayName = (email: string): string => {
    const profile = profiles.find(p => p.email === email);
    if (profile) {
      return profile.full_name || profile.username || email.split('@')[0];
    }
    return email.split('@')[0]; // Fallback to email prefix
  };
  const getUserProfile = (email: string): UserProfile | null => {
    return profiles.find(p => p.email === email) || null;
  };

  const getUserDisplayName = (email: string, fullName?: string | null, username?: string | null): string => {
    // If we have the profile info directly, use it
    if (fullName || username) {
      return fullName || username || email.split('@')[0];
    }
    
    // Otherwise, look it up in our profiles
    const profile = profiles.find(p => p.email === email);
    if (profile) {
      return profile.full_name || profile.username || email.split('@')[0];
    }
    
    return email.split('@')[0]; // Fallback to email prefix
  };

  return { profiles, loading, getDisplayName, getUserProfile, getUserDisplayName };
};
