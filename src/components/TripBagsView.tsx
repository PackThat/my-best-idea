import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import AddBagDialog from './AddBagDialog';
import EditBagDialog from './EditBagDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bag } from '@/types';

interface TripBagsViewProps {
  onBack: () => void;
  onBagClick: (bagId: string) => void;
}

const TripBagsView: React.FC<TripBagsViewProps> = ({ onBack, onBagClick }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddBagDialog, setShowAddBagDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const {
    bags,
    items,
    categories,
    subcategories,
    people,
    tripBags,
    addItem,
    addItemToPacking,
    updateBag,
    removeBagFromTrip,
  } = useAppContext();

  // Filter bags that are added to this trip using tripBags array
  const currentTripBags = bags.filter(bag => tripBags.includes(bag.id));
  console.log('🎒 TripBagsView - currentTripBags:', currentTripBags);
  console.log('🎒 TripBagsView - tripBags array:', tripBags);

  const getBagStats = (bagId: string) => {
    const bagItems = items.filter(item => item.bagId === bagId);
    const packedCount = bagItems.filter(item => item.packed).length;
    const totalCount = bagItems.length;
    return { packed: packedCount, total: totalCount };
  };

  const handleEditBag = (bag: Bag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBag(bag);
    setShowEditDialog(true);
  };

  const handleSaveBagEdit = (bagId: string, newName: string) => {
    updateBag(bagId, { name: newName });
  };

  const handleRemoveFromTrip = (bagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBagFromTrip(bagId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Trip Bags ({currentTripBags.length})</h2>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => setShowAddBagDialog(true)}
          className="flex-1 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD BAG
        </Button>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD ITEM
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTripBags.map((bag) => {
          const stats = getBagStats(bag.id);
          return (
            <Card key={bag.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2" onClick={() => onBagClick(bag.id)}>
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>{bag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditBag(bag, e)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Bag from Trip</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {bag.name} from this trip? This will only remove it from the trip, not delete the bag entirely.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleRemoveFromTrip(bag.id, e)}>
                            Remove from Trip
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => onBagClick(bag.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items Progress</span>
                  <Badge variant={stats.packed === stats.total && stats.total > 0 ? "default" : "secondary"}>
                    {stats.packed}/{stats.total}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {currentTripBags.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-4">No bags added to this trip yet.</p>
            <p className="text-sm text-gray-400">Click "ADD BAG" to get started!</p>
          </CardContent>
        </Card>
      )}

      <AddBagDialog
        open={showAddBagDialog}
        onOpenChange={setShowAddBagDialog}
      />

      {editingBag && (
        <EditBagDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          bag={editingBag}
          onSave={handleSaveBagEdit}
        />
      )}

      <ItemSelectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        items={items}
        people={people}
        bags={bags}
        onAddItemToPacking={addItemToPacking}
        onAddNewItem={addItem}
      />
    </div>
  );
};

export default TripBagsView;