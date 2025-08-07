import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { Category, CatalogItem, Person, Bag } from '@/types';

interface ItemSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  items: CatalogItem[];
  people: Person[];
  bags: Bag[];
  onAddSingleItem: (bagId: number | undefined, personId: number | undefined, catalogItem: CatalogItem, quantity: number, notes?: string, isToBuy?: boolean) => Promise<void>;
  onAddMultipleItems: (bagId: number | undefined, personId: number | undefined, itemsToAdd: { catalogItemId: number; quantity: number; notes?: string; isToBuy?: boolean }[]) => Promise<void>;
  preselectedPersonId?: string;
  preselectedBagId?: string;
}

export const ItemSelectionDialog: React.FC<ItemSelectionDialogProps> = ({
  open,
  onOpenChange,
  categories,
  items: catalogItems,
  people,
  bags,
  onAddSingleItem,
  preselectedPersonId,
  preselectedBagId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(preselectedPersonId ? Number(preselectedPersonId) : undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(preselectedBagId ? Number(preselectedBagId) : undefined);
  const [quantity, setQuantity] = useState(1);
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedPersonId(preselectedPersonId ? Number(preselectedPersonId) : undefined);
      setSelectedBagId(preselectedBagId ? Number(preselectedBagId) : undefined);
      setSelectedItemId(null);
      setSearchTerm('');
      setSelectedCategoryId('');
      setQuantity(1);
      setNeedsToBuy(false);
    }
  }, [open, preselectedPersonId, preselectedBagId]);

  const filteredItems = useMemo(() => {
    let filtered = catalogItems;
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.categoryId === Number(selectedCategoryId));
    }
    return filtered;
  }, [catalogItems, searchTerm, selectedCategoryId]);

  const handleAddItem = async () => {
    if (!selectedItemId) return;
    const catalogItem = catalogItems.find(item => item.id === selectedItemId);
    if (!catalogItem) return;

    setIsAdding(true);
    await onAddSingleItem(
      selectedBagId,
      selectedPersonId,
      catalogItem,
      quantity,
      undefined, 
      needsToBuy
    );
    setIsAdding(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Item to Packing List</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategoryId} onValueChange={(val) => setSelectedCategoryId(val === 'all' ? '' : val)}>
            <SelectTrigger><SelectValue placeholder="Filter by category..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Label>Select Item ({filteredItems.length} found)</Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-colors ${selectedItemId === item.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-medium">{item.name}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedItemId && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Assignment (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assign to Person</Label>
                  <Select value={String(selectedPersonId || '')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {people.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assign to Bag</Label>
                  <Select value={String(selectedBagId || '')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {bags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox id="needsToBuy" checked={needsToBuy} onCheckedChange={(checked) => setNeedsToBuy(Boolean(checked))} />
                  <Label htmlFor="needsToBuy">Need to buy</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAddItem} disabled={!selectedItemId || isAdding}>
            {isAdding ? 'Adding...' : 'Add to Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectionDialog;