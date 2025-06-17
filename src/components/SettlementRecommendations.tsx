
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Settlement } from "@/types/Trip";
import { formatCurrency } from "@/utils/currency";

interface SettlementRecommendationsProps {
  settlements: Settlement[];
}

const SettlementRecommendations = ({ settlements }: SettlementRecommendationsProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-3">Settlement Recommendations</h4>
      {settlements.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>All settled up!</p>
          <p className="text-sm">No payments needed.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {settlements.map((settlement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{settlement.from}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{settlement.to}</span>
              </div>              <Badge className="bg-blue-600 text-white">
                {formatCurrency(settlement.amount)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettlementRecommendations;
