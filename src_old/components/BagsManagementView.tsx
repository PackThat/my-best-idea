import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Edit2, Trash2, X } from 'lucide-react';
import EditBagDialog from './EditBagDialog';
import InlineBagForm from './InlineBagForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bag } from '@/types';
import { cn } from '@/lib/utils';

const BagsManagementView: React.FC = () => {
  const { bags, createBag, updateBag, deleteBag } = useAppContext();
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdate = (bagId: number, updates: Partial<Bag>) => {
    updateBag(bagId, updates);
  };

  const handleAdd = async (bagData: { name: string, color?: string }) => {
    await createBag(bagData);
    setShowAddForm(false);
  };

  const sortedBags = [...bags].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full md:max-w-screen-md mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage All Bags</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="default">
            {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showAddForm ? 'Cancel' : 'Add New Bag'}
          </Button>
        </div>

        {showAddForm && (
          <InlineBagForm
            onCancel={() => setShowAddForm(false)}
            onSave={handleAdd}
          />
        )}

        <div className="border rounded-md bg-card">
          <Table>
            <TableBody>
              {sortedBags.map((bag) => (
                <TableRow key={bag.id}>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-3">
                      {bag.color && (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bag.color }} />
                      )}
                      <span className="font-medium text-card-foreground">{bag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {editingBag && (
          <EditBagDialog
            open={!!editingBag}
            onOpenChange={() => setEditingBag(null)}
            bag={editingBag}
            onSave={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default BagsManagementView;