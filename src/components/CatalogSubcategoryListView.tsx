import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChevronRight, Pencil, Trash2, Plus, Search, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Subcategory, CatalogItem } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const CatalogSubcategoryListView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items,
    addingCategoryId, 
    setAddingSubcategoryId,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    deleteCatalogItem,
    updateCatalogItem
  } = useAppContext();

  const selectedCategory = categories.find(c => c.id === addingCategoryId);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subToEdit, setSubToEdit] = useState<Subcategory | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subcategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Logic: Check if a Subcategory has any favorites ---
  const subcategoryHasFavorites = (subId: string) => {
    return catalog_items.some(item => item.subcategoryId === subId && item.is_favorite);
  };

  // --- 1. GLOBAL SEARCH LOGIC (Overrides Local View) ---
  const globalSearchResults = useMemo(() => {
    if (searchTerm.length < 2) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // Search ALL items, not just this category
    let items = catalog_items
      .filter(i => i.name.toLowerCase().includes(lowercasedTerm))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (showFavoritesOnly) {
        items = items.filter(i => i.is_favorite);
    }
    return items;
  }, [searchTerm, catalog_items, showFavoritesOnly]);

  // --- 2. LOCAL SUBCATEGORY LOGIC (Default View) ---
  const visibleSubcategories = useMemo(() => {
    // Filter by Parent Category
    let subs = subcategories.filter(sc => sc.categoryId === addingCategoryId);

    // Filter by Favorites Toggle
    if (showFavoritesOnly) {
        subs = subs.filter(s => subcategoryHasFavorites(s.id));
    }

    // Sort Alphabetically
    return subs.sort((a, b) => a.name.localeCompare(b.name));
  }, [subcategories, addingCategoryId, showFavoritesOnly, catalog_items]);

  if (!selectedCategory) {
    setView('items-management');
    return null;
  }

  // --- Handlers ---

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingSubcategoryId(subcategory.id);
    setView('catalog-item-list' as any);
  };

  // Subcategory CRUD
  const handleAddSubcategory = async () => {
    if (!subName.trim()) return;
    setIsProcessing(true);
    await addSubcategory(selectedCategory.id, subName);
    setSubName('');
    setIsProcessing(false);
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, sub: Subcategory) => {
    e.stopPropagation(); 
    setSubToEdit(sub);
    setSubName(sub.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubcategory = async () => {
    if (!subToEdit || !subName.trim()) return;
    setIsProcessing(true);
    await updateSubcategory(subToEdit.id, subName);
    setSubName('');
    setSubToEdit(null);
    setIsProcessing(false);
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, sub: Subcategory) => {
    e.stopPropagation(); 
    setSubToDelete(sub);
  };

  const confirmDelete = async () => {
    if (!subToDelete) return;
    await deleteSubcategory(subToDelete.id);
    setSubToDelete(null);
  };

  // Item Handlers (For Search Results)
  const toggleFavorite = async (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    e.preventDefault(); 
    await updateCatalogItem(item.id, { is_favorite: !item.is_favorite });
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (checked) newSelected[itemId] = true;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  // --- Render Helper for Search Results ---
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
            <div onClick={(e) => toggleFavorite(e, item)} className="cursor-pointer">
                 <Star className={cn("h-4 w-4 hover:scale-110 transition-transform", item.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20 hover:text-yellow-400")} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {category?.name || "Uncategorized"}{subcategory && ` / ${subcategory.name}`}
          </div>
        </Label>
        
        <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteCatalogItem(item.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="default" onClick={() => setView('items-management')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                <span className="text-sm text-muted-foreground">Subcategories</span>
            </div>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
        </Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        {/* Search Bar & Favorites Filter */}
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Catalog"
                    className="pl-11 bg-search-background text-foreground border-transparent placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:bg-card focus-visible:border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* THE TOGGLE SWITCH */}
            <div className="flex items-center space-x-2 px-1">
                <Checkbox 
                    id="show-favorites-sub" 
                    checked={showFavoritesOnly}
                    onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))}
                />
                <Label 
                    htmlFor="show-favorites-sub" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none flex items-center gap-2"
                >
                    Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                </Label>
            </div>
        </div>

        {/* --- CONDITIONAL RENDERING --- */}
        {/* IF Searching: Show Universal Item List */}
        {/* ELSE: Show Local Subcategory List */}
        
        {globalSearchResults ? (
             <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Universal Results ({globalSearchResults.length})
                </h3>
                {globalSearchResults.length > 0 ? (
                    <Card className="p-2">
                        <div className="space-y-1">
                        {globalSearchResults.map(renderItemRow)}
                        </div>
                    </Card>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No items found matching "{searchTerm}"</p>
                    </div>
                )}
             </div>
        ) : (
             <div className="space-y-2">
                {visibleSubcategories.length > 0 ? (
                    visibleSubcategories.map(subcategory => (
                    <Card 
                        key={subcategory.id} 
                        className="hover:bg-muted/50 transition-colors cursor-pointer bg-card"
                        onClick={() => handleSubcategoryClick(subcategory)}
                    >
                        <CardContent className="py-2 px-4 flex justify-between items-center min-h-[40px]">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{subcategory.name}</span>
                            {showFavoritesOnly && (
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={(e) => handleEditClick(e, subcategory)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteClick(e, subcategory)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                        </div>
                        </CardContent>
                    </Card>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        {showFavoritesOnly ? (
                            <div className="space-y-2">
                                <Star className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                                <p className="text-muted-foreground">No subcategories match your favourites.</p>
                                <Button variant="link" onClick={() => setShowFavoritesOnly(false)}>Show all</Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No subcategories found.</p>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader><DialogTitle>Add Subcategory</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="sub-name">Name</Label>
            <Input id="sub-name" value={subName} onChange={(e) => setSubName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubcategory} disabled={!subName.trim() || isProcessing}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader><DialogTitle>Edit Subcategory</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-sub-name">Name</Label>
            <Input id="edit-sub-name" value={subName} onChange={(e) => setSubName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSubcategory} disabled={!subName.trim() || isProcessing}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!subToDelete} onOpenChange={(open) => !open && setSubToDelete(null)}>
        <AlertDialogContent className="bg-card text-card-foreground">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will delete "{subToDelete?.name}" and ALL items inside it.
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

export default CatalogSubcategoryListView;