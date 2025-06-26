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
  const { getDisplayName } = useUserProfiles(trip.members, trip.guestMembers);
  
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
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleDateString()}`;
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleDateString()}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatPayers = (payers: any) => {
    if (Array.isArray(payers)) {
      return payers.map(p => `${getDisplayName(p.member)} (${formatCurrency(p.amount || 0)})`).join(', ');
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
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Expenses ({trip.expenses.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trip.expenses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
              <Receipt className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-display font-semibold text-xl mb-3 text-gray-700">No expenses added yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Start tracking your group expenses by adding your first expense. Click the "Add Expense" button to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-6">
              {trip.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-white via-slate-50/30 to-gray-50/50 hover:from-blue-50/40 hover:via-purple-50/20 hover:to-indigo-50/40 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 relative overflow-hidden"
                >
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent pointer-events-none"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header - Description and Amount */}
                    <div className="flex flex-col gap-3 mb-4">
                      {/* Description and Badge Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h4 className="font-semibold text-gray-800 text-lg sm:text-xl flex-1 min-w-0">
                          {expense.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              expense.splitType === 'equal' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {expense.splitType === 'equal' ? 'Equal Split' : 'Custom Split'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Amount and Actions Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-green-600">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-sm text-gray-500 hidden sm:inline">
                            total expense
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="hover:bg-red-50 hover:text-red-600 flex-shrink-0 transition-colors duration-200"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Payment Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/80 rounded-lg p-4 mb-4 border border-blue-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-semibold text-blue-800 text-sm">Payment Details</span>
                      </div>
                      <div className="ml-8">
                        <div className="text-sm text-blue-700 font-medium mb-1">
                          Paid by: <span className="font-semibold">{formatPayers(expense.paidBy)}</span>
                        </div>
                        <div className="text-xs text-blue-600 bg-white/40 inline-block px-2 py-1 rounded">
                          {formatDate(expense.date)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Split Info */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100/80 rounded-lg p-4 border border-green-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-semibold text-green-800 text-sm">Split Breakdown</span>
                      </div>
                      <div className="ml-8">
                        {expense.splitType === 'equal' ? (
                          <div className="space-y-2">
                            {expense.participants.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {expense.participants.map((participant: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2 shadow-sm border border-green-200/30">
                                    <span className="text-sm text-green-800 font-medium truncate flex-1 mr-2">
                                      {getDisplayName(typeof participant === 'string' ? participant : participant.member)}
                                    </span>
                                    <span className="font-bold text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">
                                      {formatCurrency(typeof participant === 'string' ? expense.amount / expense.participants.length : participant.amount || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-green-600 mt-2 text-center bg-white/40 py-1 rounded">
                              Split equally among {expense.participants.length} member{expense.participants.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {expense.participants.map((participant: any, index: number) => (
                                <div key={index} className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2 shadow-sm border border-green-200/30">
                                  <span className="text-sm text-green-800 font-medium truncate flex-1 mr-2">
                                    {getDisplayName(participant.member)}
                                  </span>
                                  <span className="font-bold text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">
                                    {formatCurrency(participant.amount || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-green-600 mt-2 text-center bg-white/40 py-1 rounded">
                              Custom split amounts
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Expenses Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Total Expenses</p>
                      <p className="text-xs text-indigo-600">{trip.expenses.length} expense{trip.expenses.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(trip.expenses.reduce((total, expense) => total + expense.amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
