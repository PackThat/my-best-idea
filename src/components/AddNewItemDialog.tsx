import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Category, Subcategory, Person, Bag } from '@/types';

interface AddNewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  people?: Person[];
  bags?: Bag[];
  onAddItem: (itemData: { 
    name: string; 
    categoryId: string; 
    subcategoryId?: string;
    personId?: number;
    bagId?: number;
    isToBuy?: boolean;
  }) => void;
  initialName?: string;
  preselectedCategoryId?: string;
  preselectedSubcategoryId?: string;
  defaultPersonId?: number;
  defaultBagId?: number;
  defaultIsToBuy?: boolean;
}

export const AddNewItemDialog: React.FC<AddNewItemDialogProps> = ({
  open,
  onOpenChange,
  categories,
  subcategories,
  people,
  bags,
  onAddItem,
  initialName,
  preselectedCategoryId,
  preselectedSubcategoryId,
  defaultPersonId,
  defaultBagId,
  defaultIsToBuy,
}) => {
  const [name, setName] = useState(initialName || '');
  const [selectedCatId, setSelectedCatId] = useState(preselectedCategoryId || '');
  const [selectedSubCatId, setSelectedSubCatId] = useState(preselectedSubcategoryId || '');
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(defaultPersonId);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(defaultBagId);
  const [isToBuy, setIsToBuy] = useState(defaultIsToBuy || false);

  useEffect(() => {
    if (open) {
      setName(initialName || '');
      setSelectedCatId(preselectedCategoryId || '');
      setSelectedSubCatId(preselectedSubcategoryId || '');
      setSelectedPersonId(defaultPersonId);
      setSelectedBagId(defaultBagId);
      setIsToBuy(defaultIsToBuy || false);
    }
  }, [open, initialName, preselectedCategoryId, preselectedSubcategoryId, defaultPersonId, defaultBagId, defaultIsToBuy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedCatId) return;

    onAddItem({
      name: name.trim(),
      categoryId: selectedCatId,
      subcategoryId: (selectedSubCatId && selectedSubCatId !== 'none') ? selectedSubCatId : undefined,
      personId: selectedPersonId,
      bagId: selectedBagId,
      isToBuy: isToBuy
    });
  };

  const filteredSubcategories = subcategories.filter(sc => sc.categoryId === selectedCatId);

  // Styling for the standard select to match your app
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Master Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-item-name">Item Name</Label>
            <Input
              id="new-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Snow Jacket"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <select 
                className={selectClass}
                value={selectedCatId} 
                onChange={(e) => { setSelectedCatId(e.target.value); setSelectedSubCatId('none'); }}
                required
              >
                <option value="" disabled>Pick a category</option>
                {categories.sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <select 
                className={selectClass}
                value={selectedSubCatId || 'none'} 
                onChange={(e) => setSelectedSubCatId(e.target.value)}
              >
                <option value="none">None</option>
                {filteredSubcategories.sort((a, b) => a.name.localeCompare(b.name)).map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold">Assign Person</Label>
                <select 
                  className={selectClass}
                  value={selectedPersonId ? String(selectedPersonId) : 'unassigned'} 
                  onChange={(e) => setSelectedPersonId(e.target.value === 'unassigned' ? undefined : Number(e.target.value))}
                >
                  <option value="unassigned">Unassigned</option>
                  {people?.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold">Assign Bag</Label>
                <select 
                  className={selectClass}
                  value={selectedBagId ? String(selectedBagId) : 'unassigned'} 
                  onChange={(e) => setSelectedBagId(e.target.value === 'unassigned' ? undefined : Number(e.target.value))}
                >
                  <option value="unassigned">Unassigned</option>
                  {bags?.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="dialog-toBuy" checked={isToBuy} onCheckedChange={(checked: boolean) => setIsToBuy(checked)} />
              <Label htmlFor="dialog-toBuy" className="font-medium cursor-pointer">I need to buy this</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || !selectedCatId}>Add to Trip & Catalog</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewItemDialog;