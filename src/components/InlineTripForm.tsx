import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { X, Plus } from 'lucide-react';

interface InlineTripFormProps {
  onCancel: () => void;
}

export const InlineTripForm: React.FC<InlineTripFormProps> = ({ onCancel }) => {
  const { createTrip } = useAppContext();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('InlineTripForm: Submitting trip:', { name: name.trim(), date });
    if (name.trim()) {
      createTrip({
        name: name.trim(),
        date: date || undefined,
        items: [],
        categories: [],
        subcategories: [],
        bags: [],
        people: [],
        todos: [],
        tripBags: []
      });
      setName('');
      setDate('');
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Create New Trip</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter trip name"
              onKeyDown={handleKeyDown}
              autoFocus
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tripDate">Date (Optional)</Label>
            <Input
              id="tripDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              Create Trip
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};