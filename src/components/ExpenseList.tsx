
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Receipt } from "lucide-react";
import { Trip, Expense } from "@/types/Trip";

interface ExpenseListProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const ExpenseList = ({ trip, onUpdateTrip }: ExpenseListProps) => {
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
  };

  const formatPayers = (payers: any) => {
    if (Array.isArray(payers)) {
      return payers.map(p => `${p.member} ($${(p.amount || 0).toFixed(2)})`).join(', ');
    } else {
      return payers;
    }
  };

  const formatParticipants = (expense: Expense) => {
    if (expense.splitType === 'equal') {
      // For backward compatibility and equal splits
      if (Array.isArray(expense.participants) && expense.participants.length > 0) {
        if (typeof expense.participants[0] === 'string') {
          // Legacy format
          return expense.participants.map(p => `${p} ($${(expense.amount / expense.participants.length).toFixed(2)})`).join(', ');
        } else {
          // New format with equal amounts
          return expense.participants.map(p => `${p.member} ($${(p.amount || 0).toFixed(2)})`).join(', ');
        }
      }
    } else {
      // Custom split
      return expense.participants.map(p => `${p.member} ($${(p.amount || 0).toFixed(2)})`).join(', ');
    }
    return '';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Expenses ({trip.expenses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trip.expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No expenses added yet</p>
            <p className="text-sm">Start by adding your first expense!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trip.expenses.map((expense) => (
              <div
                key={expense.id}
                className="border rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors"
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
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      ${expense.amount.toFixed(2)}
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
