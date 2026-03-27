import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Package, ShoppingCart, CheckSquare, Plus } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import { useAppContext } from '@/contexts/AppContext';

interface TripMainViewProps {
  onViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'todo') => void;
}

const TripMainView: React.FC<TripMainViewProps> = ({ onViewChange }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    categories,
    subcategories,
    bags,
    people,
    items,
    addItem,
    addItemToPacking,
  } = useAppContext();

  const buttons = [
    {
      id: 'people' as const,
      label: 'PEOPLE',
      icon: Users,
      description: 'Manage trip participants'
    },
    {
      id: 'bags' as const,
      label: 'BAGS',
      icon: Briefcase,
      description: 'Organize packing bags'
    },
    {
      id: 'items' as const,
      label: 'ITEMS',
      icon: Package,
      description: 'View all items'
    },
    {
      id: 'tobuy' as const,
      label: 'TO BUY',
      icon: ShoppingCart,
      description: 'Items to purchase'
    },
    {
      id: 'todo' as const,
      label: 'TO DO',
      icon: CheckSquare,
      description: 'Trip tasks'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Overview</h2>
        <p className="text-gray-600">Choose a section to manage your trip</p>
      </div>
      
      <div className="mb-4">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          ADD ITEM
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <Card key={button.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewChange(button.id)}>
              <CardContent className="p-6 text-center">
                <Icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">{button.label}</h3>
                <p className="text-sm text-gray-600 mb-4">{button.description}</p>
                <Button className="w-full">
                  Open {button.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ItemSelectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        items={items}
        people={people}
        bags={bags}
        onAddItemToPacking={addItemToPacking}
        onAddNewItem={addItem}
      />
    </div>
  );
};

export default TripMainView;