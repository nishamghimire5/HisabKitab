
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, DollarSign, Trash2 } from "lucide-react";
import { Trip } from "@/types/Trip";
import { Link } from "react-router-dom";
import { useUserProfiles } from "@/hooks/useUserProfiles";

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
}

const TripCard = ({ trip, onDelete }: TripCardProps) => {
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const createdDate = new Date(trip.createdAt).toLocaleDateString();
  const { getDisplayName } = useUserProfiles(trip.members);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${trip.name}"?`)) {
      onDelete(trip.id);
    }
  };

  return (
    <Link to={`/trip/${trip.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {trip.name}
              </CardTitle>
              {trip.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{trip.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{trip.members.length} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{createdDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-lg">
                  ${totalExpenses.toFixed(2)}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {trip.expenses.length} expense{trip.expenses.length !== 1 ? 's' : ''}
              </Badge>
            </div>            <div className="flex flex-wrap gap-1 pt-2">
              {trip.members.map((member, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {getDisplayName(member)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TripCard;
