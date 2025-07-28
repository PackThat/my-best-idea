// src/components/BagSelector.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check } from 'lucide-react';
import { Bag } from '@/types';
import { PRESET_COLORS } from '@/data/ColorPalette';
import { useAppContext } from '@/contexts/AppContext';

interface BagSelectorProps {
  bags: Bag[];
  onBagSelected: (bagId: number) => void;
  placeholder?: string;
}

// ADDED 'export' keyword here to make it a named export
export const BagSelector: React.FC<BagSelectorProps> = ({
  bags,
  onBagSelected,
  placeholder = "Select a bag..."
}) => {
  const { createBag } = useAppContext();
  const [showAddNew, setShowAddNew] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [newBagColor, setNewBagColor] = useState(PRESET_COLORS[0]);
  const [isSavingNewBag, setIsSavingNewBag] = useState(false);

  const handleAddNew = async () => {
    if (newBagName.trim()) {
      setIsSavingNewBag(true);
      try {
        const newBag = await createBag({ name: newBagName.trim(), color: newBagColor });

        if (newBag?.id) {
          onBagSelected(newBag.id);
        }

        setNewBagName('');
        setNewBagColor(PRESET_COLORS[0]);
        setShowAddNew(false);
      } catch (error) {
        console.error("Error adding new bag:", error);
      } finally {
        setIsSavingNewBag(false);
      }
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
      setNewBagName('');
      setNewBagColor(PRESET_COLORS[0]);
    } else {
      setShowAddNew(false);
      onBagSelected(Number(value));
    }
  };

  if (showAddNew) {
    return (
      <div className="space-y-4 p-4 border rounded-md bg-card">
        <div>
          <Label htmlFor="new-bag-name">New Bag Name</Label>
          <Input
            id="new-bag-name"
            value={newBagName}
            onChange={(e) => setNewBagName(e.target.value)}
            placeholder="Enter bag name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
            autoFocus
            disabled={isSavingNewBag}
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
                disabled={isSavingNewBag}
              >
                {newBagColor === presetColor && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowAddNew(false)} disabled={isSavingNewBag}>
            Cancel
          </Button>
          <Button onClick={handleAddNew} disabled={!newBagName.trim() || isSavingNewBag}>
            {isSavingNewBag ? 'Adding...' : 'Add Bag'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select onValueChange={handleSelectChange} disabled={isSavingNewBag}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {bags.map((bag) => (
          <SelectItem key={String(bag.id)} value={String(bag.id)}>
            <div className="flex items-center gap-2">
              {bag.color && (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bag.color }} />
              )}
              <span>{bag.name}</span>
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