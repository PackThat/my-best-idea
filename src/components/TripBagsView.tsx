// src/components/TripBagsView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Plus, Trash2, Briefcase, X } from 'lucide-react';
// These imports are no longer needed here as BagSelector handles new bag creation internally
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { CirclePicker } from 'react-color';

import { BagSelector } from './BagSelector'; // Make sure this path is correct
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';


export const TripBagsView: React.FC = () => {
  const {
    currentTrip,
    bags, // We are getting 'bags' from the AppContext here
    addBagToTrip,
    removeBagFromTrip,
    setView,
  } = useAppContext();

  const [showBagSelector, setShowBagSelector] = useState(false);

  const tripBags = useMemo(() => {
    if (!currentTrip || !currentTrip.bagIds) {
      return [];
    }
    return currentTrip.bagIds
      .map(bagId => bags.find(bag => bag.id === bagId))
      .filter((bag): bag is typeof bags[0] => bag !== undefined);
  }, [currentTrip, bags]);

  const bagItemCounts = useMemo(() => {
    const counts: { [key: number]: number } = {};
    if (currentTrip && currentTrip.items) {
      currentTrip.items.forEach(item => {
        if (item.bagId) {
          counts[item.bagId] = (counts[item.bagId] || 0) + item.quantity;
        }
      });
    }
    return counts;
  }, [currentTrip]);

  const bagPackedCounts = useMemo(() => {
    const counts: { [key: number]: number } = {};
    if (currentTrip && currentTrip.items) {
      currentTrip.items.forEach(item => {
        if (item.bagId && item.packed) {
          counts[item.bagId] = (counts[item.bagId] || 0) + item.quantity;
        }
      });
    }
    return counts;
  }, [currentTrip]);

  const handleBagSelected = async (bagId: number) => {
    await addBagToTrip(bagId);
    setShowBagSelector(false);
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
            <Briefcase className="h-4 w-4 mr-2" />
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
            {/* THIS IS THE CRITICAL FIX: Passing the 'bags' prop */}
            <BagSelector
              bags={bags} // <--- bags prop is now correctly passed from useAppContext
              onBagSelected={handleBagSelected}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tripBags.map((bag) => {
          const stats = {
            total: bagItemCounts[bag.id] || 0,
            packed: bagPackedCounts[bag.id] || 0
          };
          return (
            <Card key={bag.id} className="hover:shadow-lg transition-all cursor-pointer bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {bag.color && ( <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bag.color }} /> )}
                    <Briefcase className="h-5 w-5" />
                    <span>{bag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
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
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items Progress</span>
                  <Badge variant={stats.packed === stats.total && stats.total > 0 ? "default" : "secondary"}>{stats.packed}/{stats.total}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentTrip && tripBags.length === 0 && !showBagSelector ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No bags added to this trip yet.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default TripBagsView;