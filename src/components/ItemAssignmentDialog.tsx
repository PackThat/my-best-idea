import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Item, Person, Bag } from '@/types';

interface ItemAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  subcategoryId?: string;
}

const ItemAssignmentDialog: React.FC<ItemAssignmentDialogProps> = ({
  open,
  onOpenChange,
  categoryId,
  subcategoryId
}) => {
  const { items, people, bags, addItem } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [bagAssignments, setBagAssignments] = useState<Record<string, string>>({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const availableItems = items.filter(item => 
    item.categoryId === categoryId && 
    (subcategoryId ? item.subcategoryId === subcategoryId : !item.subcategoryId)
  );

  const handlePersonToggle = (personId: string, checked: boolean) => {
    if (checked) {
      setSelectedPeople(prev => [...prev, personId]);
    } else {
      setSelectedPeople(prev => prev.filter(id => id !== personId));
      setBagAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[personId];
        return newAssignments;
      });
    }
  };

  const handleBagAssignment = (personId: string, bagId: string) => {
    setBagAssignments(prev => ({ ...prev, [personId]: bagId }));
  };

  const handleSubmit = () => {
    const itemName = selectedItem?.name || newItemName;
    if (!itemName || selectedPeople.length === 0) return;

    selectedPeople.forEach(personId => {
      const bagId = bagAssignments[personId];
      addItem({
        name: itemName,
        categoryId,
        subcategoryId,
        quantity: 1,
        notes: '',
        packed: false,
        needsToBuy: false,
        personId,
        bagId
      });
    });

    // Reset form
    setSelectedItem(null);
    setNewItemName('');
    setSelectedPeople([]);
    setBagAssignments({});
    setIsCreatingNew(false);
    onOpenChange(false);
  };

  const handleSelectAllPeople = () => {
    if (selectedPeople.length === people.length) {
      setSelectedPeople([]);
      setBagAssignments({});
    } else {
      setSelectedPeople(people.map(p => p.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item to People & Bags</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Selection */}
          <div>
            <Label className="text-base font-semibold">Select or Create Item</Label>
            <div className="mt-2 space-y-2">
              {availableItems.length > 0 && !isCreatingNew && (
                <div className="grid gap-2">
                  {availableItems.map(item => (
                    <Card 
                      key={item.id}
                      className={`cursor-pointer transition-colors ${
                        selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline">
                            Used {items.filter(i => i.name === item.name).length} times
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingNew(!isCreatingNew);
                  setSelectedItem(null);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingNew ? 'Select Existing Item' : 'Create New Item'}
              </Button>
              
              {isCreatingNew && (
                <Input
                  placeholder="Enter new item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* People Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">Assign to People</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAllPeople}
              >
                <Users className="h-4 w-4 mr-2" />
                {selectedPeople.length === people.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {people.map(person => {
                const isSelected = selectedPeople.includes(person.id);
                return (
                  <Card key={person.id} className={isSelected ? 'ring-2 ring-blue-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handlePersonToggle(person.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{person.name}</span>
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: person.color }}
                            />
                          </div>
                          
                          {isSelected && (
                            <div className="mt-2">
                              <Label className="text-sm">Assign to bag:</Label>
                              <Select 
                                value={bagAssignments[person.id] || ''}
                                onValueChange={(value) => handleBagAssignment(person.id, value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select bag" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bags.map(bag => (
                                    <SelectItem key={bag.id} value={bag.id}>
                                      {bag.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={(!selectedItem && !newItemName) || selectedPeople.length === 0}
            >
              Add to {selectedPeople.length} {selectedPeople.length === 1 ? 'Person' : 'People'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemAssignmentDialog;