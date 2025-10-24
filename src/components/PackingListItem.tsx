import React from 'react';
import { Item, Person, Bag, CatalogItem } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Edit2, Trash2, User, Backpack, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppContext } from '@/contexts/AppContext';

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

// Helper component for details and actions to avoid code duplication
const ItemActions: React.FC<Omit<PackingListItemProps, 'onUpdate'>> = ({
  item, people, bags, onDelete, updateCatalogItem, onEdit, onEditNote, contextPersonId, contextBagId, mode
}) => {
  const { catalog_items, updateItem } = useAppContext();
  const assignedPerson = people.find(p => p.id === item.personId);
  const assignedBag = bags.find(b => b.id === item.bagId);
  const catalogItem = item.catalogItemId ? catalog_items.find(ci => ci.id === item.catalogItemId) : null;
  const isFavorite = catalogItem?.is_favorite || false;

  const handleFavoriteToggle = () => {
    if (catalogItem) {
      updateCatalogItem(catalogItem.id, { is_favorite: !isFavorite });
    }
  };

  return (
    <>
      {/* Person and Bag details */}
      <div className="flex items-center gap-3 text-sm text-foreground min-w-0">
        {assignedPerson && assignedPerson.id !== contextPersonId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 shrink-0">
                <User className="h-4 w-4" />
                <span className="truncate">{assignedPerson.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{assignedPerson.name}</TooltipContent>
          </Tooltip>
        )}
        {assignedBag && assignedBag.id !== contextBagId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 shrink-0">
                <Backpack className="h-4 w-4" />
                <span className="truncate">{assignedBag.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{assignedBag.name}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={handleFavoriteToggle}>
              <Star className={cn("h-4 w-4", isFavorite && "fill-icon-active text-icon-active")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
        </Tooltip>
        {mode === 'packing' && (
           <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => updateItem(item.id, { isToBuy: !item.isToBuy })}>
                  <DollarSign className={cn("h-4 w-4", item.isToBuy && "text-icon-active")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.isToBuy ? 'Remove from To Buy list' : 'Add to To Buy list'}</TooltipContent>
            </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => onEditNote(item)}>
              <MessageSquare className={cn("h-4 w-4", item.notes && "text-icon-active")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{item.notes ? 'Edit note' : 'Add a note'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => onEdit(item)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit item details</TooltipContent>
        </Tooltip>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{item.quantity} x {item.name}" from your trip.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export const PackingListItem: React.FC<PackingListItemProps> = (props) => {
  const { item, onUpdate, mode = 'packing' } = props;

  const handleCheckboxChange = (checked: boolean) => {
    if (mode === 'packing') {
      onUpdate(item.id, { packed: checked });
    } else { // mode === 'tobuy'
      onUpdate(item.id, { isToBuy: false }); // Mark as "bought"
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border-b">
        {/* --- Mobile Layout (Stacked) --- */}
        <div className="flex flex-col py-3 md:hidden">
          <div className="flex items-center gap-4">
            <Checkbox
              className="w-5 h-5"
              checked={mode === 'packing' ? item.packed : false}
              onCheckedChange={handleCheckboxChange}
            />
            <div className="flex-grow">
              <span className="font-medium text-foreground">
                {item.quantity} x {item.name}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pl-9 pt-2">
            <ItemActions {...props} mode={mode} />
          </div>
        </div>

        {/* --- Desktop Layout (Single Row) --- */}
        <div className="hidden md:flex items-center gap-4 py-2">
          <Checkbox
            className="w-5 h-5"
            checked={mode === 'packing' ? item.packed : false}
            onCheckedChange={handleCheckboxChange}
          />
          <div className="flex-grow">
            <span className="font-medium text-foreground">
              {item.quantity} x {item.name}
            </span>
          </div>
          <ItemActions {...props} mode={mode} />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PackingListItem;