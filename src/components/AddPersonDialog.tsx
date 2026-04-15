import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPalette } from './ColorPalette';
import { useAppContext } from '@/contexts/AppContext';
import { Person } from '@/types';

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
}

const AddPersonDialog: React.FC<AddPersonDialogProps> = ({
  open,
  onOpenChange,
  onAddPerson
}) => {
  const { createPerson, addPersonToTrip } = useAppContext();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async () => {
    if (name.trim()) {
      setIsAdding(true);
      try {
        const personData = { name: name.trim(), color };
        
        onAddPerson(personData);

        const newPerson = await createPerson(personData);

        if (newPerson && newPerson.id) {
          await addPersonToTrip(Number(newPerson.id));
        }

        onOpenChange(false);
        setName('');
        setColor(undefined);
      } catch (error) {
        console.error("Failed to add new person:", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Add a new person to your global list and assign them to this trip.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Person's Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Andrea"
              autoFocus
              disabled={isAdding}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            {/* Disabled prop removed from ColorPalette to fix the error */}
            <ColorPalette
              selectedColor={color}
              onSelectColor={setColor}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isAdding}>
            {isAdding ? 'Adding...' : 'Add Person'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonDialog;