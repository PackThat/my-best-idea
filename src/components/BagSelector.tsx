import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Bag } from '@/types';

interface BagSelectorProps {
  bags: Bag[];
  onBagSelect: (bagId: string) => void;
  onAddNewBag: (bagName: string, bagColor?: string) => void;
  placeholder?: string;
}

const BagSelector: React.FC<BagSelectorProps> = ({
  bags,
  onBagSelect,
  onAddNewBag,
  placeholder = "Select a bag..."
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [newBagColor, setNewBagColor] = useState('#10B981');

  const handleAddNew = () => {
    if (newBagName.trim()) {
      onAddNewBag(newBagName.trim(), newBagColor);
      setNewBagName('');
      setNewBagColor('#10B981');
      setShowAddNew(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
    } else {
      onBagSelect(value);
    }
  };

  if (showAddNew) {
    return (
      <div className="space-y-2">
        <Label>New Bag Name</Label>
        <div className="flex gap-2">
          <Input
            value={newBagName}
            onChange={(e) => setNewBagName(e.target.value)}
            placeholder="Enter bag name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
          />
          <Input
            type="color"
            value={newBagColor}
            onChange={(e) => setNewBagColor(e.target.value)}
            className="w-16"
          />
          <Button onClick={handleAddNew} disabled={!newBagName.trim()}>
            Add
          </Button>
          <Button variant="outline" onClick={() => setShowAddNew(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
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
        <SelectItem value="add-new">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Bag
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default BagSelector;