import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bag } from '@/types';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { PRESET_COLORS } from '@/data/ColorPalette';

interface BagSelectorProps {
  bags: Bag[];
  onBagSelect: (bagId: string) => void;
  onAddNewBag: (bagData: { name: string; color?: string }) => void;
  placeholder: string;
}

const BagSelector: React.FC<BagSelectorProps> = ({ bags, onBagSelect, onAddNewBag, placeholder }) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [newBagColor, setNewBagColor] = useState(PRESET_COLORS[0]);

  const handleValueChange = (value: string) => {
    if (value === 'add_new') {
      setShowAddNew(true);
    } else {
      onBagSelect(value);
      setShowAddNew(false);
    }
  };

  const handleAddNew = () => {
    if (newBagName.trim()) {
      onAddNewBag({ name: newBagName.trim(), color: newBagColor });
      setNewBagName('');
      setNewBagColor(PRESET_COLORS[0]);
      setShowAddNew(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="add_new">+ Add New Bag</SelectItem>
          {bags.map((bag) => (
            <SelectItem key={bag.id} value={bag.id}>
              <div className="flex items-center gap-2">
                {bag.color && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bag.color }} />
                )}
                <span>{bag.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showAddNew && (
        <div className="p-4 border rounded-md space-y-4">
           <div>
            <Label>New Bag Name</Label>
            <Input
              value={newBagName}
              onChange={(e) => setNewBagName(e.target.value)}
              placeholder="Enter bag name..."
              autoFocus
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2 pt-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setNewBagColor(presetColor)}
                >
                  {newBagColor === presetColor && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddNew(false)}>Cancel</Button>
            <Button onClick={handleAddNew} disabled={!newBagName.trim()}>Add</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BagSelector;