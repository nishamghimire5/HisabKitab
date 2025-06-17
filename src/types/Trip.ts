
export interface Trip {
  id: string;
  name: string;
  description?: string;
  members: string[];
  expenses: Expense[];
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: PaymentShare[];
  participants: ParticipantShare[];
  date: string;
  category?: string;
  splitType: 'equal' | 'custom';
}

export interface PaymentShare {
  member: string;
  amount: number;
}

export interface ParticipantShare {
  member: string;
  amount: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface MemberBalance {
  name: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}
