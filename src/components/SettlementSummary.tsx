
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Trip } from "@/types/Trip";
import { calculateMemberBalances } from "@/utils/balanceCalculations";
import { calculateSettlements } from "@/utils/settlementCalculations";
import MemberBalances from "./MemberBalances";
import SettlementRecommendations from "./SettlementRecommendations";
import { useUserProfiles } from "@/hooks/useUserProfiles";

interface SettlementSummaryProps {
  trip: Trip;
}

const SettlementSummary = ({ trip }: SettlementSummaryProps) => {
  const { getDisplayName } = useUserProfiles(trip.members);
  const memberBalances = calculateMemberBalances(trip);
  const settlements = calculateSettlements([...memberBalances]);
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Update member balances with display names
  const memberBalancesWithDisplayNames = memberBalances.map(balance => ({
    ...balance,
    name: getDisplayName(balance.name)
  }));

  // Update settlements with display names
  const settlementsWithDisplayNames = settlements.map(settlement => ({
    ...settlement,
    from: getDisplayName(settlement.from),
    to: getDisplayName(settlement.to)
  }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Settlement Summary
        </CardTitle>
      </CardHeader>      <CardContent className="space-y-6">
        <MemberBalances balances={memberBalancesWithDisplayNames} />
        <SettlementRecommendations settlements={settlementsWithDisplayNames} />

        {/* Summary Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-lg font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Settlements</p>
              <p className="text-lg font-bold">{settlements.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettlementSummary;
