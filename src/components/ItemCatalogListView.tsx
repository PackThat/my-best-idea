import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AddNewItemDialog from './AddNewItemDialog';
import EditCatalogItemDialog from './EditCatalogItemDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CatalogItem } from '@/types';

const ItemCatalogListView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    selectedCategoryId, 
    selectedSubcategoryId,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
  } = useAppContext();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const selectedSubcategory = subcategories.find(sc => sc.id === selectedSubcategoryId);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const relevantItems = catalog_items.filter(item => item.subcategory_id === selectedSubcategoryId);

  const handleAddItem = async (itemData: { name: string; notes?: string }) => {
    await addCatalogItem(itemData);
  };

  const handleUpdateItem = async (itemId: string, updates: { name: string; notes?: string }) => {
    await updateCatalogItem(itemId, updates);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteCatalogItem(itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('subcategory-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subcategories
          </Button>
          <h2 className="text-2xl font-bold">
            {selectedCategory?.name} / {selectedSubcategory?.name}
          </h2>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Master Items ({relevantItems.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relevantItems.map((item) => (
            <Card key={item.id} className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base font-medium">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingItem(item)}>
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
                            This will permanently delete "{item.name}" from your master item catalog. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
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

<AddNewItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        subcategories={subcategories}
        onAddItem={handleAddItem}
        preselectedCategoryId={selectedCategoryId || undefined}
        preselectedSubcategoryId={selectedSubcategoryId || undefined}
      />

      {editingItem && (
        <EditCatalogItemDialog
          open={!!editingItem}
          onOpenChange={() => setEditingItem(null)}
          item={editingItem}
          onSave={handleUpdateItem}
        />
      )}
    </div>
  );
};

export default ItemCatalogListView;