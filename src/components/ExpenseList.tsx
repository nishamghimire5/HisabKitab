
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Receipt } from "lucide-react";
import { Trip, Expense } from "@/types/Trip";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { formatCurrency } from "@/utils/currency";

interface ExpenseListProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const ExpenseList = ({ trip, onUpdateTrip }: ExpenseListProps) => {
  const { getDisplayName } = useUserProfiles(trip.members);
  
  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const updatedTrip = {
        ...trip,
        expenses: trip.expenses.filter(expense => expense.id !== expenseId)
      };
      onUpdateTrip(updatedTrip);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };  const formatPayers = (payers: any) => {
    if (Array.isArray(payers)) {
      return payers.map(p => `${getDisplayName(p.member)} (${formatCurrency(p.amount || 0)})`).join(', ');
    } else {
      return payers;
    }
  };  const formatParticipants = (expense: Expense) => {
    if (expense.splitType === 'equal') {
      // For backward compatibility and equal splits
      if (Array.isArray(expense.participants) && expense.participants.length > 0) {
        if (typeof expense.participants[0] === 'string') {
          // Legacy format
          return expense.participants.map(p => `${getDisplayName(p as unknown as string)} (${formatCurrency(expense.amount / expense.participants.length)})`).join(', ');
        } else {
          // New format with equal amounts
          return expense.participants.map((p: any) => `${getDisplayName(p.member)} (${formatCurrency(p.amount || 0)})`).join(', ');
        }
      }
    } else {
      // Custom split
      return expense.participants.map((p: any) => `${getDisplayName(p.member)} (${formatCurrency(p.amount || 0)})`).join(', ');
    }
    return '';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Expenses ({trip.expenses.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>        {trip.expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-display font-semibold text-lg mb-2">No expenses added yet</p>
            <p className="text-sm">Start by adding your first expense!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trip.expenses.map((expense) => (
              <div
                key={expense.id}
                className="border-2 border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/50 hover:from-blue-50/30 hover:to-purple-50/30 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                      <Badge variant="outline" className="text-xs">
                        {expense.splitType === 'equal' ? 'Equal Split' : 'Custom Split'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Paid by <span className="font-medium">{formatPayers(expense.paidBy)}</span> on {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Split among:</span> {formatParticipants(expense)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
