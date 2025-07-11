import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus } from 'lucide-react';
import { CategorySubcategorySelector } from './CategorySubcategorySelector';
import { ItemSelectionDialog } from './ItemSelectionDialog';
import { AddItemDialog } from './TripAddItemDialog';
import ItemCard from './ItemCard';
import { Bag } from '@/types';

interface BagDetailViewProps {
  bag: Bag;
  onBack: () => void;
}

const BagDetailView: React.FC<BagDetailViewProps> = ({ bag, onBack }) => {
  const { items, categories, subcategories, bags, people, updateItem, deleteItem } = useAppContext();
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showAddNewItem, setShowAddNewItem] = useState(false);

  const bagItems = items.filter(item => item.bagId === bag.id);
  const packedItems = bagItems.filter(item => item.packed);
  const progress = bagItems.length > 0 ? (packedItems.length / bagItems.length) * 100 : 0;

  const handleAddItem = () => {
    setShowAddItem(true);
  };

  const handleCategorySelect = (categoryId: string, subcategoryId?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId || '');
    setShowAddItem(false);
    setShowItemSelection(true);
  };

  const handleAddNewItem = () => {
    setShowItemSelection(false);
    setShowAddNewItem(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Bags
        </Button>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: bag.color }}
          />
          <h2 className="text-2xl font-bold text-gray-900">{bag.name}</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span>Items packed: {packedItems.length} of {bagItems.length}</span>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {Math.round(progress)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items in this bag</h3>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bagItems.map((item) => {
          const category = categories.find(c => c.id === item.categoryId);
          const subcategory = subcategories.find(s => s.id === item.subcategoryId);
          const person = people.find(p => p.id === item.personId);
          
          return (
            <ItemCard
              key={item.id}
              item={item}
              category={category}
              subcategory={subcategory}
              bag={bag}
              person={person}
              bags={bags}
              people={people}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          );
        })}
      </div>

      {bagItems.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>No items in this bag yet.</p>
              <Button onClick={handleAddItem} className="mt-4">
                Add Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CategorySubcategorySelector
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onSelect={handleCategorySelect}
      />

      <ItemSelectionDialog
        open={showItemSelection}
        onOpenChange={setShowItemSelection}
        categoryId={selectedCategory}
        subcategoryId={selectedSubcategory}
        bagId={bag.id}
        onAddNew={handleAddNewItem}
      />

      <AddItemDialog
        open={showAddNewItem}
        onOpenChange={setShowAddNewItem}
        defaultBagId={bag.id}
        defaultCategoryId={selectedCategory}
        defaultSubcategoryId={selectedSubcategory}
      />
    </div>
  );
};

export default BagDetailView;