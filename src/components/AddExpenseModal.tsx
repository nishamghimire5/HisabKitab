
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trip, Expense, PaymentShare, ParticipantShare } from "@/types/Trip";
import { Trash2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [customParticipants, setCustomParticipants] = useState<ParticipantShare[]>(
    trip.members.map(member => ({ member, amount: 0 }))
  );

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
        return;
      }
      const amountPerPerson = parseFloat(totalAmount) / equalParticipants.length;
      participants = equalParticipants.map(member => ({
        member,
        amount: amountPerPerson
      }));
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
    };

    const updatedTrip = {
      ...trip,
      expenses: [...trip.expenses, newExpense]
    };

    onUpdateTrip(updatedTrip);

    // Reset form
    setDescription("");
    setTotalAmount("");
    setPayers([{ member: "", amount: 0 }]);
    setSplitType('equal');
    setEqualParticipants([]);
    setCustomParticipants(trip.members.map(member => ({ member, amount: 0 })));
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
    if (equalParticipants.length === trip.members.length) {
      setEqualParticipants([]);
    } else {
      setEqualParticipants([...trip.members]);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="amount">Total Amount ($)</Label>
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
          </div>

          {/* Who Paid Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Who paid?</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPayer}>
                <Plus className="w-3 h-3 mr-1" />
                Add Payer
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Amount Paid</TableHead>
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
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        required
                      >
                        <option value="">Select who paid</option>
                        {trip.members.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={payer.amount || ""}
                        onChange={(e) => updatePayer(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        required
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
            
            {totalAmount && (
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className={totalPaid === parseFloat(totalAmount) ? "text-green-600" : "text-red-600"}>
                    ${totalPaid.toFixed(2)}
                  </span>
                </div>
                {remaining !== 0 && (
                  <div className="flex justify-between">
                    <span>Remaining to pay:</span>
                    <span className="text-red-600">${remaining.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Split Type Selection */}
          <div className="space-y-3">
            <Label>How should this be split?</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={() => setSplitType('equal')}
                  className="text-blue-600"
                />
                <span>Split Equally</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={() => setSplitType('custom')}
                  className="text-blue-600"
                />
                <span>Custom Split</span>
              </label>
            </div>
          </div>

          {/* Equal Split */}
          {splitType === 'equal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Who should split this expense equally?</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllEqual}
                >
                  {equalParticipants.length === trip.members.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {trip.members.map((member) => (
                  <div key={member} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equal-${member}`}
                      checked={equalParticipants.includes(member)}
                      onCheckedChange={(checked) => handleEqualParticipantToggle(member, checked as boolean)}
                    />
                    <Label htmlFor={`equal-${member}`} className="text-sm">
                      {member}
                    </Label>
                  </div>
                ))}
              </div>
              
              {equalParticipants.length > 0 && totalAmount && (
                <div className="text-sm bg-blue-50 p-2 rounded">
                  Split among {equalParticipants.length} member{equalParticipants.length !== 1 ? 's' : ''}: ${(parseFloat(totalAmount || "0") / equalParticipants.length).toFixed(2)} each
                </div>
              )}
            </div>
          )}

          {/* Custom Split */}
          {splitType === 'custom' && (
            <div className="space-y-3">
              <Label>Enter custom amounts for each person:</Label>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Amount Owed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customParticipants.map((participant) => (
                    <TableRow key={participant.member}>
                      <TableCell className="font-medium">
                        {participant.member}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={participant.amount || ""}
                          onChange={(e) => updateCustomParticipant(participant.member, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalAmount && (
                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Total Split:</span>
                    <span className={customSplitTotal === parseFloat(totalAmount) ? "text-green-600" : "text-red-600"}>
                      ${customSplitTotal.toFixed(2)}
                    </span>
                  </div>
                  {customRemaining !== 0 && (
                    <div className="flex justify-between">
                      <span>Remaining to split:</span>
                      <span className="text-red-600">${customRemaining.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
