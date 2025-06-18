
export interface Trip {
  id: string;
  name: string;
  description?: string;
  members: string[];
  guestMembers?: GuestMember[]; // Temporary members without accounts
  expenses: Expense[];
  createdAt: string;
  created_by?: string;
  initialFriends?: string[]; // For friend selection during trip creation
}

export interface GuestMember {
  id: string; // Temporary ID for guest
  name: string; // Display name for the guest
  isGuest: true; // Flag to identify guest members
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
  member: string; // Can be email for registered users or guest ID for guests
  amount: number;
  isGuest?: boolean; // Flag to identify if this is a guest payment
}

export interface ParticipantShare {
  member: string; // Can be email for registered users or guest ID for guests
  amount: number;
  isGuest?: boolean; // Flag to identify if this is a guest participant
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
