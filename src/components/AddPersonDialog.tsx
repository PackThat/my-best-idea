// src/components/AddPersonDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPalette } from './ColorPalette';
import { useAppContext } from '@/contexts/AppContext'; // Import useAppContext

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Removed onSave as the logic will now be handled internally using useAppContext
}

const AddPersonDialog: React.FC<AddPersonDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createPerson, addPersonToTrip } = useAppContext(); // Get the functions from context
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false); // State to manage loading during add

  const handleSave = async () => {
    if (name.trim()) {
      setIsAdding(true); // Set loading state
      try {
        // 1. Create the new person globally
        const newPersonId = await createPerson({ name: name.trim(), color });

        // 2. If person created, add them to the current trip
        if (newPersonId) {
          await addPersonToTrip(newPersonId);
        }

        onOpenChange(false); // Close the dialog
        setName(''); // Reset the fields
        setColor(undefined);
      } catch (error) {
        console.error("Failed to add new person to global list or trip:", error);
        // Optionally show an error message to the user
      } finally {
        setIsAdding(false); // Reset loading state
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Add a new person to your global list, and they will be assigned to the current trip.
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
              disabled={isAdding} // Disable input while adding
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPalette
              selectedColor={color}
              onSelectColor={setColor}
              disabled={isAdding} // Disable color selection while adding
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