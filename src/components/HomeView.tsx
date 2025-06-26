import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Package, ShoppingCart, CheckSquare, Plus, MapPin } from 'lucide-react';
import ItemSelectionDialog from './ItemSelectionDialog';
import { useAppContext } from '@/contexts/AppContext';
import { TripsList } from './TripsList';

interface HomeViewProps {
  onViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'todo' | 'trips') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTrips, setShowTrips] = useState(false);
  const tripsRef = useRef<HTMLDivElement>(null);
  const {
    categories,
    subcategories,
    bags,
    people,
    items,
    addItem,
    addItemToPacking,
    currentTripId,
    trips
  } = useAppContext();

  const currentTrip = trips.find(trip => trip.id === currentTripId);

  const buttons = [
    {
      id: 'trips' as const,
      label: 'TRIPS',
      icon: MapPin,
      description: 'Manage your trips'
    },
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

  const handleButtonClick = (buttonId: string) => {
    if (buttonId === 'trips') {
      setShowTrips(true);
      if (trips.length > 0) {
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    } else {
      onViewChange(buttonId as any);
    }
  };

  if (showTrips) {
    return (
      <div className="space-y-6" ref={tripsRef}>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowTrips(false)}>
            ← Back to Home
          </Button>
        </div>
        <TripsList />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        {currentTrip ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTrip.name}</h2>
            {currentTrip.date && (
              <p className="text-gray-600">{new Date(currentTrip.date).toLocaleDateString()}</p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">PackThat!</h2>
            <p className="text-gray-600">Choose a section to get started</p>
          </div>
        )}
      </div>
      
      {currentTripId && (
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
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <Card key={button.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleButtonClick(button.id)}>
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

      {currentTripId && (
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
      )}
    </div>
  );
};

export default HomeView;