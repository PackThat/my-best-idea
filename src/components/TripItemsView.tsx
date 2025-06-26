import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ChevronRight, Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { AddItemDialog } from '@/components/AddItemDialog';

interface TripItemsViewProps {
  onBack: () => void;
  onCategoryClick: (categoryId: string) => void;
}

const TripItemsView: React.FC<TripItemsViewProps> = ({ onBack, onCategoryClick }) => {
  const { categories, items } = useAppContext();
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  // Get categories that have items in this trip
  const usedCategories = categories.filter(category => 
    items.some(item => item.categoryId === category.id)
  );

  const getCategoryStats = (categoryId: string) => {
    const categoryItems = items.filter(item => item.categoryId === categoryId);
    const packedItems = categoryItems.filter(item => item.packed);
    return {
      total: categoryItems.length,
      packed: packedItems.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trip Categories</h2>
            <p className="text-gray-600">{usedCategories.length} categories with items</p>
          </div>
        </div>
        <Button onClick={() => setShowAddItemDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ADD ITEM
        </Button>
      </div>

      <div className="grid gap-4">
        {usedCategories.map((category) => {
          const stats = getCategoryStats(category.id);
          const progress = stats.total > 0 ? (stats.packed / stats.total) * 100 : 0;
          
          return (
            <Card 
              key={category.id} 
              className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
              onClick={() => onCategoryClick(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stats.packed} of {stats.total} items packed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={progress === 100 ? "default" : "secondary"}
                      className={progress === 100 ? "bg-green-500" : ""}
                    >
                      {Math.round(progress)}%
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {usedCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Yet</h3>
            <p className="text-gray-600">Add some items to see categories here.</p>
            <Button 
              onClick={() => setShowAddItemDialog(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      <AddItemDialog 
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
      />
    </div>
  );
};

export default TripItemsView;