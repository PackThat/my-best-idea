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
import { Category, Subcategory, Bag, Person, Item } from '@/types';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  items: Item[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onAddSubcategory: (subcategory: Omit<Subcategory, 'id'>) => void;
  onAddBag: (bag: Omit<Bag, 'id'>) => void;
  onAddItemToPacking: (itemId: string, personId?: string, bagId?: string, quantity?: number) => void; 
  onAddNewItem: (item: Omit<Item, 'id'>) => void;
  preselectedPersonId?: string;
  preselectedBagId?: string;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  categories,
  subcategories,
  bags,
  people,
  onAddItem,
  onAddPerson,
  onAddCategory,
  onAddSubcategory,
  onAddBag,
  preselectedPersonId,
  preselectedBagId,
}) => {
  // --- THIS IS OUR TEST MESSAGE ---
  console.log("--- EXECUTING THE LATEST AddItemDialog.tsx FILE ---");

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    quantity: 1,
    notes: '',
    bagId: preselectedBagId || '',
    personId: preselectedPersonId || '',
  });

  const filteredSubcategories = (subcategories || []).filter(
    sub => sub.categoryId === formData.categoryId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId) {
      return;
    }

    const newItem = {
      ...formData,
      subcategoryId: formData.subcategoryId || undefined,
      packed: false,
      needsToBuy: false,
      bagId: formData.bagId || undefined,
      personId: formData.personId || undefined,
    };
    
    onAddItem(newItem);

    // Reset form after submission
    setFormData({
      name: '',
      categoryId: '',
      subcategoryId: '',
      quantity: 1,
      notes: '',
      bagId: preselectedPersonId || '',
      personId: preselectedPersonId || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
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
                  {(categories || []).map((category) => (
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
                  {(filteredSubcategories || []).map((subcategory) => (
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
              placeholder="Add any specific notes..."
            />
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
                  <SelectItem value="">None</SelectItem>
                  {(people || []).map((person) => (
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
                  <SelectItem value="">None</SelectItem>
                  {(bags || []).map((bag) => (
                    <SelectItem key={bag.id} value={bag.id}>
                      {bag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;