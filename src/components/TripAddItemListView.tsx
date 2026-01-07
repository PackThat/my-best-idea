import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Minus, Plus, DollarSign, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  } = useAppContext();

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(useAppContext().addingForPersonId || undefined);
  const [selectedBagId, setSelectedBagId] = useState<number | undefined>(useAppContext().addingForBagId || undefined);
  
  // Footer Options
  const [needsToBuy, setNeedsToBuy] = useState(false);
  const [markAsFavorite, setMarkAsFavorite] = useState(false);
  const [bulkNote, setBulkNote] = useState<string>('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  // Filter & Sort People Alphabetically
  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people
      .filter(p => currentTrip.peopleIds!.includes(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentTrip, people]);

  // Filter & Sort Bags Alphabetically
  const tripBags = useMemo(() => {
    if (!currentTrip?.bagIds) return [];
    return bags
      .filter(b => currentTrip.bagIds!.includes(b.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentTrip, bags]);

  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);
  
  const itemsInSubcategory = useMemo(() => {
    return catalog_items
      .filter(item => item.subcategoryId === addingSubcategoryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog_items, addingSubcategoryId]);

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
    setNeedsToBuy(false);
    setMarkAsFavorite(false);
    setBulkNote('');
    setView('trip-add-subcategory');
  };

  if (!currentSubcategory) {
    setView('trip-add-subcategory');
    return null;
  }

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-40">
      <div className="flex items-center gap-4">
        <Button variant="default" onClick={() => setView('trip-add-subcategory')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subcategories
        </Button>
        <h2 className="text-2xl font-bold">{currentSubcategory.name}</h2>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-1">
        {itemsInSubcategory.map((item) => {
          const isSelected = !!selectedItems[item.id];
          const quantity = selectedItems[item.id] || 0;

          return (
            <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0">
              <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
              <Label htmlFor={`item-${item.id}`} className="font-normal cursor-pointer flex-grow flex items-center gap-2">
                <span>{item.name}</span>
                {item.is_favorite && <Star className={cn("h-4 w-4 fill-icon-active text-icon-active")} />}
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
      
      {/* Footer Container - Cream Background */}
      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="w-full md:max-w-screen-md mx-auto space-y-4">
             
             {/* Row 1: "X Selected" ... GAP ... Icons */}
             <div className="flex items-center gap-12">
                <p className="font-semibold text-sm whitespace-nowrap">{getSelectedCount()} selected</p>
                
                {/* Icons Group */}
                <div className="flex items-center gap-4">
                   {/* To Buy Icon */}
                   <button 
                      onClick={() => setNeedsToBuy(!needsToBuy)}
                      title="To Buy"
                      className={cn(
                        "transition-all focus:outline-none",
                        needsToBuy ? "text-icon-active" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <DollarSign className={cn("h-5 w-5", needsToBuy && "stroke-[3px]")} />
                   </button>

                   {/* Favorite Icon */}
                   <button 
                      onClick={() => setMarkAsFavorite(!markAsFavorite)}
                      title="Mark as Favorite"
                      className={cn(
                        "transition-all focus:outline-none",
                        markAsFavorite ? "text-icon-active" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Star className={cn("h-5 w-5", markAsFavorite && "fill-current")} />
                   </button>

                   {/* Note Icon - Corrected to use fill-icon-active */}
                   <button 
                      onClick={() => setIsNoteDialogOpen(true)}
                      title="Add Note"
                      className={cn(
                        "transition-all focus:outline-none",
                        bulkNote ? "text-icon-active" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <MessageSquare className={cn("h-5 w-5", bulkNote && "fill-icon-active text-icon-active")} />
                   </button>
                </div>
             </div>

             {/* Row 2: Dropdowns and Add Button */}
             <div className="flex flex-wrap items-center gap-3">
                <Select value={String(selectedPersonId || 'unassigned')} onValueChange={(val) => setSelectedPersonId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow h-10 bg-background"><SelectValue placeholder="Assign Person" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Person Unassigned</SelectItem>
                        {tripPeople.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                
                 <Select value={String(selectedBagId || 'unassigned')} onValueChange={(val) => setSelectedBagId(val === 'unassigned' ? undefined : Number(val))}>
                    <SelectTrigger className="flex-grow h-10 bg-background"><SelectValue placeholder="Assign Bag" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Bag Unassigned</SelectItem>
                        {tripBags.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button onClick={handleAddItems} disabled={isAdding} size="lg" className="px-8 font-semibold ml-auto">
                  {isAdding ? 'Adding...' : 'Add Items'}
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              This text will be added as a note to each selected item individually.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Type your note here... (e.g., Pack the red ones)" 
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            className="min-h-[120px] bg-muted text-foreground"
            autoFocus
          />
          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={() => { setBulkNote(''); setIsNoteDialogOpen(false); }} className="mt-2 sm:mt-0">
                Clear Note
            </Button>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
                </Button>
                <Button onClick={() => setIsNoteDialogOpen(false)}>Save Note</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripAddItemListView;