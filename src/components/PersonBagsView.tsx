import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, Plus } from 'lucide-react';
import { CategorySubcategorySelector } from './CategorySubcategorySelector';
import { AddItemDialog } from './TripAddItemDialog';
import ItemCard from './ItemCard';
import { Person, Bag } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface PersonBagsViewProps {
  person: Person;
  onBack: () => void;
}

export const PersonBagsView: React.FC<PersonBagsViewProps> = ({ person, onBack }) => {
  const { state, dispatch } = useAppContext();
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  // Get bags that have items for this person
  const personBags = state.bags.filter(bag => 
    state.items.some(item => item.personId === person.id && item.bagId === bag.id)
  );

  // Get items for this person grouped by bag
  const getItemsForBag = (bagId: string) => {
    return state.items.filter(item => item.personId === person.id && item.bagId === bagId);
  };

  // Get items for category/subcategory selection
  const getFilteredItems = () => {
    return state.items.filter(item => {
      if (!selectedCategory) return false;
      if (item.categoryId !== selectedCategory) return false;
      if (selectedSubcategory && item.subcategoryId !== selectedSubcategory) return false;
      return true;
    });
  };

  const handleAddItem = (itemData: any) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...itemData,
        id: Date.now().toString(),
        personId: person.id,
      }
    });
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

      {/* Category/Subcategory Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Items by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategorySubcategorySelector
            categories={state.categories}
            subcategories={state.subcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={setSelectedCategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
          
          {selectedCategory && (
            <div className="flex gap-2">
              <Button onClick={() => setShowAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </div>
          )}

          {/* Show filtered items */}
          {selectedCategory && (
            <div className="grid gap-2">
              {getFilteredItems().map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bags with Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bags</h3>
        {personBags.map(bag => {
          const bagItems = getItemsForBag(bag.id);
          const packedCount = bagItems.filter(item => item.packed).length;
          const totalCount = bagItems.length;

          return (
            <Card key={bag.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {bag.name}
                  </span>
                  <Badge variant="outline">
                    {packedCount}/{totalCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {bagItems.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        categories={state.categories}
        subcategories={state.subcategories}
        bags={state.bags}
        people={state.people}
        onAddItem={handleAddItem}
        onAddPerson={(person) => dispatch({ type: 'ADD_PERSON', payload: { ...person, id: Date.now().toString() } })}
        onAddCategory={(category) => dispatch({ type: 'ADD_CATEGORY', payload: { ...category, id: Date.now().toString() } })}
        onAddSubcategory={(subcategory) => dispatch({ type: 'ADD_SUBCATEGORY', payload: { ...subcategory, id: Date.now().toString() } })}
        onAddBag={(bag) => dispatch({ type: 'ADD_BAG', payload: { ...bag, id: Date.now().toString() } })}
      />
    </div>
  );
};

export default PersonBagsView;