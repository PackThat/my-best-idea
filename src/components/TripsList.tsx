import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { InlineTripForm } from './InlineTripForm';
import { Trip } from '@/types';
import { Calendar, Edit2, Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export const TripsList: React.FC = () => {
  const { trips, loadTrip, createTrip, updateTrip, deleteTrip, isLoading } = useAppContext();
  
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);

  const handleCreateTrip = async (tripData: { name: string; date?: string }) => {
    await createTrip(tripData);
    setShowInlineForm(false);
  };
  
  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTrip && editTrip.name.trim()) {
      updateTrip(editTrip.id, { name: editTrip.name, date: editTrip.date });
      setEditTrip(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    // The current time is 2:19 PM Tuesday, July 29, 2025 in Echuca, Victoria, Australia.
    return new Date(dateString).toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col bg-card">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                 <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Trips</h2>
        {!showInlineForm && (
          <Button onClick={() => setShowInlineForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        )}
      </div>

      {showInlineForm && (
        <InlineTripForm 
          onCancel={() => setShowInlineForm(false)}
          onCreateTrip={handleCreateTrip}
        />
      )}

      {trips.length === 0 && !showInlineForm ? (
        <Card className="bg-card">
          <CardContent className="pt-6 text-center text-muted-foreground">
            No trips created yet. Create one to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg cursor-pointer" onClick={() => loadTrip(trip.id)}>
                  {trip.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground pt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(trip.date)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <div className="flex items-center space-x-2">
                  <Button variant="default" size="sm" onClick={() => loadTrip(trip.id)} className="flex-grow">Select</Button>
                  
                  <Dialog open={!!editTrip && editTrip.id === trip.id} onOpenChange={(isOpen) => !isOpen && setEditTrip(null)}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline" onClick={() => setEditTrip(trip)}><Edit2 className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card text-card-foreground">
                      <DialogHeader><DialogTitle>Edit Trip</DialogTitle></DialogHeader>
                      <form onSubmit={handleConfirmEdit}>
                        <div className="grid gap-4 py-4">
                          <Label htmlFor="name">Trip Name</Label>
                          <Input id="name" value={editTrip?.name || ''} onChange={(e) => setEditTrip(t => t ? {...t, name: e.target.value} : null)} />
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" type="date" value={editTrip?.date?.split('T')[0] || ''} onChange={(e) => setEditTrip(t => t ? {...t, date: e.target.value} : null)} />
                        </div>
                        <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card text-card-foreground">
                      <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the "{trip.name}" trip and all its data.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTrip(trip.id)}>Delete Trip</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};