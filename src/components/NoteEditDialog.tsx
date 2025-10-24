import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/types';

interface NoteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  onSaveNote: (itemId: string, newNote: string | undefined) => void;
}

export const NoteEditDialog: React.FC<NoteEditDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSaveNote
}) => {
  const [noteText, setNoteText] = useState(item.notes || '');

  useEffect(() => {
    // When the dialog opens for a new item, reset the text
    if (open) {
      setNoteText(item.notes || '');
    }
  }, [open, item]);

  const handleSave = () => {
    onSaveNote(item.id, noteText.trim());
    onOpenChange(false);
  };

  const handleDelete = () => {
    onSaveNote(item.id, undefined); // Set note to undefined to delete it
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Note for: {item.name}</DialogTitle>
          <DialogDescription>
            Add, edit, or delete the note for this item below.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Type your note here... (e.g., Pack the red ones)"
          className="min-h-[120px] bg-accent"
          autoFocus
        />
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={handleDelete} className="mt-2 sm:mt-0">
            Delete Note
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditDialog;