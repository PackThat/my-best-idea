import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
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
}

const ItemsAccordion: React.FC<ItemsAccordionProps> = ({ 
  title, items, categories, subcategories, people, bags, onUpdate, onDelete, updateCatalogItem, onEditItem, onEditNote 
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
    <AccordionItem value={title.toLowerCase().replace(/ /g, '-')}>
      <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Badge className="bg-counter-badge text-counter-badge-foreground">{items.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Accordion type="multiple" className="w-full space-y-1 pl-2">
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
            
            return (
              <AccordionItem value={categoryId} key={categoryId} className="border rounded-md bg-card overflow-hidden">
                <AccordionTrigger className="px-3 py-2 text-base font-semibold hover:bg-muted data-[state=open]:bg-muted rounded-md">
                  {categoryName} ({categoryItems.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-2">
                  <div className="border-l-2">
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
                    <Accordion type="multiple" className="w-full">
                      {sortedSubcategoryIds.map(subcategoryId => {
                        const subcategory = subcategories.find(sc => sc.id === subcategoryId);
                        const subName = subcategoryId === 'uncategorized' ? 'Uncategorized' : subcategory?.name;
                        const subcategoryItems = itemsBySubcategory[subcategoryId];
                        return (
                          <AccordionItem value={subcategoryId} key={subcategoryId} className="border-0">
                            <AccordionTrigger className={cn("px-2 py-2 text-sm font-medium rounded-sm hover:bg-accent",
                              "data-[state=open]:bg-secondary data-[state=open]:text-secondary-foreground"
                            )}>
                              {subName} ({subcategoryItems.length})
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pt-1">
                              <div className="border-l-2">
                                {subcategoryItems.map(item => (
                                  <PackingListItem 
                                    key={item.id} item={item} people={people} bags={bags}
                                    onUpdate={onUpdate} onDelete={onDelete}
                                    updateCatalogItem={updateCatalogItem} onEdit={onEditItem} onEditNote={onEditNote}
                                  />
                                ))}
                              </div>
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
    people,
    bags,
    updateItem,
    deleteItem,
    updateCatalogItem,
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
    <div className="w-full md:max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="justify-self-start">
            <Button variant="default" onClick={() => setView('trip-home')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trip
            </Button>
          </div>
          <h2 className="text-2xl font-bold justify-self-center">Packing List</h2>
          <div className="justify-self-end">
            <Button onClick={() => setView('trip-add-item')}>
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <div className="w-full md:max-w-screen-md mx-auto">
          <Accordion type="multiple" defaultValue={['to-be-packed']} className="space-y-4">
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
    </div>
  );
};

export default TripItemsView;