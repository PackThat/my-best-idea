import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PackingListItem } from './PackingListItem';
import { Category, Subcategory, Item, Person, Bag, CatalogItem } from '@/types';
import { Badge } from '@/components/ui/badge';
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
  onDelete: (itemId: string) => void;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  onEditItem: (item: Item) => void;
  onEditNote: (item: Item) => void;
}

const ItemsAccordion: React.FC<ItemsAccordionProps> = ({ 
  title, items, categories, subcategories, people, bags, onUpdate, onDelete, updateCatalogItem, onEditItem, onEditNote 
}) => {
  const { catalog_items } = useAppContext(); 

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
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Badge variant={title === 'Packed' ? 'default' : 'secondary'}>{items.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {sortedCategoryIds.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const categoryName = categoryId === 'uncategorized' ? 'Uncategorized' : category?.name;
            const categoryItems = itemsByCategory[categoryId];
            const itemsBySubcategory = groupItemsBy(categoryItems, 'subcategoryId');
            const sortedSubcategoryIds = Object.keys(itemsBySubcategory).sort((a,b) => {
              const subA = subcategories.find(s => s.id === a)?.name || '';
              const subB = subcategories.find(s => s.id === b)?.name || '';
              return subA.localeCompare(subB);
            });
            
            return (
              <AccordionItem value={categoryId} key={categoryId} className="border rounded-md bg-card px-4">
                <AccordionTrigger>
                  {categoryName} ({categoryItems.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <Accordion type="multiple" className="w-full">
                    {sortedSubcategoryIds.map(subcategoryId => {
                      const subcategory = subcategories.find(sc => sc.id === subcategoryId);
                      const subcategoryItems = itemsBySubcategory[subcategoryId];
                      return (
                        <AccordionItem value={subcategoryId} key={subcategoryId}>
                          <AccordionTrigger className="text-sm">
                            {subcategory?.name} ({subcategoryItems.length})
                          </AccordionTrigger>
                          <AccordionContent className="pl-4">
                            {subcategoryItems.map(item => (
                              <PackingListItem 
                                key={item.id} 
                                item={item}
                                people={people}
                                bags={bags}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                catalog_items={catalog_items}
                                updateCatalogItem={updateCatalogItem}
                                onEdit={onEditItem}
                                onEditNote={onEditNote}
                              />
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('trip-home')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip
          </Button>
          <h2 className="text-2xl font-bold">Packing List</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setView('trip-add-item')}>
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={['to-be-packed']} className="w-full space-y-4">
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