
import { useState, useEffect } from "react";
import { Plus, Users, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTripModal from "@/components/CreateTripModal";
import TripCard from "@/components/TripCard";
import UserMenu from "@/components/UserMenu";
import InvitationNotifications from "@/components/InvitationNotifications";
import SharedTrips from "@/components/SharedTrips";
import FriendsManager from "@/components/FriendsManager";
import { Trip } from "@/types/Trip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();  // Load trips from Supabase
  useEffect(() => {
    const loadTrips = async () => {
      if (!user) return;
      try {
        console.log('Loading trips for user:', user.email, 'user.id:', user.id);
        
        // Use simple trips table query for now to avoid schema issues
        const { data: allTrips, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .contains('members', [user.email])
          .order('created_at', { ascending: false });

        console.log('Direct trips query result:', allTrips, 'Error:', tripsError);

        if (tripsError) {
          console.error('Error loading trips:', tripsError);
          console.error('Full trips error object:', JSON.stringify(tripsError, null, 2));
          toast.error(`Failed to load trips: ${tripsError.message}`);
          return;
        }

        // Convert Supabase data to Trip format
        const formattedTrips: Trip[] = (allTrips || []).map(trip => ({
          id: trip.id,
          name: trip.name,
          description: trip.description || '',
          members: trip.members || [],
          expenses: [], // Will be loaded separately when needed
          createdAt: trip.created_at,
          created_by: trip.created_by
        }));

        console.log('Formatted trips:', formattedTrips);
        setTrips(formattedTrips);
      } catch (error) {
        console.error('Error loading trips:', error);
        console.error('Full catch error object:', JSON.stringify(error, null, 2));
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [user]);  const handleCreateTrip = async (newTrip: Omit<Trip, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      // Ensure the creator's email is included in the members array
      const membersWithCreator = [...new Set([user.email, ...newTrip.members])];
      
      const { data, error } = await supabase
        .from('trips')
        .insert({
          name: newTrip.name,
          description: newTrip.description,
          members: membersWithCreator,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating trip:', error);
        toast.error('Failed to create trip');
        return;
      }

      const trip: Trip = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        members: data.members || [],
        expenses: [],
        createdAt: data.created_at
      };

      setTrips([trip, ...trips]);
      setIsCreateModalOpen(false);

      // Send invitations to selected friends
      if (newTrip.initialFriends && newTrip.initialFriends.length > 0) {
        try {
          await sendFriendInvitations(data.id, newTrip.initialFriends);
          toast.success(`Trip created! Invitations sent to ${newTrip.initialFriends.length} friend(s).`);
        } catch (inviteError) {
          console.error('Error sending friend invitations:', inviteError);
          toast.success('Trip created successfully!');
          toast.error('Some invitations failed to send. You can invite them manually.');
        }
      } else {
        toast.success('Trip created successfully!');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip');
    }
  };
  const sendFriendInvitations = async (tripId: string, friendIds: string[]) => {
    console.log('Sending invitations to friends:', friendIds, 'for trip:', tripId);
    
    // Get friend profiles to get their emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', friendIds);

    console.log('Friend profiles retrieved:', profiles, 'Error:', profilesError);

    if (profilesError) {
      throw new Error('Failed to get friend profiles');
    }    // Send invitations to each friend
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
    
    const invitations = profiles.map(profile => ({
      trip_id: tripId,
      invited_user_id: profile.id,
      invited_email: profile.email,
      invited_by: user.id,
      status: 'pending',
      expires_at: expirationDate.toISOString()
    }));

    console.log('Invitations to insert:', invitations);

    const { data: insertedData, error: inviteError } = await supabase
      .from('trip_invitations')
      .insert(invitations)
      .select();

    console.log('Invitation insert result:', insertedData, 'Error:', inviteError);

    if (inviteError) {
      throw new Error('Failed to send invitations');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) {
        console.error('Error deleting trip:', error);
        toast.error('Failed to delete trip');
        return;
      }

      setTrips(trips.filter(trip => trip.id !== tripId));
      toast.success('Trip deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SettleUp Smart
              </h1>
              <p className="text-gray-600 text-sm">Smart expense splitting made simple</p>
            </div>            <div className="flex items-center gap-4">
              <FriendsManager />
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>      <div className="container mx-auto px-4 py-8">
        {/* Invitation Notifications */}
        <InvitationNotifications />
          {/* Shared Trips Section */}
        <div className="mb-8">
          <SharedTrips myTrips={trips} onDeleteTrip={handleDeleteTrip} />
        </div>
        
        {trips.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Calculator className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to SettleUp Smart!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first trip to start splitting expenses with friends. Perfect for vacations, group dinners, and shared activities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center p-6 bg-white/60 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2">Create Groups</h3>
                <p className="text-sm text-gray-600">Add friends and manage group trips effortlessly</p>
              </div>
              <div className="text-center p-6 bg-white/60 rounded-lg">
                <Plus className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">Track Expenses</h3>
                <p className="text-sm text-gray-600">Log expenses with partial participation support</p>
              </div>
              <div className="text-center p-6 bg-white/60 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Smart Settlements</h3>
                <p className="text-sm text-gray-600">Get optimized payment recommendations</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          // Trips Grid
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Trips</h2>
              <p className="text-gray-600">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>          </div>
        )}
      </div>

      <CreateTripModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateTrip={handleCreateTrip}
      />
    </div>
  );
};

export default Index;
