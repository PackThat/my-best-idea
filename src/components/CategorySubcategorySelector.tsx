import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface CategorySubcategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (categoryId: string, subcategoryId?: string) => void;
}

export const CategorySubcategorySelector: React.FC<CategorySubcategorySelectorProps> = ({
  open,
  onOpenChange,
  onSelect
}) => {
  const { categories, subcategories, items } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    const categorySubcats = subcategories.filter(sub => sub.categoryId === categoryId);
    if (categorySubcats.length === 0) {
      onSelect(categoryId);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (selectedCategory) {
      onSelect(selectedCategory, subcategoryId);
    }
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onOpenChange(false);
    }
  };

  const getItemsCount = (categoryId: string, subcategoryId?: string) => {
    return items.filter(item => 
      item.categoryId === categoryId && 
      (subcategoryId ? item.subcategoryId === subcategoryId : !item.subcategoryId)
    ).length;
  };

  const selectedCategoryData = selectedCategory ? 
    categories.find(c => c.id === selectedCategory) : null;
  const categorySubcategories = selectedCategory ? 
    subcategories.filter(sub => sub.categoryId === selectedCategory) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {selectedCategoryData ? 
              `Select Subcategory - ${selectedCategoryData.name}` : 
              'Select Category'
            }
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!selectedCategory ? (
            // Show categories
            categories.map((category) => {
              const itemCount = getItemsCount(category.id);
              const subcatCount = subcategories.filter(sub => sub.categoryId === category.id).length;
              
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardHeader>
                    {/* FIXED: Removed the color dot logic causing the error */}
                    <CardTitle className="text-sm">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <Badge variant="secondary">{itemCount} items</Badge>
                      {subcatCount > 0 && (
                        <div className="text-xs text-gray-600">
                          {subcatCount} subcategories
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Show subcategories
            categorySubcategories.map((subcategory) => {
              const itemCount = getItemsCount(selectedCategory, subcategory.id);
              
              return (
                <Card 
                  key={subcategory.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSubcategorySelect(subcategory.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-sm">{subcategory.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{itemCount} items</Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySubcategorySelector;