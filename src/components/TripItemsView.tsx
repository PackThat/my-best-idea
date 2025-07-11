import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Edit2, Trash2, User, Backpack } from 'lucide-react';
import { Item } from '@/types';
// This import is now corrected. We import the component (which is named AddItemDialog inside the file)
// and give it a local name of TripAddItemDialog to match the filename.
import { AddItemDialog as TripAddItemDialog } from './TripAddItemDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TripItemsViewProps {
  onBack: () => void;
}

const TripItemsView: React.FC<TripItemsViewProps> = ({ onBack }) => {
  const { 
    items, 
    updateItem, 
    deleteItem,
    addItemToTrip,
    people, 
    bags,
    categories,
    subcategories
  } = useAppContext();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handlePackedChange = (item: Item) => {
    updateItem(item.id, { packed: !item.packed });
  };
  
  const getPersonName = (personId?: string) => {
    if (!personId) return null;
    return people.find(p => p.id === personId)?.name;
  };

  const getBagName = (bagId?: string) => {
    if (!bagId) return null;
    return bags.find(b => b.id === bagId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip
          </Button>
          <h2 className="text-2xl font-bold">Packing List</h2>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      <Card className="bg-card">
        <CardContent className="p-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.packed}
                    onCheckedChange={() => handlePackedChange(item)}
                    className="w-5 h-5"
                  />
                  <label htmlFor={`item-${item.id}`} className="font-medium">{item.name}</label>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {item.personId && <div className="flex items-center gap-1"><User className="h-4 w-4"/>{getPersonName(item.personId)}</div>}
                  {item.bagId && <div className="flex items-center gap-1"><Backpack className="h-4 w-4"/>{getBagName(item.bagId)}</div>}
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4"/></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete "{item.name}" from this trip's packing list?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteItem(item.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No items added to this trip yet.</p>
          )}
        </CardContent>
      </Card>
      
      <TripAddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        subcategories={subcategories}
        bags={bags}
        people={people}
        items={items}
        onAddItem={addItemToTrip}
        // These are not needed for the trip dialog, but we pass them to satisfy the component's props
        onAddPerson={() => {}}
        onAddCategory={() => {}}
        onAddSubcategory={() => {}}
        onAddBag={() => {}}
        onAddItemToPacking={() => {}}
        onAddNewItem={() => {}}
      />
    </div>
  );
};

export default TripItemsView;