import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check } from 'lucide-react';
import { Person } from '@/types';
import { PRESET_COLORS } from '@/data/ColorPalette'; // Corrected import path

interface PersonSelectorProps {
  people: Person[];
  onPersonSelect: (personId: string) => void;
  onAddNewPerson: (personData: { name: string; color?: string }) => void;
  placeholder?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  people,
  onPersonSelect,
  onAddNewPerson,
  placeholder = "Select a person..."
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState(PRESET_COLORS[0]);

  const handleAddNew = () => {
    if (newPersonName.trim()) {
      onAddNewPerson({ name: newPersonName.trim(), color: newPersonColor });
      setNewPersonName('');
      setNewPersonColor(PRESET_COLORS[0]);
      setShowAddNew(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
    } else {
      setShowAddNew(false);
      onPersonSelect(value);
    }
  };

  if (showAddNew) {
    return (
      <div className="space-y-4 p-4 border rounded-md bg-card">
        <div>
          <Label>New Person Name</Label>
          <Input
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
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
                onClick={() => setNewPersonColor(presetColor)}
              >
                {newPersonColor === presetColor && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowAddNew(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddNew} disabled={!newPersonName.trim()}>
            Add Person
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
        {people.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            <div className="flex items-center gap-2">
              {person.color && (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: person.color }} />
              )}
              <span>{person.name}</span>
            </div>
          </SelectItem>
        ))}
        <SelectItem value="add-new">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Person
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PersonSelector;