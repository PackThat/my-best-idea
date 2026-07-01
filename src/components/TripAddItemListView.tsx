import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Minus, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";
import EditCatalogItemDialog from './EditCatalogItemDialog';
import NoteEditDialog from './NoteEditDialog';
import { AssignmentFooter } from './AssignmentFooter';
import { CatalogItem } from '@/types';

export const TripAddItemListView: React.FC = () => {
  const { 
    setView, subcategories, catalog_items, people, bags, currentTrip,
    addingSubcategoryId, addMultipleCatalogItemsToTripItems, deleteCatalogItem, 
    addingForPersonId, addingForBagId, showFavoritesOnly, setShowFavoritesOnly
  } = useAppContext();

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(addingForBagId || undefined);
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [bulkNote, setBulkNote] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
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

  const selectedItemsList = useMemo(() => {
    return Object.keys(selectedItems).map(id => {
      const item = catalog_items.find(i => i.id === id);
      return { id, name: item?.name || 'Unknown Item' };
    });
  }, [selectedItems, catalog_items]);

  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);
  
  const itemsInSubcategory = useMemo(() => {
    let items = catalog_items.filter(item => item.subcategoryId === addingSubcategoryId);
    if (showFavoritesOnly) items = items.filter(i => i.is_favorite);
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog_items, addingSubcategoryId, showFavoritesOnly]);

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (isSelected) newSelected[itemId] = 1;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) handleItemSelect(itemId, false);
    else setSelectedItems(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  const handleAddItems = async () => {
    const itemsToAdd = Object.entries(selectedItems).map(([id, qty]) => ({
      catalogItemId: id, quantity: qty, isToBuy: needsToBuy, notes: bulkNote || undefined
    }));
    if (itemsToAdd.length === 0) return;
    setIsAdding(true);
    await addMultipleCatalogItemsToTripItems(selectedBagId, selectedPersonId, itemsToAdd);
    setIsAdding(false);
    setSelectedItems({});
    setView('trip-add-subcategory');
  };

  const isFooterVisible = Object.keys(selectedItems).length > 0;

  if (!currentSubcategory) { setView('trip-add-subcategory'); return null; }

  return (
    <div className="w-full md:max-w-screen-md mx-auto space-y-4 pb-40 px-4 pt-4">
      {/* Header and Controls */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setView('trip-add-subcategory')} className="p-0 hover:bg-transparent">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold text-foreground">Back to {currentSubcategory.name}</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2 px-1">
        <Checkbox id="trip-list-show-favorites" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
        <Label htmlFor="trip-list-show-favorites" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
          Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
        </Label>
      </div>

      {/* Main List Container */}
      <Card className="bg-card border-border shadow-sm p-0 overflow-hidden">
        <div className="px-2">
          {itemsInSubcategory.length > 0 ? (
            itemsInSubcategory.map((item) => {
              const isSelected = !!selectedItems[item.id];
              const quantity = selectedItems[item.id] || 0;
              return (
                <div key={item.id} className="flex items-center space-x-2 py-1.5">
                  <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
                  <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow text-sm py-2">
                    {item.name} {item.is_favorite && <Star className="inline h-3 w-3 ml-1 fill-icon-active text-icon-active" />}
                  </Label>
                  
                  <div className="flex items-center shrink-0 gap-1">
                    {isSelected && (
                      <div className="flex items-center gap-1 ml-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)} className="h-7 w-10 text-center p-0 text-xs bg-background" />
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditingItem(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${item.name}"?`)) deleteCatalogItem(item.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">No items found.</div>
          )}
        </div>
      </Card>
      
      {isFooterVisible && (
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

      <EditCatalogItemDialog open={isEditingItem} onOpenChange={setIsEditingItem} item={editingItem} />
      
      <NoteEditDialog 
        open={isNoteDialogOpen} 
        onOpenChange={setIsNoteDialogOpen} 
        items={selectedItemsList} 
        initialNote={bulkNote} 
        onSave={(val) => setBulkNote(val ?? '')} 
      />
    </div>
  );
};

export default TripAddItemListView;