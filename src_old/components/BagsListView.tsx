import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';
import { Bag, Item } from '@/types';
import { AddBagDialog } from './TripAddBagDialog';

interface BagsListViewProps {
  bags: Bag[];
  items: Item[];
  onBagClick: (bagId: string) => void;
}

const BagsListView: React.FC<BagsListViewProps> = ({
  bags,
  items,
  onBagClick,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Bags</h2>
          <Badge variant="outline">{bags.length}</Badge>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Bag
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bags.map((bag) => {
          const bagItems = items.filter(item => item.bagId === bag.id);
          const packedItems = bagItems.filter(item => item.packed);
          
          return (
            <Card 
              key={bag.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onBagClick(bag.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: bag.color }}
                  />
                  {bag.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Items:</span>
                    <Badge variant="outline">{bagItems.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Packed:</span>
                    <Badge variant={packedItems.length === bagItems.length ? "default" : "secondary"}>
                      {packedItems.length}/{bagItems.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bags.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bags added yet</h3>
          <p className="text-gray-500 mb-4">Add bags to start organizing your packing.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Bag
          </Button>
        </div>
      )}

      <AddBagDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default BagsListView;