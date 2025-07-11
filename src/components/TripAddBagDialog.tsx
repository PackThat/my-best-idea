import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Bag } from '@/types';

interface AddBagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBagDialog: React.FC<AddBagDialogProps> = ({ open, onOpenChange }) => {
  const { bags, addBag, addBagToTrip } = useAppContext();
  const [selectedValue, setSelectedValue] = useState('');
  const [newBagName, setNewBagName] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  const handleBagSelect = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
      setSelectedValue('');
    } else {
      setSelectedValue(value);
      setShowAddNew(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎒 AddBagDialog handleSubmit called');
    
    if (showAddNew) {
      if (!newBagName.trim()) return;
      console.log('🎒 Creating new bag and adding to trip:', newBagName.trim());
      
      // Create the new bag
      const newBag = addBag({
        name: newBagName.trim(),
        color: '#10B981',
      });
      
      if (newBag) {
        console.log('🎒 New bag created, adding to trip:', newBag.id);
        // Add the new bag to the trip immediately
        addBagToTrip(newBag.id);
      }
      
      setNewBagName('');
    } else if (selectedValue) {
      console.log('🎒 Adding existing bag to trip:', selectedValue);
      addBagToTrip(selectedValue);
    }
    
    setShowAddNew(false);
    setSelectedValue('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setShowAddNew(false);
    setSelectedValue('');
    setNewBagName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bag to Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!showAddNew ? (
            <div>
              <Label>Select Bag</Label>
              <Select value={selectedValue} onValueChange={handleBagSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bag" />
                </SelectTrigger>
                <SelectContent>
                  {bags.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: bag.color }}
                        />
                        {bag.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new" className="font-medium text-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Bag
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="name">New Bag Name *</Label>
              <Input
                id="name"
                value={newBagName}
                onChange={(e) => setNewBagName(e.target.value)}
                placeholder="Enter bag name"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddNew(false)}
                className="w-full mt-2"
              >
                Back to Selection
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!showAddNew && !selectedValue}
            >
              {showAddNew ? 'Add Bag' : 'Add Bag'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddBagDialog };
export default AddBagDialog;