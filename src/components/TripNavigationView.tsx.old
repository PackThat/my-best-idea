import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Package, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface TripNavigationViewProps {
  onViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy') => void;
}

const TripNavigationView: React.FC<TripNavigationViewProps> = ({ onViewChange }) => {
  const { items, people, tripBags, bags } = useAppContext();

  console.log('🧭 TripNavigationView - tripBags:', tripBags);
  console.log('🧭 TripNavigationView - bags:', bags);

  // Show all people, not just those with items assigned
  const tripPeopleCount = people.length;
  const peopleWithItems = people.filter(person => 
    items.some(item => item.personId === person.id)
  ).length;
  const packedPeopleItems = items.filter(item => item.packed && item.personId).length;
  const totalPeopleItems = items.filter(item => item.personId).length;
  
  // Count bags added to this trip - use tripBags array length
  const tripBagsCount = tripBags.length;
  const packedBagItems = items.filter(item => item.packed && item.bagId).length;
  const totalBagItems = items.filter(item => item.bagId).length;
  
  const totalItems = items.length;
  const packedItems = items.filter(item => item.packed).length;
  const toBuyItems = items.filter(item => item.needsToBuy).length;
  const boughtItems = items.filter(item => item.needsToBuy && item.bought).length;

  const buttons = [
    {
      id: 'people' as const,
      label: 'PEOPLE',
      icon: Users,
      count: tripPeopleCount,
      description: `${packedPeopleItems}/${totalPeopleItems} packed`
    },
    {
      id: 'bags' as const,
      label: 'BAGS',
      icon: Briefcase,
      count: tripBagsCount,
      description: `${packedBagItems}/${totalBagItems} packed`
    },
    {
      id: 'items' as const,
      label: 'ITEMS',
      icon: Package,
      count: totalItems,
      description: `${packedItems}/${totalItems} packed`
    },
    {
      id: 'tobuy' as const,
      label: 'TO BUY',
      icon: ShoppingCart,
      count: toBuyItems,
      description: `${boughtItems}/${toBuyItems} bought`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Navigation</h2>
        <p className="text-gray-600">Choose a section to manage your trip</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <Card 
              key={button.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50" 
              onClick={() => onViewChange(button.id)}
            >
              <CardContent className="p-6 text-center">
                <Icon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="text-lg font-semibold mb-1">{button.label}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">{button.count}</div>
                <p className="text-sm text-gray-600">{button.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TripNavigationView;