import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ChevronRight, Plus } from 'lucide-react';
import { Person, Category, Subcategory } from '@/types';

interface PersonPackingViewProps {
  personId: string;
}

const PersonPackingView: React.FC<PersonPackingViewProps> = ({ personId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const {
    people,
    items,
    categories,
    subcategories,
    updateItem,
    setView,
    setAddingForPersonId,
  } = useAppContext();

  const person = people.find(p => p.id === Number(personId));
  const personItems = items.filter(item => item.personId === Number(personId));

  if (!person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('trip-people')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Button>
          <h2 className="text-2xl font-bold">Person Not Found</h2>
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
          <h2 className="text-2xl font-bold">{subcategory?.name}</h2>
        </div>
        
        <div className="space-y-2">
          {subcategoryItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleItemPacked(item.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${item.packed ? 'line-through text-muted-foreground' : ''}`}>
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
          <h2 className="text-2xl font-bold">{category?.name}</h2>
        </div>
        
        <div className="space-y-4">
          {categoryItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleItemPacked(item.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${item.packed ? 'line-through text-muted-foreground' : ''}`}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setView('trip-people')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to People
            </Button>
            <h2 className="text-2xl font-bold">{person.name}</h2>
        </div>
        <Button
            onClick={() => {
            if (person) {
                setAddingForPersonId(person.id);
                setView('trip-add-item');
            }
            }}
            size="lg"
        >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
        </Button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">CATEGORIES</h3>
        {categoriesWithItems.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
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
              <p className="text-muted-foreground mb-4">No items assigned to {person.name} yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Item" to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
};

export default PersonPackingView;