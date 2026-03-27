import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, RotateCcw, Copy } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';

const TripSelector: React.FC = () => {
  const { trips, currentTripId, loadTrip, createTrip, resetTrip, cloneTrip } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDate, setNewTripDate] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  const currentTrip = trips.find(t => t.id === currentTripId);

  const handleCreateTrip = () => {
    if (newTripName.trim()) {
      createTrip({
        name: newTripName.trim(),
        date: newTripDate || undefined,
        items: [],
        categories: [],
        subcategories: [],
        bags: [],
        people: [],
        todos: []
      });
      setNewTripName('');
      setNewTripDate('');
      setShowAddNew(false);
      setIsOpen(false);
    }
  };

  const handleTripSelect = (value: string) => {
    if (value === 'add-new') {
      setShowAddNew(true);
    } else {
      loadTrip(value);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentTripId || ''} onValueChange={handleTripSelect}>
        <SelectTrigger className="bg-white/10 border-white/30 text-white hover:bg-white/20 min-w-[200px]">
          <SelectValue placeholder="Select Trip" />
        </SelectTrigger>
        <SelectContent>
          {trips.map((trip) => (
            <SelectItem key={trip.id} value={trip.id}>
              <div className="flex flex-col">
                <span>{trip.name}</span>
                {trip.date && (
                  <span className="text-xs opacity-60">
                    {format(new Date(trip.date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="add-new" className="font-medium text-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Trip
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={showAddNew} onOpenChange={setShowAddNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tripName">Trip Name *</Label>
              <Input
                id="tripName"
                placeholder="Enter trip name"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tripDate">Trip Date</Label>
              <Input
                id="tripDate"
                type="date"
                value={newTripDate}
                onChange={(e) => setNewTripDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTrip} disabled={!newTripName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripSelector;