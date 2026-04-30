import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PackingListItem } from './PackingListItem';
import { Category, Subcategory, Item, Person, Bag, CatalogItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import EditTripItemDialog from './EditTripItemDialog';
import NoteEditDialog from './NoteEditDialog';

const groupItemsBy = (items: Item[], key: keyof Item) => {
  return items.reduce((acc, item) => {
    const groupKey = item[key] as string | number;
    if (groupKey === undefined) {
      acc['uncategorized'] = acc['uncategorized'] || [];
      acc['uncategorized'].push(item);
      return acc;
    }
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string | number, Item[]>);
};

interface ItemsAccordionProps {
  title: string;
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  people: Person[];
  bags: Bag[];
  onUpdate: (itemId: string, updates: Partial<Item>) => void;
  onDelete: (itemId:string) => void;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  onEditItem: (item: Item) => void;
  onEditNote: (item: Item) => void;
  showFavoritesOnly: boolean;
  catalog_items: CatalogItem[];
}

const ItemsAccordion: React.FC<ItemsAccordionProps> = ({ 
  title, items, categories, subcategories, people, bags, onUpdate, onDelete, updateCatalogItem, onEditItem, onEditNote, showFavoritesOnly, catalog_items 
}) => {
  if (items.length === 0) return null;

  const itemsByCategory = groupItemsBy(items, 'categoryId');
  const sortedCategoryIds = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === 'uncategorized') return 1;
    if (b === 'uncategorized') return -1;
    const catA = categories.find(c => c.id === a)?.name || '';
    const catB = categories.find(c => c.id === b)?.name || '';
    return catA.localeCompare(catB);
  });

  return (
    <AccordionItem value={title.toLowerCase().replace(/ /g, '-')} className="border-b-0">
      <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline py-4">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Badge className="bg-counter-badge text-counter-badge-foreground h-5 min-w-5 flex items-center justify-center p-0 px-1">{items.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <Accordion type="multiple" className="w-full space-y-2 pl-1">
          {sortedCategoryIds.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const categoryName = categoryId === 'uncategorized' ? 'Uncategorized' : category?.name;
            const categoryItems = itemsByCategory[categoryId];

            const itemsWithNoSubcategory = categoryItems.filter(item => !item.subcategoryId);
            const itemsWithSubcategory = categoryItems.filter(item => item.subcategoryId);
            const itemsBySubcategory = groupItemsBy(itemsWithSubcategory, 'subcategoryId');
            const sortedSubcategoryIds = Object.keys(itemsBySubcategory).sort((a,b) => {
              const subA = subcategories.find(s => s.id === a)?.name || '';
              const subB = subcategories.find(s => s.id === b)?.name || '';
              return subA.localeCompare(subB);
            });

            // Check for favorites in this category for the tan star
            const hasFavorites = catalog_items.some(ci => ci.categoryId === categoryId && ci.is_favorite);
            
            return (
              <AccordionItem value={categoryId} key={categoryId} className="border rounded-lg bg-card overflow-hidden mb-2 shadow-sm">
                <AccordionTrigger className="px-3 py-2 text-sm font-bold hover:no-underline hover:bg-muted data-[state=open]:bg-muted">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{categoryName} ({categoryItems.length})</span>
                    {showFavoritesOnly && hasFavorites && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-1">
                  <div className="space-y-0">
                    {itemsWithNoSubcategory.map(item => (
                      <PackingListItem 
                        key={item.id} 
                        item={item}
                        people={people}
                        bags={bags}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        updateCatalogItem={updateCatalogItem}
                        onEdit={onEditItem}
                        onEditNote={onEditNote}
                      />
                    ))}
                  </div>

                   {sortedSubcategoryIds.length > 0 && (
                    <Accordion type="multiple" className="w-full mt-1">
                      {sortedSubcategoryIds.map(subcategoryId => {
                        const subcategory = subcategories.find(sc => sc.id === subcategoryId);
                        const subName = subcategoryId === 'uncategorized' ? 'Uncategorized' : subcategory?.name;
                        const subcategoryItems = itemsBySubcategory[subcategoryId];
                        const subHasFavorites = catalog_items.some(ci => ci.subcategoryId === subcategoryId && ci.is_favorite);

                        return (
                          <AccordionItem value={subcategoryId} key={subcategoryId} className="border-0">
                            <AccordionTrigger className={cn("px-3 py-2 text-xs font-semibold rounded-none hover:no-underline border-t",
                              "data-[state=open]:bg-secondary/30"
                            )}>
                              <div className="flex items-center gap-2">
                                <span className="truncate">{subName} ({subcategoryItems.length})</span>
                                {showFavoritesOnly && subHasFavorites && <Star className="h-3 w-3 fill-icon-active text-icon-active" />}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-2 pt-0 pb-1">
                                {subcategoryItems.map(item => (
                                  <PackingListItem 
                                    key={item.id} item={item} people={people} bags={bags}
                                    onUpdate={onUpdate} onDelete={onDelete}
                                    updateCatalogItem={updateCatalogItem} onEdit={onEditItem} onEditNote={onEditNote}
                                  />
                                ))}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};


export const TripItemsView: React.FC = () => {
  const {
    currentTrip,
    setView,
    categories,
    subcategories,
    catalog_items,
    people,
    bags,
    updateItem,
    deleteItem,
    updateCatalogItem,
    showFavoritesOnly
  } = useAppContext();

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingNoteItem, setEditingNoteItem] = useState<Item | null>(null);

  const allItems = currentTrip?.items || [];
  const unpackedItems = allItems.filter(item => !item.packed);
  const packedItems = allItems.filter(item => item.packed);
  
  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people.filter(p => currentTrip.peopleIds!.includes(p.id));
  }, [currentTrip, people]);

  const tripBags = useMemo(() => {
    if (!currentTrip?.bagIds) return [];
    return bags.filter(b => currentTrip.bagIds!.includes(b.id));
  }, [currentTrip, bags]);

  const handleSaveNote = (itemId: string, newNote: string | undefined) => {
    updateItem(itemId, { notes: newNote });
  };

  return (
    <div className="w-full max-w-screen-md mx-auto space-y-4 pb-24 px-4 pt-4 overflow-x-hidden">
      {/* Tightened Mobile Header */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="default" size="sm" onClick={() => setView('trip-home')} className="h-9 px-3 shrink-0">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <h2 className="text-xl font-bold truncate text-center flex-grow">Packing List</h2>
        
        <Button size="sm" onClick={() => setView('trip-add-item')} className="h-9 px-3 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs sm:text-sm">Add</span>
        </Button>
      </div>

      <div className="w-full">
        <Accordion type="multiple" defaultValue={['to-be-packed']} className="space-y-2">
          <ItemsAccordion
            title="To Be Packed"
            items={unpackedItems}
            categories={categories}
            subcategories={subcategories}
            people={people}
            bags={bags}
            onUpdate={updateItem}
            onDelete={deleteItem}
            updateCatalogItem={updateCatalogItem}
            onEditItem={setEditingItem}
            onEditNote={setEditingNoteItem}
            showFavoritesOnly={showFavoritesOnly}
            catalog_items={catalog_items}
          />
          <ItemsAccordion
            title="Packed"
            items={packedItems}
            categories={categories}
            subcategories={subcategories}
            people={people}
            bags={bags}
            onUpdate={updateItem}
            onDelete={deleteItem}
            updateCatalogItem={updateCatalogItem}
            onEditItem={setEditingItem}
            onEditNote={setEditingNoteItem}
            showFavoritesOnly={showFavoritesOnly}
            catalog_items={catalog_items}
          />
        </Accordion>
      </div>

      {editingItem && (
        <EditTripItemDialog
          open={!!editingItem}
          onOpenChange={() => setEditingItem(null)}
          item={editingItem}
          tripPeople={tripPeople}
          tripBags={tripBags}
          onSave={updateItem}
        />
      )}

      {editingNoteItem && (
        <NoteEditDialog
          open={!!editingNoteItem}
          onOpenChange={() => setEditingNoteItem(null)}
          item={editingNoteItem}
          onSaveNote={handleSaveNote}
        />
      )}
    </div>
  );
};

export default TripItemsView;