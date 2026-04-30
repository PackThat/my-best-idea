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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const ItemsManagementView: React.FC = () => {
  const { 
    setView, categories, subcategories, catalog_items, setAddingCategoryId,
    addCategory, updateCategory, deleteCategory, showFavoritesOnly, setShowFavoritesOnly
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const categoryHasFavorites = (categoryId: string) => {
    return catalog_items.some(item => item.categoryId === categoryId && item.is_favorite);
  };

  const visibleCategories = useMemo(() => {
    let result = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    if (showFavoritesOnly) {
        result = result.filter(c => categoryHasFavorites(c.id));
    }
    return result;
  }, [categories, showFavoritesOnly, catalog_items]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    let items = catalog_items
      .filter(i => i.name.toLowerCase().includes(lowercasedTerm))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    if (showFavoritesOnly) {
        items = items.filter(i => i.is_favorite);
    }
    return items;
  }, [searchTerm, catalog_items, showFavoritesOnly]);

  const handleCategoryClick = (categoryId: string) => {
    setAddingCategoryId(categoryId);
    setView('catalog-subcategory-list'); 
  };

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

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (checked) newSelected[itemId] = true;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
        <Checkbox id={`catalog-item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
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
            <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Item Catalog</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4 px-4">
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search Catalog..." className="pl-11 bg-card border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="flex items-center space-x-2 px-1">
                <Checkbox id="show-favorites" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
                <Label htmlFor="show-favorites" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
                    Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
                </Label>
            </div>
        </div>

        {searchResults ? (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Matching Items ({searchResults.length})</h3>
            {searchResults.length > 0 ? (
              <Card className="p-2"><div className="space-y-1">{searchResults.map(renderItemRow)}</div></Card>
            ) : <div className="text-center py-8 text-muted-foreground"><p>No items found.</p></div>}
          </div>
        ) : (
          <div className="space-y-2">
             {visibleCategories.length > 0 ? (
                 visibleCategories.map(category => (
                    (category.name !== 'Favourites' && category.name !== 'Favorites') && (
                        <Card key={category.id} className="hover:bg-muted/50 transition-colors cursor-pointer bg-card" onClick={() => handleCategoryClick(category.id)}>
                        <CardContent className="py-2 px-4 flex justify-between items-center min-h-[40px]">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{category.name}</span>
                                {categoryHasFavorites(category.id) && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={(e) => handleEditClick(e, category)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => handleDeleteClick(e, category)}><Trash2 className="h-4 w-4" /></Button>
                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                            </div>
                        </CardContent>
                        </Card>
                    )
                 ))
             ) : (
                 <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">{showFavoritesOnly ? "No categories have favourites yet." : "No categories found."}</p>
                 </div>
             )}
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="py-4"><Label>Category Name</Label><Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} autoFocus /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button><Button onClick={handleAddCategory}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <div className="py-4"><Label>Category Name</Label><Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} autoFocus /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateCategory}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-card">
            <AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>Delete "{categoryToDelete?.name}" from Master Catalog?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemsManagementView;