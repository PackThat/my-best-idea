import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Plus, Edit2, Trash2, X } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import BagSelector from './BagSelector';
import EditBagDialog from './EditBagDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bag } from '@/types';

interface TripBagsViewProps {
  onBack: () => void;
  onBagClick: (bagId: string) => void;
}

const TripBagsView: React.FC<TripBagsViewProps> = ({ onBack, onBagClick }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBagSelector, setShowBagSelector] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const {
    bags, people, items, categories, subcategories, tripBags,
    addBag, addExistingBagToTrip, updateBag, removeBagFromTrip, addItem,
  } = useAppContext();

  const currentTripBags = bags.filter(bag => tripBags.includes(bag.id));

  const getBagStats = (bagId: string) => {
    const bagItems = items.filter(item => item.bagId === bagId);
    const packedCount = bagItems.filter(item => item.packed).length;
    const totalCount = bagItems.length;
    return { packed: packedCount, total: totalCount };
  };
  
  const handleAddNewBag = async (bagData: { name: string; color?: string }) => {
    await addBag(bagData);
    setShowBagSelector(false);
  };

  const handleBagSelect = (bagId: string) => {
    addExistingBagToTrip(bagId);
    setShowBagSelector(false);
  };

  const handleEditBag = (bag: Bag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBag(bag);
  };

  const handleSaveBagEdit = (bagId: string, updates: Partial<Bag>) => {
    updateBag(bagId, updates);
  };

  const handleRemoveFromTrip = (bagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBagFromTrip(bagId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip
          </Button>
          <h2 className="text-2xl font-bold">Bags</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBagSelector(!showBagSelector)}>
            {showBagSelector ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
            {showBagSelector ? 'Cancel' : 'Add Bag'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      
      {showBagSelector && (
        <Card className="bg-card">
          <CardHeader><CardTitle>Select or Add Bag</CardTitle></CardHeader>
          <CardContent>
            <BagSelector
              bags={bags}
              onBagSelect={handleBagSelect}
              onAddNewBag={handleAddNewBag}
              placeholder="Choose a bag to add..."
            />
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTripBags.map((bag) => {
          const stats = getBagStats(bag.id);
          return (
            <Card key={bag.id} className="hover:shadow-lg transition-all cursor-pointer bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2" onClick={() => onBagClick(bag.id)}>
                    {bag.color && ( <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bag.color }} /> )}
                    <Briefcase className="h-5 w-5" />
                    <span>{bag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => handleEditBag(bag, e)}><Edit2 className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
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
                          <AlertDialogAction onClick={(e) => handleRemoveFromTrip(bag.id, e)}>Remove from Trip</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => onBagClick(bag.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items Progress</span>
                  <Badge variant={stats.packed === stats.total && stats.total > 0 ? "default" : "secondary"}>{stats.packed}/{stats.total}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {currentTripBags.length === 0 && !showBagSelector && (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No bags added to this trip yet.</p>
          </CardContent>
        </Card>
      )}

      {editingBag && (
        <EditBagDialog
          open={!!editingBag}
          onOpenChange={() => setEditingBag(null)}
          bag={editingBag}
          onSave={handleSaveBagEdit}
        />
      )}

      {showAddDialog && (
          <ItemSelectionDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              categories={categories}
              subcategories={subcategories}
              items={items}
              people={people}
              bags={bags}
              onAddItemToPacking={()=>{}}
              onAddNewItem={addItem}
          />
      )}
    </div>
  );
};

export default TripBagsView;