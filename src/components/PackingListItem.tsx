import React from 'react';
import { Item, Person, Bag, CatalogItem } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, DollarSign, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getInitials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

interface PackingListItemProps {
  item: Item;
  people: Person[];
  bags: Bag[];
  catalog_items: CatalogItem[];
  onUpdate: (itemId: string, updates: Partial<Item>) => void;
  onDelete: (itemId: string) => void;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  onEdit: (item: Item) => void;
  onEditNote: (item: Item) => void;
  mode?: 'packing' | 'tobuy';
}

export const PackingListItem: React.FC<PackingListItemProps> = ({ 
  item, 
  people, 
  bags, 
  catalog_items, 
  onUpdate, 
  onDelete, 
  updateCatalogItem, 
  onEdit, 
  onEditNote,
  mode = 'packing' 
}) => {
  const assignedPerson = people.find(p => p.id === item.personId);
  const assignedBag = bags.find(b => b.id === item.bagId);
  const catalogItem = item.catalogItemId ? catalog_items.find(ci => ci.id === item.catalogItemId) : null;
  const isFavorite = catalogItem?.is_favorite || false;

  const handleFavoriteToggle = () => {
    if (catalogItem) {
      updateCatalogItem(catalogItem.id, { is_favorite: !isFavorite });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (mode === 'packing') {
      onUpdate(item.id, { packed: checked });
    } else { // mode === 'tobuy'
      onUpdate(item.id, { isToBuy: false });
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-4 py-2 border-b">
        <Checkbox
          className="w-5 h-5"
          checked={mode === 'packing' ? item.packed : false}
          onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}
        />
        
        <div className="flex-grow flex items-center gap-3">
          <span className="font-medium text-card-foreground whitespace-nowrap">
            {item.quantity} x {item.name}
          </span>
        </div>

        <div className="flex items-center justify-center w-8">
          {assignedPerson && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: assignedPerson.color }}>
                  {getInitials(assignedPerson.name)}
                </div>
              </TooltipTrigger>
              <TooltipContent>{assignedPerson.name}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center justify-start w-24">
          {assignedBag && (
            <span className="text-sm text-muted-foreground">{assignedBag.name}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleFavoriteToggle}>
            <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-400 text-yellow-500")} />
          </Button>
          {mode === 'packing' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onUpdate(item.id, { isToBuy: !item.isToBuy })}>
              <DollarSign className={cn("h-4 w-4", item.isToBuy && "text-yellow-500")} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEditNote(item)}>
            <MessageSquare className={cn("h-4 w-4", item.notes && "text-yellow-500")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(item)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive">
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
      </div>
    </TooltipProvider>
  );
};

export default PackingListItem;