import { useState, useEffect } from "react";
import { Users, Calendar, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Trip } from "@/types/Trip";
import TripCard from "./TripCard";

interface SharedTripsProps {
  myTrips: Trip[];
  onDeleteTrip: (tripId: string) => void;
}

const SharedTrips = ({ myTrips, onDeleteTrip }: SharedTripsProps) => {
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadSharedTrips();
  }, [user]);

  const loadSharedTrips = async () => {
    if (!user) return;
    
    try {
      // For now, we'll show shared trips as empty since we need the database migration first
      // This will be populated after applying the migration in Supabase
      setSharedTrips([]);
    } catch (error) {
      console.error('Error loading shared trips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Your Trips Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="owned" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                My Trips ({myTrips.length})
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Shared ({sharedTrips.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="owned" className="mt-4">
              {myTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't created any trips yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTrips.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onDelete={onDeleteTrip}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <div className="space-y-2">
                  <p className="font-medium">Collaborative features coming soon!</p>
                  <p className="text-sm">
                    After applying the database migration, you'll be able to:
                  </p>
                  <ul className="text-sm space-y-1 mt-3">
                    <li>• Invite friends to trips by username or email</li>
                    <li>• View trips shared with you</li>
                    <li>• Accept or decline trip invitations</li>
                    <li>• Collaborate on expense tracking</li>
                  </ul>
                  <Badge variant="secondary" className="mt-3">
                    Database migration required
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedTrips;
