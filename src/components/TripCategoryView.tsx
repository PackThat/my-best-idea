import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import ItemCard from './ItemCard';

interface TripCategoryViewProps {
  categoryId: string;
  onBack: () => void;
  onSubcategoryClick: (subcategoryId: string) => void;
}

const TripCategoryView: React.FC<TripCategoryViewProps> = ({ 
  categoryId, 
  onBack, 
  onSubcategoryClick 
}) => {
  const { categories, subcategories, items, bags, people, updateItem, deleteItem } = useAppContext();
  
  const category = categories.find(c => c.id === categoryId);
  const categoryItems = items.filter(item => item.categoryId === categoryId);
  
  // Get subcategories that have items in this category
  const usedSubcategories = subcategories.filter(sub => 
    sub.categoryId === categoryId && 
    items.some(item => item.subcategoryId === sub.id)
  );
  
  // Get items that don't have a subcategory
  const itemsWithoutSubcategory = categoryItems.filter(item => !item.subcategoryId);
  
  const getSubcategoryStats = (subcategoryId: string) => {
    const subItems = items.filter(item => item.subcategoryId === subcategoryId);
    const packedItems = subItems.filter(item => item.packed);
    return {
      total: subItems.length,
      packed: packedItems.length
    };
  };

  if (!category) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
          <p className="text-gray-600">{categoryItems.length} items in this category</p>
        </div>
      </div>

      {/* Subcategories */}
      {usedSubcategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Subcategories</h3>
          <div className="grid gap-4">
            {usedSubcategories.map((subcategory) => {
              const stats = getSubcategoryStats(subcategory.id);
              const progress = stats.total > 0 ? (stats.packed / stats.total) * 100 : 0;
              
              return (
                <Card 
                  key={subcategory.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => onSubcategoryClick(subcategory.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                          <p className="text-sm text-gray-600">
                            {stats.packed} of {stats.total} items packed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={progress === 100 ? "default" : "secondary"}
                          className={progress === 100 ? "bg-green-500" : ""}
                        >
                          {Math.round(progress)}%
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Items without subcategory */}
      {itemsWithoutSubcategory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {itemsWithoutSubcategory.map((item) => {
              const bag = bags.find(b => b.id === item.bagId);
              const person = people.find(p => p.id === item.personId);
              
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  category={category}
                  subcategory={undefined}
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
        </div>
      )}
    </div>
  );
};

export default TripCategoryView;