import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Search, Star, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Category, Subcategory, CatalogItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

export const TripAddItemView: React.FC = () => {
  const { 
    setView, 
    categories, 
    subcategories, 
    catalog_items, 
    setAddingCategoryId,
    people,
    bags,
    currentTrip,
    addMultipleCatalogItemsToTripItems,
    addingForPersonId,
    setAddingForPersonId,
    addingForBagId,
    setAddingForBagId,
    currentPerson,
    currentBag,
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(addingForBagId || undefined);
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
  
  const favoriteItems = useMemo(() => catalog_items.filter(item => item.is_favorite), [catalog_items]);
  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return null;
    const lowercasedTerm = searchTerm.toLowerCase();
    const filteredItems = catalog_items.filter(i => i.name.toLowerCase().includes(lowercasedTerm));
    return { items: filteredItems };
  }, [searchTerm, catalog_items]);

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
  };
  
  const handleExitAddItemMode = () => {
    if(addingForPersonId) {
      setView('person-detail');
    } else if (addingForBagId) {
      setView('bag-detail');
    } else {
      setView('trip-items');
    }
  };
  
  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  const renderItemRow = (item: CatalogItem) => {
    const isSelected = !!selectedItems[item.id];
    const quantity = selectedItems[item.id] || 0;
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = subcategories.find(sc => sc.id === item.subcategoryId);

    return (
      <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0">
        <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
        <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow">
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            {item.is_favorite && <Star className={cn("h-4 w-4 fill-ring text-ring")} />}
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
  
  const renderHeader = () => {
    if (addingForPersonId && currentPerson) {
      return (
        <Button variant="outline" onClick={handleExitAddItemMode}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {currentPerson.name}
        </Button>
      );
    }
    if (addingForBagId && currentBag) {
      return (
        <Button variant="outline" onClick={handleExitAddItemMode}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {currentBag.name}
        </Button>
      );
    }
    return (
      <Button variant="outline" onClick={() => setView('trip-items')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Packing List
      </Button>
    );
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        {renderHeader()}
        <h2 className="text-2xl font-bold">Add Items</h2>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Quick Add/Search Item"
            className="pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchResults ? (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 mt-4">Matching Items</h3>
            {searchResults.items.length > 0 ? (
              <Card className="p-2"><div className="space-y-1">{searchResults.items.map(renderItemRow)}</div></Card>
            ) : (
              <p className="text-muted-foreground text-center py-4">No items found.</p>
            )}
          </div>
        ) : (
          <>
              {favoriteItems.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="favorites" className="border rounded-md bg-card">
                          <AccordionTrigger className="text-base font-medium px-4 py-2 hover:no-underline rounded-t-md">Favorites</AccordionTrigger>
                          <AccordionContent className="p-2 border-t">
                              {favoriteItems.map(renderItemRow)}
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              )}

              {sortedCategories.map(category => (
                  <Card 
                  key={category.id} 
                  className="hover:bg-muted/50 transition-colors cursor-pointer bg-card"
                  onClick={() => handleCategoryClick(category.id)}
                  >
                  <CardContent className="py-2 px-4 flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                  </Card>
              ))}
          </>
        )}
      </div>
      
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
          <div className="w-full md:max-w-screen-md mx-auto flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-grow flex-wrap">
                <p className="font-semibold text-sm whitespace-nowrap">{getSelectedCount()} items selected</p>
                <Select value={String(selectedPersonId || 'unassigned')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow min-w-[150px]"><SelectValue placeholder="Assign Person" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Person Unassigned</SelectItem>
                        {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={String(selectedBagId || 'unassigned')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow min-w-[150px]"><SelectValue placeholder="Assign Bag" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Bag Unassigned</SelectItem>
                        {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="footer-needsToBuy" checked={needsToBuy} onCheckedChange={(checked) => setNeedsToBuy(Boolean(checked))} />
                  <Label htmlFor="footer-needsToBuy">To Buy</Label>
                </div>
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