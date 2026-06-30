import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, MessageSquare } from 'lucide-react';

interface AssignmentFooterProps {
  selectedPersonId: number | undefined;
  setSelectedPersonId: (id: number | undefined) => void;
  selectedBagId: number | undefined;
  setSelectedBagId: (id: number | undefined) => void;
  needsToBuy: boolean;
  setNeedsToBuy: (val: boolean) => void;
  bulkNote: string;
  setIsNoteDialogOpen: (val: boolean) => void;
  onAddItems: () => void;
  isAdding: boolean;
  itemCount: number;
  tripPeople: { id: number; name: string }[];
  tripBags: { id: number; name: string }[];
}

export const AssignmentFooter: React.FC<AssignmentFooterProps> = ({
  selectedPersonId, setSelectedPersonId, selectedBagId, setSelectedBagId,
  needsToBuy, setNeedsToBuy, bulkNote, setIsNoteDialogOpen, onAddItems,
  isAdding, itemCount, tripPeople, tripBags
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50 opacity-100">
    <div className="w-full md:max-w-screen-md mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="font-bold text-sm">Add Person</Label>
          <Select value={String(selectedPersonId || 'unassigned')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
            <SelectTrigger className="bg-secondary text-secondary-foreground border-border"><SelectValue placeholder="Assign Person" /></SelectTrigger>
            <SelectContent className="bg-secondary text-secondary-foreground border-border">
              <SelectItem value="unassigned">Person Unassigned</SelectItem>
              {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="font-bold text-sm">Add Bag</Label>
          <Select value={String(selectedBagId || 'unassigned')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
            <SelectTrigger className="bg-secondary text-secondary-foreground border-border"><SelectValue placeholder="Assign Bag" /></SelectTrigger>
            <SelectContent className="bg-secondary text-secondary-foreground border-border">
              <SelectItem value="unassigned">Bag Unassigned</SelectItem>
              {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="footer-toBuy" checked={needsToBuy} onCheckedChange={(val) => setNeedsToBuy(Boolean(val))} />
            <Label htmlFor="footer-toBuy" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
              <DollarSign className="h-3 w-3" /> To Buy
            </Label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsNoteDialogOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" /> {bulkNote ? 'Edit Note' : 'Add Note'}
          </Button>
        </div>
        <Button size="sm" onClick={onAddItems} disabled={isAdding}>
          {isAdding ? 'Adding...' : `Add Selected (${itemCount}) to Trip`}
        </Button>
      </div>
    </div>
  </div>
);