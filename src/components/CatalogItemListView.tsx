import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const CatalogItemListView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    addingCategoryId, 
    addingSubcategoryId,
    addCatalogItem,
    deleteCatalogItem,
    updateCatalogItem
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  
  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);

  const currentCategory = categories.find(c => c.id === addingCategoryId);
  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);

  // Filter items logic
  const visibleItems = useMemo(() => {
    let items = catalog_items.filter(i => i.subcategoryId === addingSubcategoryId);

    if (searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(lowerTerm));
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog_items, searchTerm, addingSubcategoryId]);

  // LOGIC: Show button if Search is empty (Drill Down) OR Search is 3+ chars
  const showAddButton = searchTerm.length === 0 || searchTerm.length >= 3;

  if (!currentCategory || !currentSubcategory) {
    setView('catalog-subcategory-list');
    return null;
  }

  // --- Handlers ---

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (checked) newSelected[itemId] = true;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const handleEdit = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    console.log("Edit Item:", item.name);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteCatalogItem(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleOpenAddDialog = () => {
      setNewItemName(searchTerm); 
      setIsAddDialogOpen(true);
  };

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return;
    setIsAdding(true);
    await addCatalogItem({
        name: newItemName,
        categoryId: currentCategory.id,
        subcategoryId: currentSubcategory.id
    });
    setNewItemName('');
    setIsAdding(false);
    setIsAddDialogOpen(false);
  };

  const toggleFavorite = async (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    e.preventDefault(); 
    await updateCatalogItem(item.id, { is_favorite: !item.is_favorite });
  };

  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="default" onClick={() => setView('catalog-subcategory-list')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{currentSubcategory.name}</h2>
                <span className="text-sm text-muted-foreground">{currentCategory.name}</span>
            </div>
        </div>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--search-foreground))]" />
          <Input
            placeholder={`Search ${currentSubcategory.name} (min 3 chars)...`}
            className="pl-11 bg-[hsl(var(--search-background))] text-[hsl(var(--search-foreground))] border-transparent placeholder:text-[hsl(var(--search-foreground))]/70 focus-visible:bg-[hsl(var(--search-active-background))] focus-visible:border-[hsl(var(--search-active-border))] focus-visible:ring-[hsl(var(--search-active-border))]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Item List */}
        <div className="space-y-1">
            {visibleItems.length > 0 ? (
                visibleItems.map(item => {
                    const isSelected = !!selectedItems[item.id];
                    return (
                        <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
                            <Checkbox 
                                id={`item-${item.id}`} 
                                checked={isSelected} 
                                onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} 
                            />
                            <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow select-none">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.name}</span>
                                    <div onClick={(e) => toggleFavorite(e, item)} className="cursor-pointer">
                                        <Star className={cn("h-4 w-4 hover:scale-110 transition-transform", item.is_favorite ? "fill-icon-active text-icon-active" : "text-muted-foreground/20 hover:text-icon-active")} />
                                    </div>
                                </div>
                            </Label>
                            
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={(e) => handleEdit(e, item)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => handleDeleteClick(e, item)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No items found.</p>
                </div>
            )}

            {/* THE ADD BUTTON - Appended separately so it never disappears due to list logic */}
            {showAddButton && (
                 <div className="pt-6 pb-2">
                    <Button 
                        variant="outline" 
                        className="w-full border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary/50"
                        onClick={handleOpenAddDialog}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item {searchTerm.length >= 3 ? `"${searchTerm}"` : ""}
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Bulk Action Footer */}
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="w-full md:max-w-screen-md mx-auto flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <p className="font-semibold text-sm">{getSelectedCount()} items selected</p>
             </div>
             <div className="flex gap-2">
                 <Button variant="destructive">Mass Delete</Button>
                 <Button variant="secondary">Mass Move</Button>
             </div>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
                Adding to <strong>{currentSubcategory.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="item-name" className="mb-2 block">Item Name</Label>
            <Input 
                id="item-name" 
                value={newItemName} 
                onChange={(e) => setNewItemName(e.target.value)} 
                placeholder="e.g. Reading Glasses"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewItem} disabled={!newItemName.trim() || isAdding}>
                {isAdding ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="bg-card text-card-foreground">
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete "{itemToDelete?.name}" from the master catalog.
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

export default CatalogItemListView;