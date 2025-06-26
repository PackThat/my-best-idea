import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search } from 'lucide-react';
import { Category, Subcategory, Item, Person, Bag } from '@/types';

interface ItemSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: Subcategory[];
  items: Item[];
  people: Person[];
  bags: Bag[];
  onAddItemToPacking: (itemId: string, personId?: string, bagId?: string, quantity?: number) => void;
  onAddNewItem: (item: Omit<Item, 'id'>) => void;
  preselectedPersonId?: string;
  preselectedBagId?: string;
  defaultNeedsToBuy?: boolean;
}

export const ItemSelectionDialog: React.FC<ItemSelectionDialogProps> = ({
  open,
  onOpenChange,
  categories,
  subcategories,
  items,
  people,
  bags,
  onAddItemToPacking,
  onAddNewItem,
  preselectedPersonId,
  preselectedBagId,
  defaultNeedsToBuy = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(preselectedPersonId || '');
  const [selectedBagId, setSelectedBagId] = useState(preselectedBagId || '');
  const [quantity, setQuantity] = useState(1);
  const [needsToBuy, setNeedsToBuy] = useState(defaultNeedsToBuy);

  // Reset preselected person when dialog opens
  React.useEffect(() => {
    if (open && preselectedPersonId) {
      setSelectedPersonId(preselectedPersonId);
    }
  }, [open, preselectedPersonId]);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.categoryId === selectedCategoryId);
    }
    return filtered;
  }, [items, searchTerm, selectedCategoryId]);

  const handleAddToPacking = () => {
    console.log('📦 ItemSelectionDialog handleAddToPacking called');
    
    if (!selectedItemId) {
      console.log('❌ No item selected');
      return;
    }
    
    console.log('📦 Adding item:', selectedItemId);
    const catalogItem = items.find(item => item.id === selectedItemId);
    if (catalogItem) {
      const newItem: Omit<Item, 'id'> = {
        name: catalogItem.name,
        categoryId: catalogItem.categoryId,
        subcategoryId: catalogItem.subcategoryId,
        quantity,
        notes: catalogItem.notes,
        packed: false,
        needsToBuy,
        personId: selectedPersonId || undefined,
        bagId: selectedBagId || undefined,
      };
      onAddNewItem(newItem);
    }
    
    setSelectedItemId('');
    setQuantity(1);
    setNeedsToBuy(defaultNeedsToBuy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item to Packing List</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Item ({filteredItems.length} found)</Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredItems.map((item) => {
                const category = categories.find(c => c.id === item.categoryId);
                
                return (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedItemId === item.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="secondary">
                              {category?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {selectedItemId && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Optional Assignment:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Person (Optional)</Label>
                  <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No person assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No person assigned</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Bag (Optional)</Label>
                  <Select value={selectedBagId} onValueChange={setSelectedBagId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No bag assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No bag assigned</SelectItem>
                      {bags.map((bag) => (
                        <SelectItem key={bag.id} value={bag.id}>
                          {bag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="needsToBuy"
                    checked={needsToBuy}
                    onCheckedChange={(checked) => setNeedsToBuy(!!checked)}
                  />
                  <Label htmlFor="needsToBuy">Need to buy</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToPacking}
              disabled={!selectedItemId}
            >
              Add to Packing List
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectionDialog;