import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPalette } from './ColorPalette'; // This import will now work

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personData: { name: string, color?: string }) => void;
}

const AddPersonDialog: React.FC<AddPersonDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), color });
      onOpenChange(false); // Close the dialog
      setName(''); // Reset the fields
      setColor(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Add a new person to your global list. You can assign them to trips later.
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
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPalette selectedColor={color} onSelectColor={setColor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Add Person
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonDialog;