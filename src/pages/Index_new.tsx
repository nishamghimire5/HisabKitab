import { useState, useEffect } from "react";
import { Plus, Users, Calculator, TrendingUp, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load trips from Supabase
  useEffect(() => {
    const loadTrips = async () => {
      if (!user) return;
      try {
        // Use simple trips table query for now to avoid schema issues
        const { data: allTrips, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .contains('members', [user.email])
          .order('created_at', { ascending: false });

        if (tripsError) {
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

        setTrips(formattedTrips);
      } catch (error) {
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [user]);

  const handleCreateTrip = async (newTrip: Omit<Trip, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      // Ensure the creator is always in the members list
      const membersWithCreator = newTrip.members.includes(user.email) 
        ? newTrip.members 
        : [user.email, ...newTrip.members];

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
          toast.success('Trip created successfully!');
          toast.error('Some invitations failed to send. You can invite them manually.');
        }
      } else {
        toast.success('Trip created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create trip');
    }
  };

  const sendFriendInvitations = async (tripId: string, friendIds: string[]) => {
    // Get friend profiles to get their emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', friendIds);

    if (profilesError) {
      throw new Error('Failed to get friend profiles');
    }

    // Send invitations to each friend
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
    
    const invitations = profiles.map(profile => ({
      trip_id: tripId,
      invited_email: profile.email,
      invited_by: user!.id,
      expires_at: expirationDate.toISOString(),
      status: 'pending'
    }));

    const { error: inviteError } = await supabase
      .from('trip_invitations')
      .insert(invitations);

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
        toast.error('Failed to delete trip');
        return;
      }

      setTrips(trips.filter(trip => trip.id !== tripId));
      toast.success('Trip deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Beautiful Modern Header */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-100/80 border-b border-white/20">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div 
                className="cursor-pointer flex-shrink-0 group transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl shadow-soft group-hover:shadow-glow transition-all duration-300 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-display font-bold gradient-text-primary">
                      SettleUp Smart
                    </h1>
                    <p className="text-gray-600 text-xs md:text-sm font-medium">Smart expense splitting made simple</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/guide')}
                  className="flex items-center gap-2 hover:bg-white/60 hover:text-primary transition-all duration-200 backdrop-blur-sm rounded-lg"
                >
                  <BookOpen className="w-4 h-4" />
                  Guide
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/about')}
                  className="flex items-center gap-2 hover:bg-white/60 hover:text-primary transition-all duration-200 backdrop-blur-sm rounded-lg"
                >
                  <Info className="w-4 h-4" />
                  About
                </Button>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <InvitationNotifications />
                <FriendsManager />
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  size="sm"
                  className="bg-gradient-primary hover:shadow-glow text-white shadow-soft transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold"
                >
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">New Trip</span>
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Shared Trips Section */}
        <div className="mb-8">
          <SharedTrips myTrips={trips} onDeleteTrip={handleDeleteTrip} />
        </div>
        
        {trips.length === 0 ? (
          // Modern Empty State
          <div className="text-center py-16">
            <div className="w-28 h-28 mx-auto mb-8 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-strong animate-float">
              <Calculator className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-display font-bold text-gray-800 mb-4 gradient-text-primary">Welcome to SettleUp Smart!</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto font-medium leading-relaxed">
              Create your first trip to start splitting expenses with friends. Perfect for vacations, group dinners, and shared activities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              <div className="glass-card p-8 rounded-2xl hover:shadow-medium transition-all duration-300 group hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-success rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-gray-800">Create Groups</h3>
                <p className="text-gray-600 leading-relaxed">Add friends and manage group trips effortlessly with smart invitations</p>
              </div>
              
              <div className="glass-card p-8 rounded-2xl hover:shadow-medium transition-all duration-300 group hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-warning rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-gray-800">Track Expenses</h3>
                <p className="text-gray-600 leading-relaxed">Log expenses with partial participation and smart categorization</p>
              </div>
              
              <div className="glass-card p-8 rounded-2xl hover:shadow-medium transition-all duration-300 group hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-gray-800">Smart Settlements</h3>
                <p className="text-gray-600 leading-relaxed">Get optimized payment recommendations to minimize transactions</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow text-white px-8 py-4 text-lg font-display font-semibold shadow-strong transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-3" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          // Modern Trips Grid
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold gradient-text-primary">Your Trips</h2>
              <div className="bg-gradient-secondary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-soft">
                {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          </div>
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
