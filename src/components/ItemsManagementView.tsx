import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddCategoryDialog from './AddCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Category } from '@/types';

export const ItemsManagementView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, selectCategory, clearCurrentTrip } = useAppContext();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = async (name: string) => {
    await addCategory({ name });
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    await updateCategory(id, { name });
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Item Catalog</h2>
        <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
            </Button>
            <Button variant="outline" onClick={() => clearCurrentTrip()}>Back to My Trips</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Categories ({categories.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
                <Card key={category.id} className="bg-card hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {/* This makes the name clickable */}
                            <span 
                              className="cursor-pointer hover:underline" 
                              onClick={() => selectCategory(category.id)}
                            >
                              {category.name}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingCategory(category)}>
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
                                        This will permanently delete the "{category.name}" category and all subcategories and items within it. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
            ))}
        </div>
      </div>

      <AddCategoryDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddCategory}
      />

      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
          category={editingCategory}
          onSave={handleUpdateCategory}
        />
      )}
    </div>
  );
};

export default ItemsManagementView;