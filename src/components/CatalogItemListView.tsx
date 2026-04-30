import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditCatalogItemDialog from './EditCatalogItemDialog';

export const CatalogItemListView: React.FC = () => {
  const { 
    setView, categories, subcategories, catalog_items, addingCategoryId, addingSubcategoryId,
    addCatalogItem, deleteCatalogItem, updateCatalogItem, showFavoritesOnly, setShowFavoritesOnly
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  // Bulk Move State
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [bulkTargetCatId, setBulkTargetCatId] = useState('');
  const [bulkTargetSubCatId, setBulkTargetSubCatId] = useState('none');

  const currentCategory = categories.find(c => c.id === addingCategoryId);
  const currentSubcategory = subcategories.find(sc => sc.id === addingSubcategoryId);

  const visibleItems = useMemo(() => {
    let items = catalog_items.filter(i => i.subcategoryId === addingSubcategoryId);
    if (showFavoritesOnly) { items = items.filter(i => i.is_favorite); }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog_items, addingSubcategoryId, showFavoritesOnly]);

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (checked) newSelected[itemId] = true;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteCatalogItem(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedItems);
    if (window.confirm(`Delete ${ids.length} items from the Master Catalog?`)) {
      for (const id of ids) { await deleteCatalogItem(id); }
      setSelectedItems({});
    }
  };

  const handleConfirmBulkMove = async () => {
    const ids = Object.keys(selectedItems);
    if (!bulkTargetCatId) return;
    for (const id of ids) {
      await updateCatalogItem(id, {
        categoryId: bulkTargetCatId,
        subcategoryId: bulkTargetSubCatId === 'none' ? undefined : bulkTargetSubCatId
      });
    }
    setSelectedItems({});
    setIsBulkMoveOpen(false);
  };

  const toggleFavorite = async (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    await updateCatalogItem(item.id, { is_favorite: !item.is_favorite });
  };

  const getSelectedCount = () => Object.keys(selectedItems).length;
  const isFooterVisible = getSelectedCount() > 0;

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <Button variant="default" size="sm" onClick={() => setView('catalog-subcategory-list')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <h2 className="text-xl font-bold truncate">{currentSubcategory?.name}</h2>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search this list..." className="pl-11 bg-card border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 px-1">
          <Checkbox id="show-favorites-items" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
          <Label htmlFor="show-favorites-items" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
            Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
          </Label>
        </div>

        <div className="space-y-1">
          {visibleItems.map(item => (
            <div key={item.id} className="flex items-center space-x-2 py-1 border-b last:border-b-0">
              <Checkbox id={`item-${item.id}`} checked={!!selectedItems[item.id]} onCheckedChange={(checked) => handleItemSelect(item.id, Boolean(checked))} />
              <Label htmlFor={`item-${item.id}`} className="flex-grow cursor-pointer flex items-center gap-2 py-2 min-w-0">
                <span className="font-medium text-sm truncate">{item.name}</span>
                <div onClick={(e) => toggleFavorite(e, item)}>
                  <Star className={cn("h-4 w-4", item.is_favorite ? "fill-icon-active text-icon-active" : "text-foreground/20")} />
                </div>
              </Label>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => { setEditingItem(item); setIsEditingItem(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFooterVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="w-full md:max-w-screen-md mx-auto flex items-center justify-between">
            <p className="font-semibold text-sm">{getSelectedCount()} selected</p>
            <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => setIsBulkMoveOpen(true)}>Move</Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isBulkMoveOpen} onOpenChange={setIsBulkMoveOpen}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Move Items</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Target Category</Label>
            <Select onValueChange={(val) => setBulkTargetCatId(val)}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter><Button onClick={handleConfirmBulkMove}>Move Now</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCatalogItemDialog open={isEditingItem} onOpenChange={setIsEditingItem} item={editingItem} />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete from Master Catalog?</AlertDialogTitle>
              <AlertDialogDescription>This permanently removes "{itemToDelete?.name}".</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
          <div className="py-4"><Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} autoFocus /></div>
          <DialogFooter><Button onClick={async () => {
            if (!newItemName.trim() || !currentSubcategory || !currentCategory) return;
            setIsAdding(true);
            await addCatalogItem({ name: newItemName, categoryId: currentCategory.id, subcategoryId: currentSubcategory.id });
            setNewItemName(''); setIsAdding(false); setIsAddDialogOpen(false);
          }}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogItemListView;