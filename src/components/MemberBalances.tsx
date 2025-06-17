
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { MemberBalance } from "@/types/Trip";

interface MemberBalancesProps {
  balances: MemberBalance[];
}

const MemberBalances = ({ balances }: MemberBalancesProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Member Balances
      </h4>
      <div className="space-y-2">
        {balances.map((balance) => (
          <div key={balance.name} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div>
              <span className="font-medium">{balance.name}</span>
              <div className="text-xs text-gray-600">
                Paid: ${balance.totalPaid.toFixed(2)} | Owes: ${balance.totalOwed.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              {balance.netBalance > 0.01 ? (
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Gets ${balance.netBalance.toFixed(2)}
                </Badge>
              ) : balance.netBalance < -0.01 ? (
                <Badge variant="secondary" className="bg-red-50 text-red-700">
                  Owes ${Math.abs(balance.netBalance).toFixed(2)}
                </Badge>
              ) : (
                <Badge variant="outline">
                  Even
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberBalances;
