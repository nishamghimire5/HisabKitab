import { Trip, MemberBalance, GuestMember } from "@/types/Trip";

export const calculateMemberBalances = (trip: Trip): MemberBalance[] => {
  const balances: { [member: string]: MemberBalance } = {};

  // Initialize balances for all registered and guest members
  trip.members.forEach(member => {
    balances[member] = {
      name: member,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0
    };
  });
  if (trip.guestMembers) {
    trip.guestMembers.forEach((guest: GuestMember) => {
      balances[guest.id] = {
        name: guest.id,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0
      };
    });
  }

  // Ensure all payers/participants are initialized (in case of missing from members/guestMembers)
  trip.expenses.forEach(expense => {
    if (Array.isArray(expense.paidBy)) {
      expense.paidBy.forEach(payment => {
        if (!balances[payment.member]) {
          balances[payment.member] = {
            name: payment.member,
            totalPaid: 0,
            totalOwed: 0,
            netBalance: 0
          };
        }
      });
    } else if (expense.paidBy && !balances[expense.paidBy as string]) {
      balances[expense.paidBy as string] = {
        name: expense.paidBy as string,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0
      };
    }
    if (Array.isArray(expense.participants)) {
      expense.participants.forEach(participant => {
        const memberId = typeof participant === 'string' ? participant : participant.member;
        if (!balances[memberId]) {
          balances[memberId] = {
            name: memberId,
            totalPaid: 0,
            totalOwed: 0,
            netBalance: 0
          };
        }
      });
    }
  });

  // Calculate total paid by each member
  trip.expenses.forEach(expense => {
    if (Array.isArray(expense.paidBy)) {
      expense.paidBy.forEach(payment => {
        if (balances[payment.member]) {
          balances[payment.member].totalPaid += payment.amount || 0;
        }
      });
    } else {
      // Legacy format backward compatibility
      if (balances[expense.paidBy as string]) {
        balances[expense.paidBy as string].totalPaid += expense.amount;
      }
    }
  });

  // Calculate total owed by each member
  trip.expenses.forEach(expense => {
    if (expense.splitType === 'custom' && Array.isArray(expense.participants)) {
      // Custom split - use actual participant amounts
      expense.participants.forEach(participant => {
        if (typeof participant === 'object' && participant.member && balances[participant.member]) {
          balances[participant.member].totalOwed += participant.amount || 0;
        }
      });
    } else {
      // Equal split or legacy format
      if (Array.isArray(expense.participants)) {
        if (typeof expense.participants[0] === 'string') {
          // Legacy format - equal split among string participants
          const amountPerParticipant = expense.amount / expense.participants.length;
          expense.participants.forEach(participantName => {
            if (typeof participantName === 'string' && balances[participantName]) {
              balances[participantName].totalOwed += amountPerParticipant;
            }
          });
        } else {
          // New format - use participant amounts
          expense.participants.forEach(participant => {
            if (typeof participant === 'object' && participant.member && balances[participant.member]) {
              balances[participant.member].totalOwed += participant.amount || 0;
            }
          });
        }
      }
    }
  });

  // Calculate net balance
  Object.values(balances).forEach(balance => {
    balance.netBalance = balance.totalPaid - balance.totalOwed;
  });

  return Object.values(balances);
};
