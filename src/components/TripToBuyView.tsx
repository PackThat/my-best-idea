import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PackingListItem } from './PackingListItem';
import { Category, Subcategory, Item, Person, Bag, CatalogItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// This is the same helper component we built inside TripItemsView
const ItemsAccordion: React.FC<{
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
  mode: 'packing' | 'tobuy';
}> = ({ title, items, categories, subcategories, people, bags, onUpdate, onDelete, updateCatalogItem, onEditItem, onEditNote, mode }) => {

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

  const itemsByCategory = groupItemsBy(items, 'categoryId');
  const sortedCategoryIds = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === 'uncategorized') return 1; if (b === 'uncategorized') return -1;
    const catA = categories.find(c => c.id === a)?.name || '';
    const catB = categories.find(c => c.id === b)?.name || '';
    return catA.localeCompare(catB);
  });

  return (
    <Accordion type="multiple" defaultValue={[title.toLowerCase().replace(/ /g, '-')]} className="w-full space-y-2">
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
            <AccordionTrigger>{categoryName} ({categoryItems.length})</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Accordion type="multiple" className="w-full">
                {sortedSubcategoryIds.map(subcategoryId => {
                  const subcategory = subcategories.find(sc => sc.id === subcategoryId);
                  const subName = subcategoryId === 'uncategorized' ? 'Uncategorized' : subcategory?.name;
                  const subcategoryItems = itemsBySubcategory[subcategoryId];
                  return (
                    <AccordionItem value={subcategoryId} key={subcategoryId}>
                      <AccordionTrigger className="text-sm">{subName} ({subcategoryItems.length})</AccordionTrigger>
                      <AccordionContent className="pl-4">
                        {subcategoryItems.map(item => (
                          <PackingListItem 
                            key={item.id} item={item} people={people} bags={bags}
                            onUpdate={onUpdate} onDelete={onDelete}
                            updateCatalogItem={updateCatalogItem} onEdit={onEditItem} onEditNote={onEditNote}
                            mode={mode}
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
  );
};

export const TripToBuyView: React.FC = () => {
  const {
    currentTrip, setView, categories, subcategories, people, bags,
    updateItem, deleteItem, updateCatalogItem
  } = useAppContext();

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingNoteItem, setEditingNoteItem] = useState<Item | null>(null);

  const toBuyItems = (currentTrip?.items || []).filter(item => item.isToBuy);

  return (
    <div className="w-full md:max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="justify-self-start">
            <Button variant="outline" onClick={() => setView('trip-home')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trip
            </Button>
          </div>
          <h2 className="text-2xl font-bold justify-self-center">To Buy List</h2>
          <div className="w-[110px]" />
        </div>
        
        <div className="w-full md:max-w-screen-md mx-auto">
          {toBuyItems.length > 0 ? (
            <ItemsAccordion
              title="To Buy"
              items={toBuyItems}
              categories={categories}
              subcategories={subcategories}
              people={people}
              bags={bags}
              onUpdate={updateItem}
              onDelete={deleteItem}
              updateCatalogItem={updateCatalogItem}
              onEditItem={setEditingItem}
              onEditNote={setEditingNoteItem}
              mode="tobuy"
            />
          ) : (
            <Card className="bg-card">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nothing on your shopping list yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripToBuyView;