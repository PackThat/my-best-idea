import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Briefcase, Edit2, Trash2, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bag } from '@/types';

interface BagsManagementViewProps {
  onBack: () => void;
}

const BagsManagementView: React.FC<BagsManagementViewProps> = ({ onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { bags, items, updateBag, deleteBag } = useAppContext();

  const handleEdit = (bag: Bag) => {
    setEditingId(bag.id);
    setEditName(bag.name);
  };

  const handleSave = (bagId: string) => {
    if (editName.trim()) {
      updateBag(bagId, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (bagId: string) => {
    deleteBag(bagId);
  };

  const getBagItemCount = (bagId: string) => {
    return items.filter(item => item.bagId === bagId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Manage Bags ({bags.length})</h2>
      </div>
      
      <div className="grid gap-4">
        {bags.map((bag) => {
          const itemCount = getBagItemCount(bag.id);
          const isEditing = editingId === bag.id;
          
          return (
            <Card key={bag.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span>{bag.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(bag.id)}
                          disabled={!editName.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(bag)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bag</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{bag.name}"? 
                                {itemCount > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {' '}This will also delete {itemCount} associated item(s).
                                  </span>
                                )}
                                {' '}This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(bag.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} associated
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {bags.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No bags found in the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BagsManagementView;