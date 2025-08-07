import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, Person, Bag } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface EditTripItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  tripPeople: Person[];
  tripBags: Bag[];
  onSave: (itemId: string, updates: Partial<Item>) => void;
}

export const EditTripItemDialog: React.FC<EditTripItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  tripPeople,
  tripBags,
  onSave,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [personId, setPersonId] = useState<number | undefined>(item.personId);
  const [bagId, setBagId] = useState<number | undefined>(item.bagId);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setPersonId(item.personId);
      setBagId(item.bagId);
    }
  }, [item]);

  const handleSave = () => {
    onSave(item.id, { quantity, personId, bagId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit: {item.name}</DialogTitle>
          <DialogDescription>
            Update the quantity or re-assign this item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} className="h-8 w-16 text-center" />
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="person">Assign to Person</Label>
            <Select value={String(personId || 'unassigned')} onValueChange={(val) => setPersonId(val === 'unassigned' ? undefined : Number(val))}>
              <SelectTrigger id="person"><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bag">Assign to Bag</Label>
            <Select value={String(bagId || 'unassigned')} onValueChange={(val) => setBagId(val === 'unassigned' ? undefined : Number(val))}>
              <SelectTrigger id="bag"><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripItemDialog;