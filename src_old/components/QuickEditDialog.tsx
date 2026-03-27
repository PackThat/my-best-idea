import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, Bag, Person } from '@/types';

interface QuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  bags: Bag[];
  people: Person[];
  onUpdate: (id: string, updates: Partial<Item>) => void;
}

const QuickEditDialog: React.FC<QuickEditDialogProps> = ({
  open,
  onOpenChange,
  item,
  bags,
  people,
  onUpdate,
}) => {
  const [selectedBagId, setSelectedBagId] = useState(item.bagId);
  const [selectedPersonId, setSelectedPersonId] = useState(item.personId);

  const handleSave = () => {
    onUpdate(item.id, {
      bagId: selectedBagId,
      personId: selectedPersonId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Edit: {item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Person</label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bag</label>
            <Select value={selectedBagId} onValueChange={setSelectedBagId}>
              <SelectTrigger>
                <SelectValue placeholder="Select bag" />
              </SelectTrigger>
              <SelectContent>
                {bags.map((bag) => (
                  <SelectItem key={bag.id} value={bag.id}>
                    {bag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEditDialog;