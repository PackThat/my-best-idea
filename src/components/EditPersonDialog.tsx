import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Person } from '@/types';
import { Check } from 'lucide-react';
import { PRESET_COLORS } from '@/data/ColorPalette'; // Uses the new central palette

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person;
  onSave: (personId: string, updates: { name: string; color?: string }) => void;
}

const EditPersonDialog: React.FC<EditPersonDialogProps> = ({
  open,
  onOpenChange,
  person,
  onSave
}) => {
  const [name, setName] = useState(person.name);
  const [color, setColor] = useState(person.color || '');

  useEffect(() => {
    if (person) {
      setName(person.name);
      setColor(person.color || '');
    }
  }, [person]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(person.id, { name: name.trim(), color: color });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name Input */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person name"
              autoFocus
            />
          </div>
          {/* Color Picker */}
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2 pt-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                >
                  {color === presetColor && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
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

export default EditPersonDialog;