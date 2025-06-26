import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import AddToBuyItemDialog from './AddToBuyItemDialog';

interface TripToBuyViewProps {
  onBack: () => void;
}

const TripToBuyView: React.FC<TripToBuyViewProps> = ({ onBack }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    items,
    categories,
    subcategories,
    people,
    bags,
    updateItem,
    addItem,
  } = useAppContext();

  // Filter items that need to be bought
  const toBuyItems = items.filter(item => item.needsToBuy);

  const handleToggleBought = (itemId: string, bought: boolean) => {
    updateItem(itemId, { needsToBuy: !bought });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId?: string) => {
    if (!subcategoryId) return null;
    return subcategories.find(s => s.id === subcategoryId)?.name;
  };

  const getPersonName = (personId?: string) => {
    if (!personId) return null;
    return people.find(p => p.id === personId)?.name;
  };

  const getBagName = (bagId?: string) => {
    if (!bagId) return null;
    return bags.find(b => b.id === bagId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Items to Buy</h2>
      </div>
      
      <div className="mb-4">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD ITEM TO BUY
        </Button>
      </div>
      
      <div className="space-y-4">
        {toBuyItems.map((item) => {
          const categoryName = getCategoryName(item.categoryId);
          const subcategoryName = getSubcategoryName(item.subcategoryId);
          const personName = getPersonName(item.personId);
          const bagName = getBagName(item.bagId);
          
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={!item.needsToBuy}
                    onCheckedChange={(checked) => handleToggleBought(item.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline">Qty: {item.quantity}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">{categoryName}</Badge>
                      {subcategoryName && (
                        <Badge variant="outline">{subcategoryName}</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {personName && (
                        <span className="bg-blue-100 px-2 py-1 rounded">
                          👤 {personName}
                        </span>
                      )}
                      {bagName && (
                        <span className="bg-green-100 px-2 py-1 rounded">
                          🎒 {bagName}
                        </span>
                      )}
                    </div>
                    
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {toBuyItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-4">No items marked for purchase yet.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item to Buy
            </Button>
          </CardContent>
        </Card>
      )}

      <AddToBuyItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        people={people}
        bags={bags}
        onAddItem={addItem}
      />
    </div>
  );
};

export default TripToBuyView;