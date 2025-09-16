import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Briefcase } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PackingListItem } from './PackingListItem';
import { Category, Subcategory, Item, Person, Bag, CatalogItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import NoteEditDialog from './NoteEditDialog';
import EditTripItemDialog from './EditTripItemDialog';

const groupItemsBy = (items: Item[], key: keyof Item) => {
  return items.reduce((acc, item) => {
    const groupKey = item[key] as string | number | undefined;
    const finalKey = groupKey === undefined ? 'uncategorized' : groupKey;
    if (!acc[finalKey]) {
      acc[finalKey] = [];
    }
    acc[finalKey].push(item);
    return acc;
  }, {} as Record<string | number, Item[]>);
};

interface ItemsAccordionProps {
  title: string;
  items: Item[];
  bag?: Bag | null;
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
  title, items, bag, categories, subcategories, people, bags, onUpdate, onDelete, updateCatalogItem, onEditItem, onEditNote 
}) => {
  if (items.length === 0) return null;

  const itemsByCategory = groupItemsBy(items, 'categoryId');
  const sortedCategoryIds = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === 'uncategorized') return 1; if (b === 'uncategorized') return -1;
    const catA = categories.find(c => c.id === a)?.name || '';
    const catB = categories.find(c => c.id === b)?.name || '';
    return catA.localeCompare(catB);
  });

  return (
    <AccordionItem value={title.toLowerCase().replace(/ /g, '-')}>
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Badge className="bg-counter-badge text-counter-badge-foreground">{items.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {sortedCategoryIds.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const categoryName = categoryId === 'uncategorized' ? 'Uncategorized' : category?.name;
            const categoryItems = itemsByCategory[categoryId];
            
            return (
              <div key={categoryId} className="py-2">
                <h4 className="font-semibold text-muted-foreground mb-2">{categoryName}</h4>
                <div className="pl-2 border-l-2">
                  {categoryItems.map(item => (
                    <PackingListItem 
                      key={item.id} item={item} people={people} bags={bags}
                      onUpdate={onUpdate} onDelete={onDelete}
                      updateCatalogItem={updateCatalogItem} onEdit={onEditItem} onEditNote={onEditNote}
                      contextBagId={bag?.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface BagDetailViewProps {
  bagId: string;
  onBack: () => void;
}

const BagDetailView: React.FC<BagDetailViewProps> = ({ bagId, onBack }) => {
  const {
    bags, currentTrip, setView, categories, subcategories, people,
    updateItem, deleteItem, updateCatalogItem, setAddingForBagId
  } = useAppContext();

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingNoteItem, setEditingNoteItem] = useState<Item | null>(null);

  const bag = bags.find(b => b.id === Number(bagId));
  const bagItems = (currentTrip?.items || []).filter(item => item.bagId === Number(bagId));
  const unpackedItems = bagItems.filter(item => !item.packed);
  const packedItems = bagItems.filter(item => item.packed);

  const tripPeople = useMemo(() => {
    if (!currentTrip?.peopleIds) return [];
    return people.filter(p => currentTrip.peopleIds!.includes(p.id));
  }, [currentTrip, people]);

  const handleSaveNote = (itemId: string, newNote: string | undefined) => {
    updateItem(itemId, { notes: newNote });
  };
  
  const handleAddItemForBag = () => {
    if (bag) {
      setAddingForBagId(bag.id);
      setView('trip-add-item');
    }
  };

  if (!bag) {
    return (
      <div className="w-full md:max-w-screen-lg mx-auto">
        <p>Bag not found.</p>
        <Button onClick={onBack}>Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="justify-self-start">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bags
            </Button>
          </div>
          <div className="justify-self-center flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h2 className="text-2xl font-bold">{bag.name}</h2>
          </div>
          <div className="justify-self-end">
            <Button onClick={handleAddItemForBag}>
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
              bag={bag}
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
              bag={bag}
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
          
          {bagItems.length === 0 && (
             <Card className="bg-card mt-4">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No items assigned to {bag.name} yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {editingItem && (
          <EditTripItemDialog
            open={!!editingItem}
            onOpenChange={() => setEditingItem(null)}
            item={editingItem}
            tripPeople={tripPeople}
            tripBags={[bag]}
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

export default BagDetailView;