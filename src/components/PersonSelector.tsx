import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Person } from '@/types';

interface PersonSelectorProps {
  people: Person[];
  onPersonSelect: (personId: string) => void;
  onAddNewPerson: (personName: string) => void;
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

  const handleAddNew = () => {
    if (newPersonName.trim()) {
      onAddNewPerson(newPersonName.trim());
      setNewPersonName('');
      setShowAddNew(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
    } else {
      onPersonSelect(value);
    }
  };

  if (showAddNew) {
    return (
      <div className="space-y-2">
        <Label>New Person Name</Label>
        <div className="flex gap-2">
          <Input
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
          />
          <Button onClick={handleAddNew} disabled={!newPersonName.trim()}>
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
        {people.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.name}
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