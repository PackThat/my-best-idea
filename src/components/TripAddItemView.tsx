import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Search, Star, Minus, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CatalogItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import AddNewItemDialog from './AddNewItemDialog';
import EditCatalogItemDialog from './EditCatalogItemDialog';
import { AssignmentFooter } from './AssignmentFooter';

export const TripAddItemView: React.FC = () => {
  const { 
    setView, categories, subcategories, catalog_items, addingCategoryId, addingSubcategoryId,
    setAddingCategoryId, addCatalogItem, deleteCatalogItem, people, bags, currentTrip,
    addMultipleCatalogItemsToTripItems, addingForPersonId, addingForBagId, currentPerson,
    currentBag, showFavoritesOnly, setShowFavoritesOnly
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(addingForBagId || undefined);
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [bulkNote, setBulkNote] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  useEffect(() => {
    setSelectedPersonId(addingForPersonId || undefined);
    setSelectedBagId(addingForBagId || undefined);
  }, [addingForPersonId, addingForBagId]);

  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people.filter(p => currentTrip.peopleIds!.includes(p.id));
  }, [currentTrip, people]);

  const tripBags = useMemo(() => {
    if (!currentTrip?.bagIds) return [];
    return bags.filter(b => currentTrip.bagIds!.includes(b.id));
  }, [currentTrip, bags]);
  
  const categoryHasFavorites = (categoryId: string) => {
    return catalog_items.some(item => item.categoryId === categoryId && item.is_favorite);
  };

  const sortedCategories = useMemo(() => {
    let result = [...categories];
    if (showFavoritesOnly) {
      result = result.filter(c => categoryHasFavorites(c.id));
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, showFavoritesOnly, catalog_items]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    let filteredItems = catalog_items.filter(i => i.name.toLowerCase().includes(lowercasedTerm));
    if (showFavoritesOnly) {
      filteredItems = filteredItems.filter(i => i.is_favorite);
    }
    return { items: filteredItems };
  }, [searchTerm, catalog_items, showFavoritesOnly]);

  const handleCategoryClick = (categoryId: string) => {
    setAddingCategoryId(categoryId);
    setView('trip-add-subcategory');
  };

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (isSelected) { newSelected[itemId] = 1; }
      else { delete newSelected[itemId]; }
      return newSelected;
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) handleItemSelect(itemId, false);
    else setSelectedItems(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  const handleAddItems = async () => {
    const itemsToAdd = Object.entries(selectedItems).map(([id, qty]) => ({
      catalogItemId: id, quantity: qty, isToBuy: needsToBuy,
    }));
    if (itemsToAdd.length === 0) return;
    setIsAdding(true);
    await addMultipleCatalogItemsToTripItems(selectedBagId, selectedPersonId, itemsToAdd);
    setIsAdding(false);
    setSelectedItems({});
    setSearchTerm(''); 
    handleExitAddItemMode();
  };

  const handleAddNewCatalogItem = async (itemData: { 
    name: string; categoryId: string; subcategoryId?: string; personId?: number; bagId?: number; isToBuy?: boolean;
  }) => {
    setIsAdding(true);
    const newItem = await addCatalogItem({
      name: itemData.name, categoryId: itemData.categoryId, subcategoryId: itemData.subcategoryId
    });
    if (newItem) {
      await addMultipleCatalogItemsToTripItems(itemData.bagId, itemData.personId, [{
        catalogItemId: newItem.id, name: itemData.name, categoryId: itemData.categoryId,
        subcategoryId: itemData.subcategoryId, quantity: 1, isToBuy: itemData.isToBuy ?? needsToBuy,
      }]);
    }
    setIsAdding(false);
    setIsAddingNewItem(false);
    setSearchTerm(''); 
    handleExitAddItemMode();
  };
  
  const handleExitAddItemMode = () => {
    if(addingForPersonId) { setView('person-detail'); } 
    else if (addingForBagId) { setView('bag-detail'); } 
    else { setView('trip-items'); }
  };
  
  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const quantity = selectedItems[item.id] || 0;
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-1.5">
        <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
        <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow min-w-0 py-2">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
            {item.is_favorite && <Star className="inline h-3 w-3 fill-icon-active text-icon-active shrink-0" />}
          </div>
          <div className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{category?.name}{subcategory && ` / ${subcategory.name}`}</div>
        </Label>
        
        <div className="flex items-center gap-1 shrink-0">
          {isSelected && (
            <div className="flex items-center gap-1 ml-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity - 1)}><Minus className="h-3 w-3" /></Button>
              <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)} className="h-7 w-10 text-center p-0 text-xs bg-background" />
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity + 1)}><Plus className="h-3 w-3" /></Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditingItem(true); }}><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${item.name}" from Master?`)) deleteCatalogItem(item.id); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24 px-4 pt-4 overflow-x-hidden">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleExitAddItemMode} className="p-0 hover:bg-transparent">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold text-foreground">Back</span>
        </Button>
      </div>
      
      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick Add/Search Item" className="pl-11 bg-search-background text-foreground border-transparent placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:bg-card focus-visible:border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2 px-1">
            <Checkbox id="trip-show-favorites" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
            <Label htmlFor="trip-show-favorites" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2 text-foreground">
              Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
            </Label>
          </div>
        </div>

        {searchResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">Search Results</h3>
              <Button onClick={() => setIsAddingNewItem(true)} size="sm" className="h-8 shadow-sm">
                <Plus className="h-3 w-3 mr-1" /> Create "{searchTerm}"
              </Button>
            </div>
            {searchResults.items.length > 0 ? (
              <Card className="bg-card border-border shadow-sm p-0 overflow-hidden">
                <div className="px-2">{searchResults.items.map(renderItemRow)}</div>
              </Card>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg bg-card border-border">
                <p className="text-muted-foreground text-sm">No items found matching "{searchTerm}".</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-tight">Browse Categories</h3>
            {sortedCategories.map(category => (
              <Card key={category.id} className="hover:bg-muted/50 transition-colors cursor-pointer bg-card border-border shadow-sm" onClick={() => handleCategoryClick(category.id)}>
                <CardContent className="py-3 px-4 flex justify-between items-center">
                  <span className="font-medium text-sm text-foreground">{category.name} {categoryHasFavorites(category.id) && <Star className="inline h-3 w-3 ml-1 fill-icon-active text-icon-active" />}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {Object.keys(selectedItems).length > 0 && (
        <AssignmentFooter 
          selectedPersonId={selectedPersonId} setSelectedPersonId={setSelectedPersonId}
          selectedBagId={selectedBagId} setSelectedBagId={setSelectedBagId}
          needsToBuy={needsToBuy} setNeedsToBuy={setNeedsToBuy}
          bulkNote={bulkNote} setIsNoteDialogOpen={setIsNoteDialogOpen}
          onAddItems={handleAddItems} isAdding={isAdding}
          itemCount={Object.keys(selectedItems).length}
          tripPeople={tripPeople} tripBags={tripBags}
        />
      )}
      <AddNewItemDialog open={isAddingNewItem} onOpenChange={setIsAddingNewItem} categories={categories} subcategories={subcategories} people={tripPeople} bags={tripBags} onAddItem={handleAddNewCatalogItem} initialName={searchTerm} preselectedCategoryId={addingCategoryId || undefined} preselectedSubcategoryId={addingSubcategoryId || undefined} defaultPersonId={selectedPersonId} defaultBagId={selectedBagId} defaultIsToBuy={needsToBuy} />
      <EditCatalogItemDialog open={isEditingItem} onOpenChange={setIsEditingItem} item={editingItem} />
    </div>
  );
};
export default TripAddItemView;