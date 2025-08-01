import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bag } from '@/types';
import { Check } from 'lucide-react';
import { ColorPalette } from './ColorPalette';

interface EditBagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bag: Bag;
  onSave: (bagId: number, updates: Partial<Bag>) => void;
}

const EditBagDialog: React.FC<EditBagDialogProps> = ({
  open,
  onOpenChange,
  bag,
  onSave
}) => {
  const [name, setName] = useState(bag.name);
  const [color, setColor] = useState(bag.color || '');

  useEffect(() => {
    if (bag) {
      setName(bag.name);
      setColor(bag.color || '');
    }
  }, [bag]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(bag.id, { name: name.trim(), color: color });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Bag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name Input */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bag name"
              autoFocus
            />
          </div>
          {/* Color Picker */}
          <div>
            <Label>Color</Label>
            <ColorPalette selectedColor={color} onSelectColor={(newColor) => setColor(newColor || '')} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBagDialog;