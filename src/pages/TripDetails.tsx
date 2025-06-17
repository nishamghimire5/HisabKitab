import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Users, Calculator, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trip } from "@/types/Trip";
import AddExpenseModal from "@/components/AddExpenseModal";
import ExpenseList from "@/components/ExpenseList";
import SettlementSummary from "@/components/SettlementSummary";
import UserMenu from "@/components/UserMenu";
import TripMemberManagement from "@/components/TripMemberManagement";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { toast } from "sonner";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const { user } = useAuth();
  const { getDisplayName } = useUserProfiles(trip?.members || []);
  useEffect(() => {
    const loadTrip = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }

      try {
        // Load trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();

        if (tripError) {
          console.error('Error loading trip:', tripError);
          toast.error('Failed to load trip details');
          setTrip(null);
          setLoading(false);
          return;
        }

        // Load expenses for this trip
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('trip_id', id)
          .order('created_at', { ascending: false });

        if (expensesError) {
          console.error('Error loading expenses:', expensesError);
          // Continue without expenses if there's an error loading them
        }        // Convert Supabase data to Trip format
        const tripWithExpenses: Trip = {
          id: tripData.id,
          name: tripData.name,
          description: tripData.description || '',
          members: tripData.members || [],
          created_by: tripData.created_by,
          expenses: expensesData ? expensesData.map(expense => ({
            id: expense.id,
            description: expense.description,
            amount: Number(expense.amount),
            paidBy: (expense.paid_by as any[]) || [],
            participants: (expense.participants as any[]) || [],
            date: expense.date,
            category: expense.category || '',
            splitType: (expense.split_type as 'equal' | 'custom') || 'equal'
          })) : [],
          createdAt: tripData.created_at
        };
        
        setTrip(tripWithExpenses);
      } catch (error) {
        console.error('Error loading trip:', error);
        toast.error('Failed to load trip details');
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id, user]);
  const updateTrip = async (updatedTrip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')        .update({
          name: updatedTrip.name,
          description: updatedTrip.description,
          members: updatedTrip.members,
          created_by: updatedTrip.created_by
        })
        .eq('id', updatedTrip.id);

      if (error) {
        console.error('Error updating trip:', error);
        toast.error('Failed to update trip');
      } else {
        setTrip(updatedTrip);
        toast.success('Trip updated successfully');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip');
    }
  };

  const addExpense = async (updatedTrip: Trip) => {
    try {
      // Get the new expense (last one added)
      const newExpense = updatedTrip.expenses[updatedTrip.expenses.length - 1];      // Save expense to Supabase
      const { error } = await supabase
        .from('expenses')
        .insert({
          trip_id: updatedTrip.id,
          description: newExpense.description,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy as any,
          participants: newExpense.participants as any,
          date: newExpense.date,
          category: newExpense.category || '',
          split_type: newExpense.splitType
        });

      if (error) {
        console.error('Error saving expense:', error);
        toast.error('Failed to save expense');
        return;
      }

      // Update local state
      setTrip(updatedTrip);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Trip not found</h1>
          <p className="text-gray-600 mb-4">This trip doesn't exist or you don't have access to it.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{trip.name}</h1>
                {trip.description && (
                  <p className="text-sm text-gray-600">{trip.description}</p>
                )}
              </div>
            </div>            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsMemberManagementOpen(true)}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </Button>
              <Button 
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-xl font-bold text-gray-800">{trip.expenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-xl font-bold text-gray-800">{trip.members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Trip Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">              {trip.members.map((member, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                  {getDisplayName(member)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ExpenseList trip={trip} onUpdateTrip={updateTrip} />
          </div>
          <div>
            <SettlementSummary trip={trip} />
          </div>
        </div>
      </div>      <AddExpenseModal 
        open={isAddExpenseModalOpen}
        onOpenChange={setIsAddExpenseModalOpen}
        trip={trip}
        onUpdateTrip={addExpense}
      />
      
      <TripMemberManagement
        open={isMemberManagementOpen}
        onOpenChange={setIsMemberManagementOpen}
        trip={trip}
        onUpdateTrip={updateTrip}
      />
    </div>
  );
};

export default TripDetails;
