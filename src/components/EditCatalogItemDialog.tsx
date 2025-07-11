import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CatalogItem } from '@/types';

interface EditCatalogItemDialogProps {
  open: boolean;
  onOpenChange: () => void;
  item: CatalogItem;
  onSave: (id: string, updates: { name: string; notes?: string }) => void;
}

const EditCatalogItemDialog: React.FC<EditCatalogItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave,
}) => {
  const [name, setName] = useState(item.name);
  const [notes, setNotes] = useState(item.notes || '');

  useEffect(() => {
    setName(item.name);
    setNotes(item.notes || '');
  }, [item]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(item.id, { name: name.trim(), notes: notes });
      onOpenChange();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Master Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this item"
              rows={2}
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

export default EditCatalogItemDialog;