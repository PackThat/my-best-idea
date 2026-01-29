import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Search, Plus, ChevronRight, Star, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CatalogItem, Category } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const ItemsManagementView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    setAddingCategoryId,
    addCategory,
    updateCategory,
    deleteCategory
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  
  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sort Categories Alphabetically
  const sortedCategories = useMemo(() => 
    [...categories].sort((a, b) => a.name.localeCompare(b.name)), 
  [categories]);

  // Search Logic
  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    return catalog_items
      .filter(i => i.name.toLowerCase().includes(lowercasedTerm))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, catalog_items]);

  const handleCategoryClick = (categoryId: string) => {
    setAddingCategoryId(categoryId);
    // Explicitly set view to match what PackingApp expects
    setView('catalog-subcategory-list' as any); 
  };

  // --- CRUD Handlers ---

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    setIsProcessing(true);
    await addCategory(categoryName);
    setCategoryName('');
    setIsProcessing(false);
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToEdit(category);
    setCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!categoryToEdit || !categoryName.trim()) return;
    setIsProcessing(true);
    await updateCategory(categoryToEdit.id, categoryName);
    setCategoryName('');
    setCategoryToEdit(null);
    setIsProcessing(false);
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  // --- Selection Handlers ---

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (checked) newSelected[itemId] = true;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
        <Checkbox 
          id={`catalog-item-${item.id}`} 
          checked={isSelected} 
          onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} 
        />
        <Label htmlFor={`catalog-item-${item.id}`} className="font-normal cursor-pointer flex-grow">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.is_favorite && <Star className={cn("h-4 w-4 fill-icon-active text-icon-active")} />}
          </div>
          <div className="text-xs text-muted-foreground">
            {category?.name || "Uncategorized"}{subcategory && ` / ${subcategory.name}`}
          </div>
        </Label>
        
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  };

  // Logic to find the Favorites category if it exists
  const favoritesCategory = categories.find(c => c.name === 'Favourites');

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Item Catalog</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
        </Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        {/* Search Bar - CONSISTENT STYLING APPLIED */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Catalog..."
            // Using the exact same classes as CatalogItemListView for perfect consistency
            className="pl-11 bg-search-background text-foreground border-transparent placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:bg-card focus-visible:border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content Area */}
        {searchResults ? (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Matching Items ({searchResults.length})</h3>
            {searchResults.length > 0 ? (
              <Card className="p-2">
                <div className="space-y-1">
                  {searchResults.map(renderItemRow)}
                </div>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                  <p>No items found matching "{searchTerm}"</p>
                  <Button variant="link" className="mt-2" onClick={() => console.log("Add New Item with name:", searchTerm)}>
                      + Create "{searchTerm}"
                  </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
             {/* Favorites Card - NOW ACTIVE */}
             <Card 
                  className="hover:bg-muted/50 transition-colors cursor-pointer bg-card"
                  onClick={() => {
                      if (favoritesCategory) {
                          handleCategoryClick(favoritesCategory.id);
                      } else {
                          console.warn("Favourites category not found in list");
                      }
                  }}
                >
                  <CardContent className="py-2 px-4 flex justify-between items-center min-h-[40px]">
                      <span className="font-medium">Favorites</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
             </Card>

             {/* Categories List */}
             {sortedCategories.map(category => (
                <Card 
                  key={category.id} 
                  className="hover:bg-muted/50 transition-colors cursor-pointer bg-card"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="py-2 px-4 flex justify-between items-center min-h-[40px]">
                      <span className="font-medium">{category.name}</span>
                      
                      {/* Edit/Delete Icons - Only visible for actual categories */}
                      <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={(e) => handleEditClick(e, category)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteClick(e, category)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                      </div>
                  </CardContent>
                </Card>
             ))}
          </div>
        )}
      </div>

      {/* Bulk Action Footer */}
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="w-full md:max-w-screen-md mx-auto flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <p className="font-semibold text-sm">{getSelectedCount()} items selected</p>
             </div>
             <div className="flex gap-2">
                 <Button variant="destructive">Delete Selected</Button>
                 <Button variant="secondary">Move Selected</Button>
             </div>
          </div>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={!categoryName.trim() || isProcessing}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-cat-name">Category Name</Label>
            <Input id="edit-cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCategory} disabled={!categoryName.trim() || isProcessing}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Delete Confirmation Alert */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-card text-card-foreground">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will delete "{categoryToDelete?.name}". Are you sure?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemsManagementView;