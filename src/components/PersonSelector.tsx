import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Person } from '@/types';
import { ColorPalette } from './ColorPalette';
import { useAppContext } from '@/contexts/AppContext';

interface PersonSelectorProps {
  people: Person[];
  onPersonSelect: (personId: number) => void;
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
  const [newPersonColor, setNewPersonColor] = useState<string | undefined>(undefined);
  const [isSavingNewPerson, setIsSavingNewPerson] = useState(false);

  const handleAddNew = async () => {
    if (newPersonName.trim()) {
      setIsSavingNewPerson(true);
      try {
        const newPersonObject = await createPerson({ name: newPersonName.trim(), color: newPersonColor });
        
        if (newPersonObject) {
          await addPersonToTrip(newPersonObject.id);
          onPersonSelect(newPersonObject.id);
        }

        setNewPersonName('');
        setNewPersonColor(undefined);
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
      setNewPersonColor(undefined);
    } else {
      setShowAddNew(false);
      onPersonSelect(Number(value));
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
          <ColorPalette
            selectedColor={newPersonColor}
            onSelectColor={(color) => setNewPersonColor(color)}
          />
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