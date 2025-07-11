import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import EditBagDialog from './EditBagDialog';
import AddBagDialog from './AddBagDialog'; // Import the new dialog
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bag } from '@/types';

const BagsManagementView: React.FC = () => {
  const { bags, addBag, updateBag, deleteBag } = useAppContext();
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for the new dialog

  const handleUpdate = (bagId: string, updates: Partial<Bag>) => {
    updateBag(bagId, updates);
  };

  const handleAdd = async (bagData: { name: string, color?: string }) => {
    await addBag(bagData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage All Bags</h2>
        {/* This button now opens our new dialog */}
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Bag
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bags.map((bag) => (
          <Card key={bag.id} className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {bag.color && (
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bag.color }} />
                  )}
                  <Briefcase className="h-5 w-5" />
                  <span>{bag.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingBag(bag)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card text-card-foreground">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{bag.name}" and remove it and all its assigned items from every trip. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteBag(bag.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Add the new dialog to the page */}
      <AddBagDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAdd}
      />

      {editingBag && (
        <EditBagDialog
          open={!!editingBag}
          onOpenChange={() => setEditingBag(null)}
          bag={editingBag}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default BagsManagementView;