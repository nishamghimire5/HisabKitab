import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ProfileDebugger = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const loadProfiles = async () => {
    setLoading(true);
    try {
      // First try to get all profiles
      const { data: allData, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      console.log('All profiles data:', allData, 'Error:', allError);
      
      if (allError) {
        console.error('Error loading all profiles:', allError);
        // Fallback to just current user profile
        const { data: myData, error: myError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .limit(1);
        
        if (myError) {
          console.error('Error loading my profile:', myError);
          setProfiles([]);
        } else {
          setProfiles(myData || []);
        }
      } else {
        setProfiles(allData || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Debugger
          <Button onClick={loadProfiles} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p><strong>Current User ID:</strong> {user?.id}</p>
          <p><strong>Total Profiles:</strong> {profiles.length}</p>
          
          {profiles.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                No profiles found. This could mean:
              </p>
              <ul className="list-disc list-inside mt-2 text-yellow-700">
                <li>No users have signed up yet</li>
                <li>RLS policies are blocking profile access</li>
                <li>The profiles table doesn't exist</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold">Available Profiles:</h3>
              {profiles.map((profile, index) => (
                <div key={profile.id || index} className="p-3 bg-gray-50 rounded border">
                  <p><strong>ID:</strong> {profile.id}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                  <p><strong>Username:</strong> {profile.username || 'Not set'}</p>
                  <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDebugger;
