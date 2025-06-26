import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/contexts/AppContext';
import { Plus } from 'lucide-react';

interface AddTripDialogProps {
  trigger?: React.ReactNode;
}

export const AddTripDialog: React.FC<AddTripDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const { createTrip, categories, subcategories, bags } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createTrip({
        name: name.trim(),
        date: date || undefined,
        items: [],
        categories: [...categories],
        subcategories: [...subcategories],
        bags: [...bags],
        people: [],
        todos: [],
      });
      setName('');
      setDate('');
      setOpen(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDate('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur(); // Remove focus to dismiss keyboard
      if (name.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[60vh] fixed top-4 left-1/2 transform -translate-x-1/2 translate-y-0">
        <DialogHeader className="pb-2">
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[40vh] pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name *</Label>
              <Input
                id="tripName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter trip name"
                required
                autoFocus={false}
                enterKeyHint="done"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tripDate">Trip Date</Label>
              <Input
                id="tripDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyDown={handleKeyDown}
                enterKeyHint="done"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">+ Create Trip</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};