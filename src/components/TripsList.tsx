import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { InlineTripForm } from './InlineTripForm';
import { Trip } from '@/types';
import { Calendar, Copy, RotateCcw, Trash2, Play, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const TripsList: React.FC = () => {
  const { trips, loadTrip, resetTrip, cloneTrip, deleteTrip } = useAppContext();
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneTripId, setCloneTripId] = useState('');
  const [cloneName, setCloneName] = useState('');

  const handleClone = (trip: Trip) => {
    setCloneTripId(trip.id);
    setCloneName(`${trip.name} (Copy)`);
    setCloneDialogOpen(true);
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloneName.trim() && cloneTripId) {
      cloneTrip(cloneTripId, cloneName.trim());
      setCloneDialogOpen(false);
      setCloneTripId('');
      setCloneName('');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getPackedCount = (trip: Trip) => {
    const packed = trip.items.filter(item => item.packed).length;
    const total = trip.items.length;
    return { packed, total };
  };

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
        <InlineTripForm onCancel={() => setShowInlineForm(false)} />
      )}

      {trips.length === 0 && !showInlineForm ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No trips created yet.</p>
              <p className="text-sm mt-2">Create your first trip to get started!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const { packed, total } = getPackedCount(trip);
            return (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                    <Badge variant={packed === total && total > 0 ? 'default' : 'secondary'}>
                      {packed}/{total}
                    </Badge>
                  </div>
                  {trip.date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(trip.date)}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      size="sm"
                      onClick={() => loadTrip(trip.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetTrip(trip.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClone(trip)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{trip.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTrip(trip.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(trip.createdAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clone Trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cloneName">New Trip Name</Label>
              <Input
                id="cloneName"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                placeholder="Enter new trip name"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setCloneDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Clone Trip</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};