import React, { useState } from 'react';
import { Item, Person, Bag, CatalogItem } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Edit2, Trash2, User, Backpack, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppContext } from '@/contexts/AppContext';
import { NoteEditDialog } from './NoteEditDialog';

interface PackingListItemProps {
  item: Item;
  people: Person[];
  bags: Bag[];
  onUpdate: (itemId: string, updates: Partial<Item>) => void;
  onDelete: (itemId: string) => void;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  onEdit: (item: Item) => void;
  onEditNote: (item: Item) => void; 
  contextPersonId?: number;
  contextBagId?: number;
  mode?: 'packing' | 'tobuy';
}

const ItemActions: React.FC<PackingListItemProps> = ({
  item, people, bags, onDelete, updateCatalogItem, onEdit, onUpdate, contextPersonId, contextBagId, mode
}) => {
  const { catalog_items, updateItem } = useAppContext();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  const assignedPerson = people.find(p => p.id === item.personId);
  const assignedBag = bags.find(b => b.id === item.bagId);
  const catalogItem = item.catalogItemId ? catalog_items.find(ci => ci.id === item.catalogItemId) : null;
  const isFavorite = catalogItem?.is_favorite || false;

  const handleFavoriteToggle = () => {
    if (catalogItem) {
      updateCatalogItem(catalogItem.id, { is_favorite: !isFavorite });
    }
  };

  const handleSaveNote = (itemId: string, newNote: string | undefined) => {
    onUpdate(itemId, { notes: newNote });
  };

  return (
    <>
      <div className="flex items-center gap-3 text-sm text-foreground min-w-0">
        {assignedPerson && assignedPerson.id !== contextPersonId && (
          <div className="flex items-center gap-1.5 shrink-0">
            <User className="h-4 w-4" />
            <span className="truncate">{assignedPerson.name}</span>
          </div>
        )}
        {assignedBag && assignedBag.id !== contextBagId && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Backpack className="h-4 w-4" />
            <span className="truncate">{assignedBag.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFavoriteToggle}>
          <Star className={cn("h-4 w-4", isFavorite ? "fill-icon-active text-icon-active" : "text-foreground")} />
        </Button>
        
        {mode === 'packing' && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => onUpdate(item.id, { isToBuy: !item.isToBuy })}>
            <DollarSign className={cn("h-4 w-4", item.isToBuy && "text-icon-active stroke-[3px]")} />
          </Button>
        )}
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => setIsNoteDialogOpen(true)}>
          <MessageSquare className={cn("h-4 w-4", item.notes && "fill-icon-active text-icon-active")} />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => onEdit(item)}>
          <Edit2 className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Trip?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete "{item.quantity} x {item.name}" from this trip only. It will **not** be deleted from your Master Catalog.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive">Remove from Trip</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <NoteEditDialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen} item={item} onSaveNote={handleSaveNote} />
      </div>
    </>
  );
};

export const PackingListItem: React.FC<PackingListItemProps> = (props) => {
  const { item, onUpdate, mode = 'packing' } = props;
  const { catalog_items } = useAppContext();
  
  const catalogItem = catalog_items.find(ci => ci.id === item.catalogItemId);
  const isFavorite = catalogItem?.is_favorite || false;

  const handleCheckboxChange = (checked: boolean) => {
    if (mode === 'packing') {
      onUpdate(item.id, { packed: checked });
    } else {
      onUpdate(item.id, { isToBuy: false });
    }
  };

  return (
    <div className="border-b">
      <div className="flex flex-col py-3 md:hidden">
        <div className="flex items-center gap-4">
          <Checkbox className="w-5 h-5" checked={mode === 'packing' ? item.packed : false} onCheckedChange={handleCheckboxChange} />
          <div className="flex-grow flex items-center gap-2 min-w-0">
            <span className="font-medium text-foreground truncate">
              {item.quantity} x {item.name}
            </span>
            {isFavorite && <Star className="h-3 w-3 fill-icon-active text-icon-active shrink-0" />}
          </div>
        </div>
        <div className="flex items-center justify-between pl-9 pt-2">
          <ItemActions {...props} mode={mode} />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 py-2">
        <Checkbox className="w-5 h-5" checked={mode === 'packing' ? item.packed : false} onCheckedChange={handleCheckboxChange} />
        <div className="flex-grow flex items-center gap-2">
          <span className="font-medium text-foreground">
            {item.quantity} x {item.name}
          </span>
          {isFavorite && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
        </div>
        <ItemActions {...props} mode={mode} />
      </div>
    </div>
  );
};

export default PackingListItem;