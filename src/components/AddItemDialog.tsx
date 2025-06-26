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
import { useAppContext } from '@/contexts/AppContext';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
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
  preselectedPersonId,
  preselectedBagId,
}) => {
  const { addPerson, addCategory, addSubcategory, addBag } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    quantity: 1,
    notes: '',
    bagId: preselectedBagId || '',
    personId: preselectedPersonId || '',
  });

  const filteredSubcategories = subcategories.filter(
    sub => sub.categoryId === formData.categoryId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 AddItemDialog handleSubmit called');
    
    if (!formData.name || !formData.categoryId) {
      console.log('❌ Missing required fields');
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
    
    console.log('📝 Adding item:', newItem);
    onAddItem(newItem);

    setFormData({
      name: '',
      categoryId: '',
      subcategoryId: '',
      quantity: 1,
      notes: '',
      bagId: preselectedBagId || '',
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