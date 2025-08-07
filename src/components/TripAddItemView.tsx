import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Category } from '@/types';

export const TripAddItemView: React.FC = () => {
  const { setView, categories, catalog_items, setAddingCategoryId } = useAppContext();

  const favoriteItems = catalog_items.filter(item => item.is_favorite);
  const favoritesCategory = favoriteItems.length > 0 ? { id: 'favorites', name: 'Favorites' } as Category : null;

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  
  const displayCategories = favoritesCategory ? [favoritesCategory, ...sortedCategories] : sortedCategories;

  const handleCategoryClick = (categoryId: string) => {
    setAddingCategoryId(categoryId);
    setView('trip-add-subcategory');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setView('trip-items')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packing List
        </Button>
        <h2 className="text-2xl font-bold">Add Item: Select a Category</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for items, categories..."
          className="pl-11 bg-white"
          disabled
        />
      </div>

      <div className="space-y-2">
        {displayCategories.map(category => (
          <Card 
            key={category.id} 
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleCategoryClick(category.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <span className="font-medium">{category.name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TripAddItemView;