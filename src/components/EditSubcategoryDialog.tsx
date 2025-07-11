import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Subcategory } from '@/types';

interface EditSubcategoryDialogProps {
  open: boolean;
  onOpenChange: () => void;
  subcategory: Subcategory;
  onSave: (id: string, name: string) => void;
}

const EditSubcategoryDialog: React.FC<EditSubcategoryDialogProps> = ({
  open,
  onOpenChange,
  subcategory,
  onSave,
}) => {
  const [name, setName] = useState(subcategory.name);

  useEffect(() => {
    setName(subcategory.name);
  }, [subcategory]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(subcategory.id, name.trim());
      onOpenChange();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Subcategory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Subcategory Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Glasses"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubcategoryDialog;