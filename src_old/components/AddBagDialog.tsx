import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPalette } from './ColorPalette';

interface AddBagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bagData: { name: string, color?: string }) => void;
}

const AddBagDialog: React.FC<AddBagDialogProps> = ({
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
          <DialogTitle>Add New Bag</DialogTitle>
          <DialogDescription>
            Add a new bag to your global list. You can assign it to trips later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Bag's Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backpack"
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
            Add Bag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBagDialog;