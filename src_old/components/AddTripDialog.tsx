// src/components/AddTripDialog.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect import
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/contexts/AppContext';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils'; // THIS IS THE IMPORTANT IMPORT FOR 'cn'

interface AddTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: () => void;
}

export const AddTripDialog: React.FC<AddTripDialogProps> = ({ isOpen, onClose, onTripCreated }) => {
  const { createTrip } = useAppContext();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTripName('');
      setStartDate(undefined);
      setBackgroundImageUrl('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tripName.trim() === '') {
      // You mentioned you don't want explanations, but this is a simple JS alert for now.
      // If you want a more integrated message later, we can implement it.
      alert('Trip name cannot be empty.');
      return;
    }

    await createTrip({
      name: tripName.trim(),
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      backgroundImageUrl: backgroundImageUrl || undefined,
    });

    onClose();
    if (onTripCreated) {
      onTripCreated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader className="pb-2">
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name *</Label>
              <Input
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Enter trip name"
                required
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn( // Using 'cn' here
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Removed End Date field */}

            <div className="space-y-2">
              <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
              <Input
                id="backgroundImageUrl"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                placeholder="Optional: URL for trip background image"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
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