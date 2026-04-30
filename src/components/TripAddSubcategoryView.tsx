import React, { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Subcategory } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const TripAddSubcategoryView: React.FC = () => {
  const { 
    setView, categories, subcategories, catalog_items,
    addingCategoryId, setAddingSubcategoryId, showFavoritesOnly, setShowFavoritesOnly 
  } = useAppContext();

  const selectedCategory = categories.find(c => c.id === addingCategoryId);
  
  // LOGIC: Does this specific subcategory contain any favorite items?
  const subcategoryHasFavorites = (subId: string) => {
    return catalog_items.some(item => item.subcategoryId === subId && item.is_favorite);
  };

  const categorySubcategories = useMemo(() => {
    let subs = subcategories.filter(sc => sc.categoryId === addingCategoryId);
    if (showFavoritesOnly) {
      subs = subs.filter(s => subcategoryHasFavorites(s.id));
    }
    return subs.sort((a, b) => a.name.localeCompare(b.name));
  }, [subcategories, addingCategoryId, showFavoritesOnly, catalog_items]);

  if (!selectedCategory) { setView('trip-add-item'); return null; }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setAddingSubcategoryId(subcategory.id);
    setView('trip-add-item-list');
  };

  return (
    <div className="w-full md:max-w-screen-lg mx-auto space-y-6 pb-24 px-4 pt-4">
      <div className="flex items-center gap-4">
        <Button variant="default" size="sm" onClick={() => setView('trip-add-item')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-bold truncate">{selectedCategory.name}</h2>
      </div>

      <div className="w-full md:max-w-screen-md mx-auto space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <Checkbox id="trip-sub-show-favorites" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(Boolean(checked))} />
          <Label htmlFor="trip-sub-show-favorites" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
            Show Favourites Only <Star className={cn("h-3 w-3", showFavoritesOnly ? "fill-icon-active text-icon-active" : "text-muted-foreground")} />
          </Label>
        </div>

        <div className="space-y-2">
          {categorySubcategories.length > 0 ? (
            categorySubcategories.map(subcategory => (
              <Card key={subcategory.id} className="hover:bg-muted/50 transition-colors cursor-pointer bg-card" onClick={() => handleSubcategoryClick(subcategory)}>
                <CardContent className="py-2 px-4 flex justify-between items-center min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{subcategory.name}</span>
                    {/* Star appears if folder has favorites, regardless of toggle */}
                    {subcategoryHasFavorites(subcategory.id) && (
                      <Star className="h-3 w-3 fill-icon-active text-icon-active" />
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">{showFavoritesOnly ? "No favourite folders here." : "No folders found."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripAddSubcategoryView;