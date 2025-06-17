
import { MemberBalance, Settlement } from "@/types/Trip";

export const calculateSettlements = (balances: MemberBalance[]): Settlement[] => {
  const settlements: Settlement[] = [];
  const creditors = balances.filter(b => b.netBalance > 0.01).sort((a, b) => b.netBalance - a.netBalance);
  const debtors = balances.filter(b => b.netBalance < -0.01).sort((a, b) => a.netBalance - b.netBalance);

  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.netBalance, -debtor.netBalance);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100
      });
      
      creditor.netBalance -= amount;
      debtor.netBalance += amount;
    }
    
    if (creditor.netBalance < 0.01) i++;
    if (debtor.netBalance > -0.01) j++;
  }
  
  return settlements;
};
