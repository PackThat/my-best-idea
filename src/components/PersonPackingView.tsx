import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Plus, Package, ChevronRight } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import { Person, Category, Subcategory, Item } from '@/types';

interface PersonPackingViewProps {
  personId: string;
  onBack: () => void;
}

const PersonPackingView: React.FC<PersonPackingViewProps> = ({ personId, onBack }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const {
    people,
    items,
    categories,
    subcategories,
    bags,
    addItem,
    addItemToPacking,
    updateItem,
  } = useAppContext();

  const person = people.find(p => p.id === personId);
  const personItems = items.filter(item => item.personId === personId);

  if (!person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Person Not Found</h2>
        </div>
      </div>
    );
  }

  const toggleItemPacked = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, { packed: !item.packed });
    }
  };

  const getCategoriesWithItems = () => {
    const categoriesWithItems = new Set<string>();
    personItems.forEach(item => {
      if (item.categoryId) {
        categoriesWithItems.add(item.categoryId);
      }
    });
    return Array.from(categoriesWithItems)
      .map(catId => categories.find(c => c.id === catId))
      .filter(Boolean) as Category[];
  };

  const getItemsForCategory = (categoryId: string) => {
    return personItems.filter(item => 
      item.categoryId === categoryId && !item.subcategoryId
    );
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    const subcatIds = new Set<string>();
    personItems.forEach(item => {
      if (item.categoryId === categoryId && item.subcategoryId) {
        subcatIds.add(item.subcategoryId);
      }
    });
    return Array.from(subcatIds)
      .map(subId => subcategories.find(s => s.id === subId))
      .filter(Boolean) as Subcategory[];
  };

  const getItemsForSubcategory = (subcategoryId: string) => {
    return personItems.filter(item => item.subcategoryId === subcategoryId);
  };

  if (selectedSubcategory) {
    const subcategory = subcategories.find(s => s.id === selectedSubcategory);
    const subcategoryItems = getItemsForSubcategory(selectedSubcategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedSubcategory(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{subcategory?.name}</h2>
        </div>
        
        <div className="space-y-2">
          {subcategoryItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleItemPacked(item.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : ''}`}>
                    {item.name}
                  </span>
                  <Badge variant={item.packed ? "default" : "secondary"}>
                    {item.packed ? "Packed" : "Not Packed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    const categoryItems = getItemsForCategory(selectedCategory);
    const categorySubcategories = getSubcategoriesForCategory(selectedCategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{category?.name}</h2>
        </div>
        
        <div className="space-y-4">
          {categoryItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleItemPacked(item.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : ''}`}>
                    {item.name}
                  </span>
                  <Badge variant={item.packed ? "default" : "secondary"}>
                    {item.packed ? "Packed" : "Not Packed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {categorySubcategories.map((subcategory) => (
            <Card key={subcategory.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSubcategory(subcategory.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subcategory.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoriesWithItems = getCategoriesWithItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
      </div>
      
      <Button 
        onClick={() => setShowAddDialog(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        ADD ITEM
      </Button>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">CATEGORIES</h3>
        {categoriesWithItems.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {categoriesWithItems.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 mb-4">No items assigned to {person.name} yet.</p>
              <p className="text-sm text-gray-400">Click "ADD ITEM" to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ItemSelectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        items={items}
        people={people}
        bags={bags}
        onAddItemToPacking={addItemToPacking}
        onAddNewItem={addItem}
        preselectedPersonId={personId}
      />
    </div>
  );
};

export default PersonPackingView;