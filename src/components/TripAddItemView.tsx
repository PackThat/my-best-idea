import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Search, Star, Minus, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CatalogItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import AddNewItemDialog from './AddNewItemDialog';
import EditCatalogItemDialog from './EditCatalogItemDialog';

export const TripAddItemView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    addingCategoryId,
    addingSubcategoryId, // Fixed: Grabbed the missing variable here
    setAddingCategoryId,
    addCatalogItem,
    deleteCatalogItem,
    people,
    bags,
    currentTrip,
    addMultipleCatalogItemsToTripItems,
    addingForPersonId,
    addingForBagId,
    currentPerson,
    currentBag,
    showFavoritesOnly,
    setShowFavoritesOnly
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(addingForBagId || undefined);
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  
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
      catalogItemId: id, 
      quantity: qty, 
      isToBuy: needsToBuy,
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
    name: string; 
    categoryId: string; 
    subcategoryId?: string;
    personId?: number;
    bagId?: number;
    isToBuy?: boolean;
  }) => {
    setIsAdding(true);
    const newItem = await addCatalogItem({
      name: itemData.name,
      categoryId: itemData.categoryId,
      subcategoryId: itemData.subcategoryId
    });
    if (newItem) {
      await addMultipleCatalogItemsToTripItems(itemData.bagId, itemData.personId, [{
        catalogItemId: newItem.id,
        name: itemData.name,
        categoryId: itemData.categoryId,
        subcategoryId: itemData.subcategoryId,
        quantity: 1,
        isToBuy: itemData.isToBuy ?? needsToBuy,
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
  
  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const quantity = selectedItems[item.id] || 0;
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-3 border-b last:border-b-0">
        <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
        
        <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{item.name}</span>
            {item.is_favorite && <Star className={cn("h-4 w-4 fill-icon-active text-icon-active shrink-0")} />}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {category?.name}{subcategory && ` / ${subcategory.name}`}
          </div>
        </Label>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditingItem(true); }}><Edit2 className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${item.name}"?`)) deleteCatalogItem(item.id); }}><Trash2 className="h-5 w-5 text-destructive" /></Button>
        </div>

        {isSelected && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, quantity - 1)}><Minus className="h-4 w-4" /></Button>
            <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)} className="h-8 w-12 text-center p-0" />
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, quantity + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    );
  };
  
  const renderHeader = () => {
    if (addingForPersonId && currentPerson) {
      return (
        <Button variant="ghost" size="sm" onClick={handleExitAddItemMode} className="p-0 hover:bg-transparent">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold">Back to {currentPerson.name}</span>
        </Button>
      );
    }
    if (addingForBagId && currentBag) {
      return (
        <Button variant="ghost" size="sm" onClick={handleExitAddItemMode} className="p-0 hover:bg-transparent">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold">Back to {currentBag.name}</span>
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="sm" onClick={() => setView('trip-items')} className="p-0 hover:bg-transparent">
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span className="text-lg font-semibold">Back to Packing List</span>
      </Button>
    );
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24 px-4 pt-4">
      <div className="flex items-center gap-4">{renderHeader()}</div>
      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Quick Add/Search Item" className="pl-11 bg-card border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 px-1">
          <Checkbox id="trip-show-favorites" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
          <Label htmlFor="trip-show-favorites" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
            Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
          </Label>
        </div>

        {searchResults ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Search Results</h3>
            {searchResults.items.length > 0 ? (
              <Card className="p-2 bg-card"><div className="space-y-1">{searchResults.items.map(renderItemRow)}</div></Card>
            ) : (
              <div className="text-center py-12 space-y-4 border border-dashed rounded-lg bg-card">
                <p className="text-muted-foreground">No items found matching "{searchTerm}".</p>
                <Button onClick={() => setIsAddingNewItem(true)} variant="default" className="px-8"><Plus className="h-4 w-4 mr-2" /> Create "{searchTerm}"</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground mt-2">Browse Categories</h3>
              {sortedCategories.map(category => (
                <Card key={category.id} className="hover:bg-muted/50 transition-colors cursor-pointer bg-card" onClick={() => handleCategoryClick(category.id)}>
                  <CardContent className="py-3 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {showFavoritesOnly && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
          <div className="w-full md:max-w-screen-md mx-auto space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select value={String(selectedPersonId || 'unassigned')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="bg-input"><SelectValue placeholder="Assign Person" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Person Unassigned</SelectItem>
                        {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={String(selectedBagId || 'unassigned')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="bg-input"><SelectValue placeholder="Assign Bag" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Bag Unassigned</SelectItem>
                        {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="footer-needsToBuy" checked={needsToBuy} onCheckedChange={(checked) => setNeedsToBuy(Boolean(checked))} />
                  <Label htmlFor="footer-needsToBuy" className="font-medium">Need to buy</Label>
                </div>
                <Button onClick={handleAddItems} disabled={isAdding} className="min-w-[140px]">{isAdding ? 'Adding...' : `Add ${getSelectedCount()} Items`}</Button>
             </div>
          </div>
        </div>
      )}

      <AddNewItemDialog open={isAddingNewItem} onOpenChange={setIsAddingNewItem} categories={categories} subcategories={subcategories} people={tripPeople} bags={tripBags} onAddItem={handleAddNewCatalogItem} initialName={searchTerm} preselectedCategoryId={addingCategoryId || undefined} preselectedSubcategoryId={addingSubcategoryId || undefined} defaultPersonId={selectedPersonId} defaultBagId={selectedBagId} defaultIsToBuy={needsToBuy} />
      <EditCatalogItemDialog open={isEditingItem} onOpenChange={setIsEditingItem} item={editingItem} />
    </div>
  );
};

export default TripAddItemView;