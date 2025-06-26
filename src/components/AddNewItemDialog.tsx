import React, { useState } from 'react';
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
import { Category, Subcategory, Item } from '@/types';

interface AddNewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
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
    categoryId: preselectedCategoryId || '',
    subcategoryId: preselectedSubcategoryId || '',
    notes: '',
  });

  const filteredSubcategories = subcategories.filter(
    sub => sub.categoryId === formData.categoryId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return;

    onAddItem({
      name: formData.name,
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || undefined,
      quantity: 1,
      notes: formData.notes,
      packed: false,
      needsToBuy: false,
      personId: undefined, // Optional - no person required
      bagId: undefined, // Optional - no bag required
    });

    setFormData({
      name: '',
      categoryId: preselectedCategoryId || '',
      subcategoryId: preselectedSubcategoryId || '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item to Catalog</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  categoryId: value,
                  subcategoryId: '' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subcategory</Label>
              <Select
                value={formData.subcategoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))}
                disabled={!formData.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit">Add to Catalog</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewItemDialog;