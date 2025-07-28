// src/components/PersonSelector.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check } from 'lucide-react';
import { Person } from '@/types';
import { PRESET_COLORS } from '@/data/ColorPalette';
import { useAppContext } from '@/contexts/AppContext';

interface PersonSelectorProps {
  people: Person[];
  onPersonSelect: (personId: number) => void; // Expect personId as number now
  placeholder?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  people,
  onPersonSelect,
  placeholder = "Select a person..."
}) => {
  const { createPerson, addPersonToTrip } = useAppContext();
  const [showAddNew, setShowAddNew] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState(PRESET_COLORS[0]);
  const [isSavingNewPerson, setIsSavingNewPerson] = useState(false);

  const handleAddNew = async () => {
    if (newPersonName.trim()) {
      setIsSavingNewPerson(true);
      try {
        // createPerson returns a number (Person.id is number)
        const newPersonId = await createPerson({ name: newPersonName.trim(), color: newPersonColor });
        
        if (newPersonId) {
          // addPersonToTrip expects a number
          await addPersonToTrip(newPersonId);
          onPersonSelect(newPersonId); // onPersonSelect now expects a number
        }

        setNewPersonName('');
        setNewPersonColor(PRESET_COLORS[0]);
        setShowAddNew(false);
      } catch (error) {
        console.error("Error adding new person:", error);
      } finally {
        setIsSavingNewPerson(false);
      }
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
      setNewPersonName('');
      setNewPersonColor(PRESET_COLORS[0]);
    } else {
      setShowAddNew(false);
      onPersonSelect(Number(value)); // Convert the string value back to a number for onPersonSelect
    }
  };

  if (showAddNew) {
    return (
      <div className="space-y-4 p-4 border rounded-md bg-card">
        <div>
          <Label htmlFor="new-person-name">New Person Name</Label>
          <Input
            id="new-person-name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
            autoFocus
            disabled={isSavingNewPerson}
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
                disabled={isSavingNewPerson}
              >
                {newPersonColor === presetColor && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowAddNew(false)} disabled={isSavingNewPerson}>
            Cancel
          </Button>
          <Button onClick={handleAddNew} disabled={!newPersonName.trim() || isSavingNewPerson}>
            {isSavingNewPerson ? 'Adding...' : 'Add Person'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select onValueChange={handleSelectChange} disabled={isSavingNewPerson}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {people.map((person) => (
          // Value in SelectItem must be a string, so convert person.id to string
          <SelectItem key={String(person.id)} value={String(person.id)}>
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