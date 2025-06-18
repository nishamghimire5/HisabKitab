import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trip, Expense, PaymentShare, ParticipantShare, GuestMember } from "@/types/Trip";
import { Trash2, Plus, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/currency";
import { Separator } from "@/components/ui/separator";
import GuestMemberManager from "./GuestMemberManager";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const AddExpenseModal = ({ open, onOpenChange, trip, onUpdateTrip }: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [payers, setPayers] = useState<PaymentShare[]>([{ member: "", amount: 0 }]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [equalParticipants, setEqualParticipants] = useState<string[]>([]);
  const [customParticipants, setCustomParticipants] = useState<ParticipantShare[]>([]);
  const [showQuickPaid, setShowQuickPaid] = useState(false);  // Local state for managing guest members within the modal
  const [localTrip, setLocalTrip] = useState<Trip>(trip);
  
  // Reset local trip only when modal closes and reopens
  useEffect(() => {
    if (open) {
      // Only reset when opening modal
      setLocalTrip(trip);
    }
  }, [open]); // Remove trip from dependencies to prevent resets during guest additions
  
  // Get all available members (registered + guests)
  const getAllMembers = () => {
    const registeredMembers = localTrip.members.map(email => ({ id: email, name: email, isGuest: false }));
    const guestMembers = (localTrip.guestMembers || []).map(guest => ({ id: guest.id, name: guest.name, isGuest: true }));
    return [...registeredMembers, ...guestMembers];
  };

  const allMembers = getAllMembers();  // Initialize custom participants to include all members - only when modal opens
  useEffect(() => {
    if (open) {
      const currentMembers = getAllMembers();
      const initialParticipants = currentMembers.map(member => ({ 
        member: member.id, 
        amount: 0, 
        isGuest: member.isGuest 
      }));
      setCustomParticipants(initialParticipants);
    }
  }, [open]); // Only depend on modal open state

  // Quick "Paid by One, Split to All" function
  const handleQuickPaidByOne = (payer: string) => {
    if (!totalAmount) {
      alert("Please enter the total amount first.");
      return;
    }
    
    const amount = parseFloat(totalAmount);
    const payerMember = allMembers.find(m => m.id === payer);
    
    // Set the payer
    setPayers([{ member: payer, amount: amount, isGuest: payerMember?.isGuest }]);
    
    // Set equal split for all members
    setSplitType('equal');
    setEqualParticipants(allMembers.map(m => m.id));
    
    // Hide the quick options and show success feedback
    setShowQuickPaid(false);
  };

  // Helper function to get display name for a member
  const getDisplayName = (memberId: string) => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return memberId;
    
    if (member.isGuest) {
      return member.name;
    } else {
      // For registered users, show email for now (could be enhanced with profiles)
      return member.name.split('@')[0];    }
  };  // Guest member management handlers
  const handleAddGuest = (guest: GuestMember) => {
    // Only update local state, don't propagate to parent until expense is saved
    const updatedTrip = {
      ...localTrip,
      guestMembers: [...(localTrip.guestMembers || []), guest]
    };
    setLocalTrip(updatedTrip);
    
    // Add the new guest to custom participants without resetting others
    setCustomParticipants(prev => [
      ...prev,
      { member: guest.id, amount: 0, isGuest: true }
    ]);
  };

  const handleRemoveGuest = (guestId: string) => {
    // Only update local state, don't propagate to parent until expense is saved
    const updatedTrip = {
      ...localTrip,
      guestMembers: (localTrip.guestMembers || []).filter(guest => guest.id !== guestId)
    };
    setLocalTrip(updatedTrip);
    
    // Remove the guest from custom participants
    setCustomParticipants(prev => 
      prev.filter(p => p.member !== guestId)
    );
  };

  // Check if quick setup was used
  const isQuickSetup = payers.length === 1 && 
                      payers[0].amount === parseFloat(totalAmount || "0") && 
                      splitType === 'equal' && 
                      equalParticipants.length === allMembers.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !totalAmount) {
      alert("Please fill in description and total amount.");
      return;
    }

    const validPayers = payers.filter(p => p.member && p.amount > 0);
    if (validPayers.length === 0) {
      alert("Please select at least one person who paid and enter a valid amount.");
      return;
    }

    const totalPaid = validPayers.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - parseFloat(totalAmount)) > 0.01) {
      alert(`The amounts paid (${totalPaid.toFixed(2)}) don't match the total expense (${totalAmount}). Please adjust the individual amounts.`);
      return;
    }

    let participants: ParticipantShare[] = [];
    let totalSplit = 0;

    if (splitType === 'equal') {
      if (equalParticipants.length === 0) {
        alert("Please select at least one participant for equal split.");
        return;      }
      const amountPerPerson = parseFloat(totalAmount) / equalParticipants.length;
      participants = equalParticipants.map(memberId => {
        const member = allMembers.find(m => m.id === memberId);
        return {
          member: memberId,
          amount: amountPerPerson,
          isGuest: member?.isGuest
        };
      });
      totalSplit = parseFloat(totalAmount);
    } else {
      const validCustomParticipants = customParticipants.filter(p => p.amount > 0);
      if (validCustomParticipants.length === 0) {
        alert("Please enter amounts for at least one participant in custom split.");
        return;
      }
      participants = validCustomParticipants;
      totalSplit = validCustomParticipants.reduce((sum, p) => sum + p.amount, 0);
      
      if (Math.abs(totalSplit - parseFloat(totalAmount)) > 0.01) {
        alert(`The split amounts (${totalSplit.toFixed(2)}) don't match the total expense (${totalAmount}). Please adjust the amounts.`);
        return;
      }
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(totalAmount),
      paidBy: validPayers,
      participants: participants,
      date: new Date().toISOString(),
      splitType: splitType
    };    const updatedTrip = {
      ...localTrip, // Use localTrip to include any guest members added
      expenses: [...localTrip.expenses, newExpense]
    };    onUpdateTrip(updatedTrip);
    
    // Reset form
    setDescription("");
    setTotalAmount("");
    setPayers([{ member: "", amount: 0 }]);
    setSplitType('equal');
    setEqualParticipants([]);
    // Don't reset customParticipants here since it will be reset when modal reopens
    onOpenChange(false);
  };

  const handleEqualParticipantToggle = (member: string, checked: boolean) => {
    if (checked) {
      setEqualParticipants([...equalParticipants, member]);
    } else {
      setEqualParticipants(equalParticipants.filter(p => p !== member));
    }
  };
  const handleSelectAllEqual = () => {
    if (equalParticipants.length === allMembers.length) {
      setEqualParticipants([]);
    } else {
      setEqualParticipants(allMembers.map(m => m.id));
    }
  };

  const addPayer = () => {
    setPayers([...payers, { member: "", amount: 0 }]);
  };

  const removePayer = (index: number) => {
    if (payers.length > 1) {
      setPayers(payers.filter((_, i) => i !== index));
    }
  };
  const updatePayer = (index: number, field: 'member' | 'amount', value: string | number) => {
    const updatedPayers = [...payers];
    if (field === 'member') {
      updatedPayers[index].member = value as string;
      // Set the isGuest flag based on the selected member
      const selectedMember = allMembers.find(m => m.id === value);
      updatedPayers[index].isGuest = selectedMember?.isGuest;
    } else {
      updatedPayers[index].amount = parseFloat(value as string) || 0;
    }
    setPayers(updatedPayers);
  };
  const updateCustomParticipant = (member: string, amount: number) => {
    setCustomParticipants(prev => 
      prev.map(p => p.member === member ? { ...p, amount } : p)
    );
  };

  const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
  const remaining = parseFloat(totalAmount || "0") - totalPaid;
  const customSplitTotal = customParticipants.reduce((sum, p) => sum + p.amount, 0);
  const customRemaining = parseFloat(totalAmount || "0") - customSplitTotal;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">What was it for?</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner, Hotel, Groceries"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (NPR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>          {/* Quick "Paid by One, Split to All" Options */}
          {totalAmount && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Quick Setup: One Person Paid, Split Equally</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowQuickPaid(!showQuickPaid)}
                  className="text-blue-600 hover:text-blue-800 self-start sm:self-auto"
                >
                  {showQuickPaid ? 'Hide' : 'Show'} Quick Options
                </Button>
              </div>
              
              {showQuickPaid && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Click on who paid the full amount. Everyone will be included in equal split automatically.
                  </p>                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allMembers.map((member) => (
                      <Button
                        key={member.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPaidByOne(member.id)}
                        className="justify-start hover:bg-blue-100 hover:border-blue-300 transition-all text-xs sm:text-sm truncate"
                        title={`${getDisplayName(member.id)} paid ${formatCurrency(parseFloat(totalAmount))}`}
                      >
                        <span className="truncate">
                          {getDisplayName(member.id)} {member.isGuest ? "(Guest)" : ""} paid {formatCurrency(parseFloat(totalAmount))}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}          {/* Quick Setup Success Indicator */}
          {isQuickSetup && totalAmount && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-start sm:items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1 sm:mt-0 flex-shrink-0"></div>                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  Quick Setup: {getDisplayName(payers[0]?.member)} paid {formatCurrency(parseFloat(totalAmount))}, split equally among {allMembers.length} members ({formatCurrency(parseFloat(totalAmount) / allMembers.length)} each)
                </span>
              </div>
            </div>
          )}          {/* Who Paid Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label>Who paid?</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPayer}>
                <Plus className="w-3 h-3 mr-1" />
                Add Payer
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Person</TableHead>
                    <TableHead className="min-w-[100px]">Amount Paid</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payers.map((payer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <select
                          value={payer.member}
                          onChange={(e) => updatePayer(index, 'member', e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm"
                          required                        >
                          <option value="">Select who paid</option>
                          {allMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {getDisplayName(member.id)} {member.isGuest ? "(Guest)" : ""}
                            </option>
                          ))}
                        </select></TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={payer.amount || ""}
                          onChange={(e) => updatePayer(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          required
                          className="text-xs sm:text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        {payers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePayer(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalAmount && (
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className={totalPaid === parseFloat(totalAmount) ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                {remaining !== 0 && (
                  <div className="flex justify-between">
                    <span>Remaining to pay:</span>
                    <span className="text-red-600">{formatCurrency(remaining)}</span>
                  </div>
                )}
              </div>
            )}
          </div>          {/* Split Type Selection */}
          <div className="space-y-3">
            <Label>How should this be split?</Label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={() => setSplitType('equal')}
                  className="text-blue-600"
                />
                <span className="text-sm">Split Equally</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={() => setSplitType('custom')}
                  className="text-blue-600"
                />
                <span className="text-sm">Custom Split</span>
              </label>
            </div>
          </div>

          {/* Guest Member Management */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 sm:p-4 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs sm:text-sm font-semibold text-orange-700">Add Temporary Members</h3>
            </div>
            <p className="text-xs text-orange-600 mb-3">
              Need to include someone who doesn't have an account? Add them here temporarily.
            </p>
            <GuestMemberManager
              guestMembers={localTrip.guestMembers || []}
              onAddGuest={handleAddGuest}
              onRemoveGuest={handleRemoveGuest}
            />
          </div>

          {/* Equal Split */}
          {splitType === 'equal' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label>Who should split this expense equally?</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllEqual}
                  className="self-start sm:self-auto"                >
                  {equalParticipants.length === allMembers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equal-${member.id}`}
                      checked={equalParticipants.includes(member.id)}
                      onCheckedChange={(checked) => handleEqualParticipantToggle(member.id, checked as boolean)}
                    />
                    <Label htmlFor={`equal-${member.id}`} className="text-xs sm:text-sm truncate" title={getDisplayName(member.id)}>
                      {getDisplayName(member.id)} {member.isGuest ? "(Guest)" : ""}
                    </Label>
                  </div>
                ))}
              </div>
              
              {equalParticipants.length > 0 && totalAmount && (
                <div className="text-xs sm:text-sm bg-blue-50 p-2 rounded">
                  Split among {equalParticipants.length} member{equalParticipants.length !== 1 ? 's' : ''}: {formatCurrency(parseFloat(totalAmount || "0") / equalParticipants.length)} each
                </div>
              )}
            </div>
          )}          {/* Custom Split */}
          {splitType === 'custom' && (
            <div className="space-y-3">
              <Label>Enter custom amounts for each person:</Label>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Person</TableHead>
                      <TableHead className="min-w-[100px]">Amount Owed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customParticipants.map((participant) => (
                      <TableRow key={participant.member}>                        <TableCell className="font-medium">
                          <span className="text-xs sm:text-sm truncate block" title={getDisplayName(participant.member)}>
                            {getDisplayName(participant.member)} {participant.isGuest ? "(Guest)" : ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={participant.amount || ""}
                            onChange={(e) => updateCustomParticipant(participant.member, parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-xs sm:text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalAmount && (
                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Total Split:</span>
                    <span className={customSplitTotal === parseFloat(totalAmount) ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(customSplitTotal)}
                    </span>
                  </div>
                  {customRemaining !== 0 && (
                    <div className="flex justify-between">
                      <span>Remaining to split:</span>
                      <span className="text-red-600">{formatCurrency(customRemaining)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white order-1 sm:order-2"
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
