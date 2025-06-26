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
import { Category, Subcategory, Item, Person, Bag } from '@/types';

interface AddToBuyItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  people: Person[];
  bags: Bag[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
}

export const AddToBuyItemDialog: React.FC<AddToBuyItemDialogProps> = ({
  open,
  onOpenChange,
  categories,
  subcategories,
  people,
  bags,
  onAddItem,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    quantity: 1,
    notes: '',
    personId: '',
    bagId: '',
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
      quantity: formData.quantity,
      notes: formData.notes,
      packed: false,
      needsToBuy: true,
      personId: formData.personId || undefined,
      bagId: formData.bagId || undefined,
    });

    setFormData({
      name: '',
      categoryId: '',
      subcategoryId: '',
      quantity: 1,
      notes: '',
      personId: '',
      bagId: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item to Buy</DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Person</Label>
              <Select
                value={formData.personId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bag</Label>
              <Select
                value={formData.bagId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bagId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bag" />
                </SelectTrigger>
                <SelectContent>
                  {bags.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id}>
                      {bag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
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
            <Button type="submit">Add to Buy List</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToBuyItemDialog;