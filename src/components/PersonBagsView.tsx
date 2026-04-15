import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, Plus } from 'lucide-react';
import ItemCard from './ItemCard';
import { Person } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface PersonBagsViewProps {
  person: Person;
  onBack: () => void;
}

export const PersonBagsView: React.FC<PersonBagsViewProps> = ({ person, onBack }) => {
  // We grab the direct tools from the AppContext instead of 'state' or 'dispatch'
  const { 
    items, 
    bags, 
    categories, 
    subcategories, 
    people,
    updateItem, 
    deleteItem,
    addMultipleCatalogItemsToTripItems 
  } = useAppContext();

  // 1. Get bags that have items for this specific person
  const personBags = bags.filter(bag => 
    items.some(item => String(item.personId) === String(person.id) && String(item.bagId) === String(bag.id))
  );

  // 2. Get items for this person grouped by bag
  const getItemsForBag = (bagId: number | string) => {
    return items.filter(item => String(item.personId) === String(person.id) && String(item.bagId) === String(bagId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">{person.name}'s Items</h2>
      </div>

      {/* Quick Summary Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Total Packing Progress</span>
            </div>
            <Badge variant="secondary" className="text-lg">
              {items.filter(i => String(i.personId) === String(person.id) && i.packed).length} / {items.filter(i => String(i.personId) === String(person.id)).length} Packed
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bags with Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Bags Assigned to {person.name}
        </h3>
        
        {personBags.length > 0 ? (
          personBags.map(bag => {
            const bagItems = getItemsForBag(bag.id);
            const packedCount = bagItems.filter(item => item.packed).length;
            const totalCount = bagItems.length;

            return (
              <Card key={bag.id} className="overflow-hidden">
                <CardHeader className="bg-muted/20 border-b py-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bag.color }} />
                      {bag.name}
                    </span>
                    <Badge variant={packedCount === totalCount ? "default" : "secondary"}>
                      {packedCount}/{totalCount}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {bagItems.map(item => (
                      <ItemCard 
                        key={item.id} 
                        item={item}
                        bags={bags}
                        people={people}
                        category={categories.find(c => c.id === item.categoryId)}
                        subcategory={subcategories.find(s => s.id === item.subcategoryId)}
                        bag={bag}
                        person={person}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-card">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">No bags with items found for {person.name}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonBagsView;