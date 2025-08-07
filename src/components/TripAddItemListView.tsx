import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogItem } from '@/types';
import { cn } from '@/lib/utils';

export const TripAddItemListView: React.FC = () => {
  const { 
    setView, 
    categories,
    subcategories, 
    catalog_items,
    people,
    bags,
    currentTrip,
    addingSubcategoryId,
    addMultipleCatalogItemsToTripItems,
    updateCatalogItem,
  } = useAppContext();

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

  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);
  const parentCategory = categories.find(c => c.id === currentSubcategory?.categoryId);
  const itemsInSubcategory = catalog_items.filter(item => item.subcategoryId === addingSubcategoryId);

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
  
  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  const handleAddItems = async () => {
    const itemsToAdd = Object.entries(selectedItems).map(([id, qty]) => ({
      catalogItemId: id, quantity: qty, isToBuy: needsToBuy,
    }));
    if (itemsToAdd.length === 0) return;
    setIsAdding(true);
    await addMultipleCatalogItemsToTripItems(selectedBagId, selectedPersonId, itemsToAdd);
    setIsAdding(false);
    setSelectedItems({});
    setView('trip-add-subcategory');
  };

  const handleToggleFavoriteSelected = async () => {
    const selectedIds = Object.keys(selectedItems);
    const updates = selectedIds.map(id => updateCatalogItem(id, { is_favorite: true }));
    await Promise.all(updates);
  };
  
  if (!currentSubcategory) {
    setView('trip-add-subcategory');
    return null;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setView('trip-add-subcategory')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subcategories
        </Button>
        <h2 className="text-2xl font-bold">
          {parentCategory?.name}: {currentSubcategory.name}
        </h2>
      </div>

      <div className="space-y-1">
        {itemsInSubcategory.map((item) => {
          const isSelected = !!selectedItems[item.id];
          const quantity = selectedItems[item.id] || 0;

          return (
            <div key={item.id} className="flex items-center space-x-2 py-2 border-b">
              <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
              <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow flex items-center gap-2">
                <span>{item.name}</span>
                {item.is_favorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
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
        })}
      </div>
      
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

export default TripAddItemListView;