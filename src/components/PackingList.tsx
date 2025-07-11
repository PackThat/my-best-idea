import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, User, Package, Plus } from 'lucide-react';
import { Item, Person, Category, Subcategory, Bag } from '@/types';
import ItemCard from './ItemCard';
import { Button } from './ui/button';

interface PackingListProps {
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
  showAddButton: boolean;
}

const PackingList: React.FC<PackingListProps> = ({
  items,
  categories,
  subcategories,
  bags,
  people,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  showAddButton,
}) => {
  // Group items by person
  const itemsByPerson: { [key: string]: Item[] } = items.reduce((acc, item) => {
    const personId = item.personId || 'unassigned';
    if (!acc[personId]) {
      acc[personId] = [];
    }
    acc[personId].push(item);
    return acc;
  }, {} as { [key: string]: Item[] });

  const getPersonById = (personId: string) => people.find(p => p.id === personId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Packing List</h2>
        {showAddButton && (
          <Button onClick={onAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>
      
      {Object.entries(itemsByPerson).map(([personId, personItems]) => {
        const person = personId !== 'unassigned' ? getPersonById(personId) : null;
        const packedCount = personItems.filter(item => item.packed).length;
        const totalCount = personItems.length;

        if (totalCount === 0) return null;

        return (
          <Card key={personId} className="overflow-hidden">
            <CardHeader className="pb-3 bg-gray-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {person ? (
                    <>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: person.color }}
                      />
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold">{person.name}</span>
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold">Unassigned Items</span>
                    </>
                  )}
                </div>
                <Badge variant={packedCount === totalCount ? 'default' : 'secondary'}>
                  {packedCount}/{totalCount} packed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {personItems.map((item) => {
                  const itemCategory = categories.find(c => c.id === item.categoryId);
                  const subcategory = subcategories.find(s => s.id === item.subcategoryId);
                  const bag = bags.find(b => b.id === item.bagId);
                  
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      category={itemCategory}
                      subcategory={subcategory}
                      bag={bag}
                      person={person}
                      bags={bags}
                      people={people}
                      onUpdate={onUpdateItem}
                      onDelete={onDeleteItem}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {items.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <Package size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">This packing list is empty.</h3>
          <p className="mt-1 text-sm text-gray-500">Click the button below to add your first item.</p>
          <Button onClick={onAddItem} className="mt-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default PackingList;