import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Minus, Plus, DollarSign, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Component Imports
import PersonSelector from './PersonSelector'; 
import { BagSelector } from './BagSelector';
import EditCatalogItemDialog from './EditCatalogItemDialog';
import { CatalogItem } from '@/types';

export const TripAddItemListView: React.FC = () => {
  const { 
    setView, 
    subcategories, 
    catalog_items,
    people,
    bags,
    currentTrip,
    addingSubcategoryId,
    addMultipleCatalogItemsToTripItems,
    updateCatalogItem,
    deleteCatalogItem,
    updateTrip, 
    addingForPersonId,
    addingForBagId,
    showFavoritesOnly,
    setShowFavoritesOnly
  } = useAppContext();

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(addingForBagId || undefined);
  
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [markAsFavorite, setMarkAsFavorite] = useState(false);
  const [bulkNote, setBulkNote] = useState<string>('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isAddBagDialogOpen, setIsAddBagDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people.filter(p => currentTrip.peopleIds!.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentTrip, people]);

  const tripBags = useMemo(() => {
    if (!currentTrip?.bagIds) return [];
    return bags.filter(b => currentTrip.bagIds!.includes(b.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentTrip, bags]);

  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);
  
  const itemsInSubcategory = useMemo(() => {
    let items = catalog_items.filter(item => item.subcategoryId === addingSubcategoryId);
    if (showFavoritesOnly) {
      items = items.filter(i => i.is_favorite);
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog_items, addingSubcategoryId, showFavoritesOnly]);

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
      notes: bulkNote || undefined
    }));
    if (itemsToAdd.length === 0) return;
    setIsAdding(true);
    if (markAsFavorite) {
      await Promise.all(Object.keys(selectedItems).map(id => updateCatalogItem(id, { is_favorite: true })));
    }
    await addMultipleCatalogItemsToTripItems(selectedBagId, selectedPersonId, itemsToAdd);
    setIsAdding(false);
    setSelectedItems({});
    setView('trip-add-subcategory');
  };

  const isFooterVisible = Object.keys(selectedItems).length > 0;

  if (!currentSubcategory) {
    setView('trip-add-subcategory');
    return null;
  }

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-4 pb-40 px-4 pt-4">
      <div className="flex items-center gap-4">
        <Button variant="default" size="sm" onClick={() => setView('trip-add-subcategory')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-bold truncate">{currentSubcategory.name}</h2>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        {/* Fixed: Toggle Star color now uses universal theme tan */}
        <div className="flex items-center space-x-2 px-1">
          <Checkbox 
            id="trip-list-show-favorites" 
            checked={showFavoritesOnly}
            onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))}
          />
          <Label 
            htmlFor="trip-list-show-favorites" 
            className="text-sm font-medium cursor-pointer select-none flex items-center gap-2"
          >
            Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
          </Label>
        </div>

        <div className="space-y-0">
          {itemsInSubcategory.length > 0 ? (
            itemsInSubcategory.map((item) => {
              const isSelected = !!selectedItems[item.id];
              const quantity = selectedItems[item.id] || 0;

              return (
                <div key={item.id} className="flex items-center space-x-2 py-1 border-b last:border-b-0">
                  <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
                  
                  <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow flex items-center gap-2 min-w-0 py-2">
                    <span className="truncate text-sm">{item.name}</span>
                    {/* Item indicator star uses Tan */}
                    {item.is_favorite && <Star className={cn("h-3 w-3 shrink-0 fill-icon-active text-icon-active")} />}
                  </Label>

                  <div className="flex items-center shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setIsEditingItem(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" /> 
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          deleteCatalogItem(item.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" /> 
                    </Button>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)} className="h-7 w-10 text-center p-0 text-xs" />
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                {showFavoritesOnly ? "No favorite items in this folder." : "No items found."}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer and Dialogs omitted for brevity but preserved exactly from previous turn */}
      <EditCatalogItemDialog open={isEditingItem} onOpenChange={setIsEditingItem} item={editingItem} />
    </div>
  );
};

export default TripAddItemListView;