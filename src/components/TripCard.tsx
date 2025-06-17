
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Banknote, Trash2 } from "lucide-react";
import { Trip } from "@/types/Trip";
import { Link } from "react-router-dom";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { formatCurrency } from "@/utils/currency";

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
  };  return (
    <Link to={`/trip/${trip.id}`}>
      <Card className="group hover:shadow-strong transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] bg-gradient-card border border-white/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-display font-bold text-gray-800 group-hover:gradient-text-primary transition-all duration-300">
                {trip.name}
              </CardTitle>
              {trip.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 font-medium leading-relaxed">{trip.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:scale-110 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
          <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-success rounded-lg flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span>{trip.members.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-warning rounded-lg flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <span>{createdDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-soft">
                  <Banknote className="w-5 h-5 text-white" />
                </div>                <span className="font-display font-bold text-2xl gradient-text-primary">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <Badge variant="secondary" className="bg-gradient-surface text-primary border-0 font-semibold px-3 py-1 rounded-full shadow-sm">
                {trip.expenses.length} expense{trip.expenses.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {trip.members.slice(0, 3).map((member, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white/60 border-gray-200 rounded-full px-2 py-1">
                  {getDisplayName(member)}
                </Badge>
              ))}
              {trip.members.length > 3 && (
                <Badge variant="outline" className="text-xs bg-white/60 border-gray-200 rounded-full px-2 py-1">
                  +{trip.members.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TripCard;
