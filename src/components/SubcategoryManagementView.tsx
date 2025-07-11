import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import AddSubcategoryDialog from './AddSubcategoryDialog';
import EditSubcategoryDialog from './EditSubcategoryDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Subcategory } from '@/types';

const SubcategoryManagementView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    selectedCategoryId, 
    selectSubcategory, // Get the new function
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  } = useAppContext();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const relevantSubcategories = subcategories.filter(sc => sc.category_id === selectedCategoryId);

  const handleAdd = async (name: string) => {
    await addSubcategory({ name });
  };

  const handleUpdate = async (id: string, name: string) => {
    await updateSubcategory(id, { name });
  };

  const handleDelete = async (id: string) => {
    await deleteSubcategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('items-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <h2 className="text-2xl font-bold">{selectedCategory ? selectedCategory.name : 'Subcategories'}</h2>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Subcategories ({relevantSubcategories.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relevantSubcategories.map((subcategory) => (
            // The card is now clickable
            <div key={subcategory.id} onClick={() => selectSubcategory(subcategory.id)} className="cursor-pointer">
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subcategory.name}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingSubcategory(subcategory); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card text-card-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the "{subcategory.name}" subcategory and all items within it. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDelete(subcategory.id); }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <AddSubcategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAdd}
        categoryName={selectedCategory?.name}
      />

      {editingSubcategory && (
        <EditSubcategoryDialog
          open={!!editingSubcategory}
          onOpenChange={() => setEditingSubcategory(null)}
          subcategory={editingSubcategory}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default SubcategoryManagementView;