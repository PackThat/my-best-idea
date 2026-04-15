import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [selectedCatId, setSelectedCatId] = useState(preselectedCategoryId || '');
  const [selectedSubCatId, setSelectedSubCatId] = useState(preselectedSubcategoryId || '');
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(defaultPersonId);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(defaultBagId);
  const [isToBuy, setIsToBuy] = useState(defaultIsToBuy || false);

  const [formData, setFormData] = useState({
    name: initialName || '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setSelectedCatId(preselectedCategoryId || '');
      setSelectedSubCatId(preselectedSubcategoryId || '');
      setSelectedPersonId(defaultPersonId);
      setSelectedBagId(defaultBagId);
      setIsToBuy(defaultIsToBuy || false);
      setFormData({ name: initialName || '', notes: '' });
    }
  }, [open, preselectedCategoryId, preselectedSubcategoryId, defaultPersonId, defaultBagId, defaultIsToBuy, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !selectedCatId) return;

    onAddItem({
      name: formData.name.trim(),
      categoryId: selectedCatId,
      subcategoryId: (selectedSubCatId && selectedSubCatId !== 'none') ? selectedSubCatId : undefined,
      personId: selectedPersonId,
      bagId: selectedBagId,
      isToBuy: isToBuy
    });

    onOpenChange(false);
  };

  const currentCategory = categories.find(c => c.id === selectedCatId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Item</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Adding to: <span className="font-semibold text-foreground">
              {currentCategory?.name || 'Uncategorized'}
            </span>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name" className="mb-1 block font-medium">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Reading Glasses"
              required
              autoFocus
              className="bg-input focus-visible:bg-card"
            />
          </div>

          <div className="space-y-4">
            {!preselectedCategoryId && (
              <div>
                <Label className="mb-1 block font-medium text-xs text-muted-foreground">Category</Label>
                <Select value={selectedCatId} onValueChange={(val) => {
                  setSelectedCatId(val);
                  setSelectedSubCatId(''); 
                }}>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Pick a category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {categories.sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCatId && !preselectedSubcategoryId && (
              <div>
                <Label className="mb-1 block font-medium text-xs text-muted-foreground">Subcategory (Optional)</Label>
                <Select value={selectedSubCatId} onValueChange={setSelectedSubCatId}>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Pick a subcategory..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="none">None (General Item)</SelectItem>
                    {subcategories
                      .filter(sc => sc.categoryId === selectedCatId)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <Label className="mb-1 block font-medium text-xs text-muted-foreground">Assign Person</Label>
                <Select 
                  value={selectedPersonId ? String(selectedPersonId) : 'unassigned'} 
                  onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Person..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {people?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block font-medium text-xs text-muted-foreground">Assign Bag</Label>
                <Select 
                  value={selectedBagId ? String(selectedBagId) : 'unassigned'} 
                  onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Bag..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {bags?.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dialog-toBuy" 
                checked={isToBuy} 
                onCheckedChange={(checked: boolean) => setIsToBuy(checked)} 
              />
              <Label htmlFor="dialog-toBuy" className="font-medium cursor-pointer">Need to buy this</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewItemDialog;