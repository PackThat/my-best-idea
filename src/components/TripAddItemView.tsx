import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Search, Star, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Category, Subcategory, CatalogItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const TripAddItemView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    setAddingCategoryId,
    setAddingSubcategoryId,
    people,
    bags,
    currentTrip,
    addMultipleCatalogItemsToTripItems,
    updateCatalogItem,
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>();
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>();
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people.filter(p => currentTrip.peopleIds!.includes(p.id));
  }, [currentTrip, people]);

  const tripBags = useMemo(() => {
    if (!currentTrip?.bagIds) return [];
    return bags.filter(b => currentTrip.bagIds!.includes(b.id));
  }, [currentTrip, bags]);
  
  const favoriteItems = useMemo(() => catalog_items.filter(item => item.is_favorite), [catalog_items]);
  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories]);
  const displayCategories = useMemo(() => {
    const favCat = favoriteItems.length > 0 ? { id: 'favorites', name: 'Favorites' } as Category : null;
    return favCat ? [favCat, ...sortedCategories] : sortedCategories;
  }, [favoriteItems.length, sortedCategories]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 3) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(lowercasedTerm));
    const filteredSubcategories = subcategories.filter(sc => sc.name.toLowerCase().includes(lowercasedTerm));
    const filteredItems = catalog_items.filter(i => i.name.toLowerCase().includes(lowercasedTerm));
    return { categories: filteredCategories, subcategories: filteredSubcategories, items: filteredItems };
  }, [searchTerm, categories, subcategories, catalog_items]);

  const handleCategoryClick = (categoryId: string) => {
    setAddingCategoryId(categoryId);
    setView('trip-add-subcategory');
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingCategoryId(subcategory.categoryId);
    setAddingSubcategoryId(subcategory.id);
    setView('trip-add-item-list');
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
    setSearchTerm(''); // Clear search after adding
  };
  
  const handleToggleFavoriteSelected = async () => {
    // This functionality can be expanded later
  };

  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const quantity = selectedItems[item.id] || 0;
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-2 border-b">
        <Checkbox id={`search-item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
        <Label htmlFor={`search-item-${item.id}`} className="font-normal cursor-pointer flex-grow">
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            {item.is_favorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
          </div>
          <div className="text-xs text-muted-foreground">
            {category?.name}{subcategory && ` / ${subcategory.name}`}
          </div>
        </Label>
        {isSelected && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity - 1)}><Minus className="h-4 w-4" /></Button>
            <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)} className="h-7 w-12 text-center" />
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setView('trip-items')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packing List
        </Button>
        <h2 className="text-2xl font-bold">Add Items</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick Add/Search"
          className="pl-11 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchResults ? (
        <div className="space-y-4">
          {searchResults.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Categories</h3>
              {searchResults.categories.map(category => (
                <Card key={category.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleCategoryClick(category.id)}>
                  <CardContent className="p-3 flex justify-between items-center"><span className="font-medium">{category.name}</span><ChevronRight className="h-4 w-4" /></CardContent>
                </Card>
              ))}
            </div>
          )}
          {searchResults.subcategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 mt-4">Subcategories</h3>
              {searchResults.subcategories.map(subcategory => (
                <Card key={subcategory.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleSubcategoryClick(subcategory)}>
                   <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{subcategory.name}</p>
                      <p className="text-xs text-muted-foreground">In {categories.find(c => c.id === subcategory.categoryId)?.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {searchResults.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 mt-4">Items</h3>
              {searchResults.items.map(renderItemRow)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayCategories.map(category => (
            <Card 
              key={category.id} 
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-grow flex-wrap">
                <p className="font-semibold text-sm whitespace-nowrap">{getSelectedCount()} items selected</p>
                <Select value={String(selectedPersonId || 'unassigned')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow min-w-[150px]"><SelectValue placeholder="Assign Person" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={String(selectedBagId || 'unassigned')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow min-w-[150px]"><SelectValue placeholder="Assign Bag" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="footer-needsToBuy" checked={needsToBuy} onCheckedChange={(checked) => setNeedsToBuy(Boolean(checked))} />
                  <Label htmlFor="footer-needsToBuy">To Buy</Label>
                </div>
                <Button variant="ghost" size="icon" onClick={handleToggleFavoriteSelected}><Star className="h-5 w-5"/></Button>
             </div>
             <Button onClick={handleAddItems} disabled={isAdding} className="ml-auto">
                {isAdding ? 'Adding...' : `Add ${getSelectedCount()} Items`}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripAddItemView;