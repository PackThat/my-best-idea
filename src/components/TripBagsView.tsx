// src/components/TripBagsView.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Plus, Trash2, Briefcase, X, Edit2, ArrowLeft } from 'lucide-react';
import { BagSelector } from './BagSelector';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Bag } from '@/types';
import EditBagDialog from './EditBagDialog';

interface TripBagsViewProps {
  onBagClick: (bagId: string) => void;
}

export const TripBagsView: React.FC<TripBagsViewProps> = ({ onBagClick }) => {
  const {
    currentTrip,
    bags,
    addBagToTrip,
    removeBagFromTrip,
    setView,
    updateBag,
    items,
  } = useAppContext();

  const [showBagSelector, setShowBagSelector] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);

  const tripBags = useMemo(() => {
    if (!currentTrip || !currentTrip.bagIds) {
      return [];
    }
    return currentTrip.bagIds
      .map(bagId => bags.find(bag => bag.id === bagId))
      .filter((bag): bag is Bag => bag !== undefined);
  }, [currentTrip, bags]);

  const getBagStats = (bagId: number) => {
    const bagItems = items.filter(item => item.bagId === bagId);
    const packedCount = bagItems.filter(item => item.packed).length;
    const totalCount = bagItems.length;
    return { packed: packedCount, total: totalCount };
  };

  const handleBagSelected = async (bagId: number) => {
    await addBagToTrip(bagId);
    setShowBagSelector(false);
  };

  const handleEditBag = (bag: Bag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBag(bag);
  };

  const handleSaveBagEdit = (bagId: number, updates: Partial<Bag>) => {
    updateBag(bagId, updates);
    setEditingBag(null);
  };

  const handleRemoveBagFromTrip = async (bagId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBagFromTrip(bagId);
  };

  if (!currentTrip) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-4">
        <CardTitle className="text-xl text-muted-foreground">No trip selected.</CardTitle>
        <CardDescription className="text-muted-foreground">Please select a trip from "My Trips" to manage bags.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('trip-home')}>
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
        </div>
      </div>

      {showBagSelector && (
        <Card className="bg-card">
          <CardHeader><CardTitle>Select or Add Bag</CardTitle></CardHeader>
          <CardContent>
            <BagSelector
              bags={bags}
              onBagSelected={handleBagSelected}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tripBags.map((bag) => {
          const stats = getBagStats(bag.id);
          return (
            <Card key={bag.id} className="flex flex-col bg-card">
              <CardHeader className="flex-grow pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                          <AlertDialogDescription>Are you sure you want to remove {bag.name} from this trip?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleRemoveBagFromTrip(bag.id, e)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm pt-2">
                  {stats.total > 0 ? (
                    <>
                      <Badge variant={stats.packed === stats.total ? "default" : "secondary"}>
                        {stats.packed}/{stats.total}
                      </Badge>
                      <span className="text-muted-foreground">items packed</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No items assigned</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full" onClick={() => onBagClick(String(bag.id))}>
                  Select
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tripBags.length === 0 && !showBagSelector && (
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
    </div>
  );
};

export default TripBagsView;