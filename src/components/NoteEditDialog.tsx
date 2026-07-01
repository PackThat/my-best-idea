import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: { id: string; name: string }[];
  initialNote: string | undefined;
  onSave: (newNote: string | undefined) => void;
}

export const NoteEditDialog: React.FC<NoteEditDialogProps> = ({
  open,
  onOpenChange,
  items,
  initialNote,
  onSave
}) => {
  const [noteText, setNoteText] = useState(initialNote || '');

  useEffect(() => {
    if (open) {
      setNoteText(initialNote || '');
    }
  }, [open, initialNote]);

  const handleSave = () => {
    onSave(noteText.trim() === '' ? undefined : noteText.trim());
    onOpenChange(false);
  };

  const handleDelete = () => {
    onSave(undefined);
    onOpenChange(false);
  };

  const isBulk = items.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isBulk ? `Adding note to ${items.length} items` : `Note for: ${items[0]?.name}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isBulk 
              ? "This note will be added to all selected items below." 
              : "Add, edit, or delete the note for this item below."}
          </DialogDescription>
        </DialogHeader>

        {isBulk && (
          <ScrollArea className="h-24 w-full rounded-md border border-border p-2 bg-background">
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              {items.map(item => <li key={item.id}>{item.name}</li>)}
            </ul>
          </ScrollArea>
        )}

        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Type your note here..."
          className="min-h-[120px] bg-background border-border text-foreground focus-visible:ring-primary"
          autoFocus
        />
        <DialogFooter className="sm:justify-between pt-2">
          <Button 
            onClick={handleDelete} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Delete Note
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-primary text-primary hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Note
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditDialog;