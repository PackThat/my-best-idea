import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Subcategory } from '@/types';

export const CatalogSubcategoryListView: React.FC = () => {
  const { setView, categories, subcategories, addingCategoryId, setAddingSubcategoryId } = useAppContext();

  const selectedCategory = categories.find(c => c.id === addingCategoryId);
  
  // Filter AND Sort alphabetically
  const categorySubcategories = subcategories
    .filter(sc => sc.categoryId === addingCategoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!selectedCategory) {
    setView('items-management');
    return null;
  }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingSubcategoryId(subcategory.id);
    setView('catalog-item-list' as any);
  };

  const handleEdit = (e: React.MouseEvent, sub: Subcategory) => {
    e.stopPropagation(); 
    console.log("Edit subcategory", sub.name);
  };

  const handleDelete = (e: React.MouseEvent, sub: Subcategory) => {
    e.stopPropagation(); 
    console.log("Delete subcategory", sub.name);
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="default" onClick={() => setView('items-management')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
        </div>
        <Button size="sm" onClick={() => console.log("Add New Subcategory")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
        </Button>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-2">
        {categorySubcategories.map(subcategory => (
          <Card 
            key={subcategory.id} 
            className="hover:bg-muted/50 transition-colors cursor-pointer bg-card"
            onClick={() => handleSubcategoryClick(subcategory)}
          >
            {/* py-2 matches the standard list exactly */}
            <CardContent className="py-2 px-4 flex justify-between items-center min-h-[40px]">
              <span className="font-medium">{subcategory.name}</span>
              
              {/* Wrapper is h-6 (24px) to match text line-height exactly.
                 Icon is h-4 (16px) so it is readable.
              */}
              <div className="flex items-center gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => handleEdit(e, subcategory)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, subcategory)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {categorySubcategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No subcategories found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CatalogSubcategoryListView;