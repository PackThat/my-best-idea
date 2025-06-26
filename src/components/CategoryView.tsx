import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus } from 'lucide-react';
import ItemCard from './ItemCard';
import ItemSelectionDialog from './ItemSelectionDialog';
import AddItemDialog from './AddItemDialog';

interface CategoryViewProps {
  categoryId: string;
  personId?: string;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ categoryId, personId, onBack }) => {
  const { 
    categories, 
    subcategories, 
    bags, 
    people, 
    items, 
    updateItem, 
    deleteItem,
    addItem,
    addPerson,
    addCategory,
    addSubcategory,
    addBag
  } = useAppContext();
  
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  const category = categories.find(c => c.id === categoryId);
  const person = personId ? people.find(p => p.id === personId) : null;
  
  if (!category) return null;

  const filteredItems = items.filter(item => 
    item.categoryId === categoryId && 
    (!personId || item.personId === personId)
  );

  const packedCount = filteredItems.filter(item => item.packed).length;
  const totalCount = filteredItems.length;

  const getTitle = () => {
    if (person) {
      return `${person.name} - ${category.name}`;
    }
    return category.name;
  };

  const handleSelectExistingItem = (selectedItem: any) => {
    // Create a copy of the selected item for this person/context
    const newItem = {
      ...selectedItem,
      personId: personId || selectedItem.personId,
      packed: false,
      needsToBuy: false
    };
    delete newItem.id; // Remove ID so a new one is generated
    addItem(newItem);
  };

  const handleCreateNewItem = () => {
    setShowAddItemDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <Badge variant="outline">
            {packedCount}/{totalCount} packed
          </Badge>
        </div>
        <Button 
          onClick={() => setShowItemSelection(true)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const itemCategory = categories.find(c => c.id === item.categoryId);
          const subcategory = subcategories.find(s => s.id === item.subcategoryId);
          const bag = bags.find(b => b.id === item.bagId);
          const itemPerson = people.find(p => p.id === item.personId);
          
          return (
            <ItemCard
              key={item.id}
              item={item}
              category={itemCategory}
              subcategory={subcategory}
              bag={bag}
              person={itemPerson}
              bags={bags}
              people={people}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No items found in this category.</p>
          <Button 
            onClick={() => setShowItemSelection(true)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      <ItemSelectionDialog
        open={showItemSelection}
        onOpenChange={setShowItemSelection}
        category={category}
        existingItems={items}
        onSelectItem={handleSelectExistingItem}
        onCreateNew={handleCreateNewItem}
      />

      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        categories={categories}
        subcategories={subcategories}
        bags={bags}
        people={people}
        onAddItem={addItem}
        onAddPerson={addPerson}
        onAddCategory={addCategory}
        onAddSubcategory={addSubcategory}
        onAddBag={addBag}
      />
    </div>
  );
};

export default CategoryView;