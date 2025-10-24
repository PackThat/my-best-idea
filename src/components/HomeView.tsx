import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Users, Backpack, ClipboardList, ShoppingBag, ListTodo, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Define the props the component will accept
interface HomeViewProps {
  onViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'todo' | 'settings') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {
  const {
    currentTrip,
    people: allPeople,
    bags: allBags,
    items,
    todos
  } = useAppContext();

  if (!currentTrip) {
    return (
      <div className="w-full md:max-w-screen-lg mx-auto">
        <div className="flex justify-center items-center h-full">
          <p className="text-xl text-muted-foreground">Loading trip details or no trip selected...</p>
        </div>
      </div>
    );
  }

  const tripPeople = allPeople.filter(person => currentTrip.peopleIds?.includes(person.id));
  const tripBags = allBags.filter(bag => currentTrip.bagIds?.includes(bag.id));
  
  const peopleCount = tripPeople.length;
  const bagsCount = tripBags.length;
  const packedItemsCount = items.filter(item => item.packed).length;
  const totalItemsCount = items.length;
  const toBuyCount = items.filter(item => item.isToBuy).length;
  const totalTodosCount = todos.length;

  const cardItems = [
    { id: 'people', icon: Users, label: 'People', count: peopleCount, stat: null },
    { id: 'bags', icon: Backpack, label: 'Bags', count: bagsCount, stat: null },
    { id: 'items', icon: ClipboardList, label: 'Items', count: null, stat: `${packedItemsCount}/${totalItemsCount}` },
    { id: 'tobuy', icon: ShoppingBag, label: 'To Buy', count: toBuyCount, stat: null },
    { id: 'todo', icon: ListTodo, label: 'To Do', count: totalTodosCount, stat: null },
    { id: 'settings', icon: Settings, label: 'Settings', count: null, stat: null },
  ] as const;

  return (
    <div className="w-full md:max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">{currentTrip.name}</h2>

        <p className="text-muted-foreground">
          Select an option below to manage your trip details.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {cardItems.map((card) => (
            <Card 
              key={card.id}
              className="cursor-pointer hover:bg-accent bg-trip-card"
              onClick={() => card.id === 'todo' ? alert('To Do view not implemented yet.') : onViewChange(card.id)}
            >
              <CardContent className="h-24 flex flex-col items-center justify-center gap-1 p-2 text-trip-card-foreground">
                <card.icon className="h-6 w-6" />
                <span className="font-medium">{card.label}</span>
                <Badge className="bg-counter-badge text-counter-badge-foreground">
                  {card.stat || card.count}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;