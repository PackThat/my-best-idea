import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Subcategory } from '@/types';

export const TripAddSubcategoryView: React.FC = () => {
  const { setView, categories, subcategories, addingCategoryId, setAddingSubcategoryId } = useAppContext();

  const selectedCategory = categories.find(c => c.id === addingCategoryId);
  const categorySubcategories = subcategories.filter(sc => sc.categoryId === addingCategoryId);

  if (!selectedCategory) {
    setView('trip-add-item');
    return null;
  }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingSubcategoryId(subcategory.id);
    setView('trip-add-item-list');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setView('trip-add-item')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
      </div>

      <div className="space-y-2">
        {categorySubcategories.map(subcategory => (
          <Card 
            key={subcategory.id} 
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleSubcategoryClick(subcategory)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <span className="font-medium">{subcategory.name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TripAddSubcategoryView;