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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Subcategory } from '@/types';

// The props are simplified as this dialog now has one job: add to the master catalog.
interface AddNewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  onAddItem: (itemData: { name: string; notes?: string }) => void;
  preselectedCategoryId?: string;
  preselectedSubcategoryId?: string;
}

export const AddNewItemDialog: React.FC<AddNewItemDialogProps> = ({
  open,
  onOpenChange,
  categories,
  subcategories,
  onAddItem,
  preselectedCategoryId,
  preselectedSubcategoryId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
  });
  
  // This logic is no longer needed here as the category/subcategory are pre-selected
  // but we keep it for reference. In the future, this dialog could be made more flexible.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // We only need to pass the name and optional notes.
    // The category/subcategory IDs are already known by the context.
    onAddItem({
      name: formData.name.trim(),
      notes: formData.notes,
    });

    // Reset form after submission
    setFormData({
      name: '',
      notes: '',
    });
    onOpenChange(false);
  };
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      setFormData({ name: '', notes: '' });
    }
  }, [open]);

  const selectedCategory = categories.find(c => c.id === preselectedCategoryId);
  const selectedSubcategory = subcategories.find(sc => sc.id === preselectedSubcategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item to Catalog</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Adding to: <span className="font-medium text-foreground">{selectedCategory?.name} / {selectedSubcategory?.name}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes about this item"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>Add to Catalog</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewItemDialog;