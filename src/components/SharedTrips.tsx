import { Users, Calendar, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Trip } from "@/types/Trip";
import TripCard from "./TripCard";

interface SharedTripsProps {
  myTrips: Trip[];
  onDeleteTrip: (tripId: string) => void;
}

const SharedTrips = ({ myTrips, onDeleteTrip }: SharedTripsProps) => {
  const { user } = useAuth();

  // Separate trips into owned and shared
  const ownedTrips = myTrips.filter(trip => trip.created_by === user?.id);
  const sharedTrips = myTrips.filter(trip => trip.created_by !== user?.id);

  return (
    <div className="w-full">
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Your Trips Overview
          </CardTitle>
        </CardHeader>
        <CardContent>          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="owned" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                My Trips ({ownedTrips.length})
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Shared ({sharedTrips.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="owned" className="mt-4">
              {ownedTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't created any trips yet.</p>
                  <p className="text-sm mt-2">Click "New Trip" to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownedTrips.map((trip) => (
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
              {sharedTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="space-y-2">
                    <p className="font-medium">No shared trips yet</p>
                    <p className="text-sm">
                      When friends invite you to trips or you join existing trips, they'll appear here.
                    </p>
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-medium mb-2">How to get shared trips:</p>
                      <ul className="text-left space-y-1 max-w-md mx-auto">
                        <li>• Accept trip invitations from friends</li>
                        <li>• Ask friends to add you to their existing trips</li>
                        <li>• Create trips and invite friends to collaborate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedTrips.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onDelete={(tripId) => {
                        // For shared trips, we might want different behavior
                        // For now, use the same delete function
                        onDeleteTrip(tripId);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedTrips;
