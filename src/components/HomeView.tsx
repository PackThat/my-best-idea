import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Backpack, ClipboardList, ShoppingBag, ListTodo } from 'lucide-react';

// Define the props the component will accept
interface HomeViewProps {
  onViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'todo') => void;
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
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-muted-foreground">Loading trip details or no trip selected...</p>
      </div>
    );
  }

  const tripPeople = allPeople.filter(person => currentTrip.peopleIds?.includes(person.id));
  const tripBags = allBags.filter(bag => currentTrip.bagIds?.includes(bag.id));
  
  // Note: Your 'Item' type in AppContext uses 'isToBuy', but your 'TodoItem' does not have a 'completed' property.
  // The counts below will be adjusted to reflect the available data.
  const peopleCount = tripPeople.length;
  const bagsCount = tripBags.length;
  const packedItemsCount = items.filter(item => item.packed).length;
  const totalItemsCount = items.length;
  const toBuyCount = items.filter(item => item.isToBuy).length;
  const totalTodosCount = todos.length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{currentTrip.name}</h2>

      <p className="text-muted-foreground">
        Select an option below to manage your trip details.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onViewChange('people')}>
          <Users className="h-6 w-6" />
          <span>People</span>
          <Badge variant="default">{peopleCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onViewChange('bags')}>
          <Backpack className="h-6 w-6" />
          <span>Bags</span>
          <Badge variant="default">{bagsCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onViewChange('items')}>
          <ClipboardList className="h-6 w-6" />
          <span>Items</span>
          <Badge variant="default">
            {packedItemsCount}/{totalItemsCount}
          </Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onViewChange('tobuy')}>
          <ShoppingBag className="h-6 w-6" />
          <span>To Buy</span>
          <Badge variant="default">{toBuyCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => alert('To Do view not implemented yet.')}>
          <ListTodo className="h-6 w-6" />
          <span>To Do</span>
          <Badge variant="default">{totalTodosCount}</Badge>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;