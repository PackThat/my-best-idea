import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, Person, Bag } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

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
  const { updateCatalogItem } = useAppContext();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [personId, setPersonId] = useState<number | undefined>(item.personId);
  const [bagId, setBagId] = useState<number | undefined>(item.bagId);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setPersonId(item.personId);
      setBagId(item.bagId);
    }
  }, [item]);

  const handleSave = async () => {
    // 1. Update the name in the Master Catalog so it's fixed universally
    if (item.catalogItemId) {
      await updateCatalogItem(item.catalogItemId, { name: name.trim() });
    }

    // 2. Save the trip-specific changes (including the new name)
    onSave(item.id, { 
      name: name.trim(), 
      quantity, 
      personId, 
      bagId 
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Changes to the name will update your Master Catalog universally.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          
          {/* 1. Item Name Field (Universally Synced) */}
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Name</Label>
            <Input 
              id="item-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border focus:ring-ring"
              placeholder="e.g. iPhone Lead"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Quantity Selector */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} 
                  className="h-9 w-full text-center bg-background border-border" 
                />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Placeholder for visual balance if needed, or leave as grid */}
            <div className="flex items-end pb-1">
                <p className="text-[10px] text-muted-foreground italic leading-tight">Adjust how many you need for this trip.</p>
            </div>
          </div>
          
          {/* 3. Assignment Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="person" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Person</Label>
              <Select value={String(personId || 'unassigned')} onValueChange={(val) => setPersonId(val === 'unassigned' ? undefined : Number(val))}>
                <SelectTrigger id="person" className="bg-background border-border"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bag" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Bag</Label>
              <Select value={String(bagId || 'unassigned')} onValueChange={(val) => setBagId(val === 'unassigned' ? undefined : Number(val))}>
                <SelectTrigger id="bag" className="bg-background border-border"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-2 pt-4">
          <Button variant="outline" className="flex-1 border-border" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1 shadow-sm" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripItemDialog;