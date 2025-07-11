import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Backpack, ClipboardList, ShoppingBag, ListTodo } from 'lucide-react';

interface HomeViewProps {}

const HomeView: React.FC<HomeViewProps> = () => {
  const { 
    currentTripType, 
    setView, 
    tripPeople, 
    tripBags, 
    items, 
    todos 
  } = useAppContext();

  // Calculate counts for the badges
  const peopleCount = tripPeople.length;
  const bagsCount = tripBags.length;
  const packedItemsCount = items.filter(item => item.packed).length;
  const totalItemsCount = items.length;
  const toBuyCount = items.filter(item => item.needsToBuy).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;
  const totalTodosCount = todos.length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{currentTripType}</h2>
      
      <p className="text-muted-foreground">
        Select an option below to manage your trip details.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setView('trip-people')}>
          <Users className="h-6 w-6" />
          <span>People</span>
          <Badge variant="default">{peopleCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setView('trip-bags')}>
          <Backpack className="h-6 w-6" />
          <span>Bags</span>
          <Badge variant="default">{bagsCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => alert('Trip Items view not implemented yet.')}>
          <ClipboardList className="h-6 w-6" />
          <span>Items</span>
          <Badge variant="default">
            {packedItemsCount}/{totalItemsCount}
          </Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => alert('To Buy view not implemented yet.')}>
          <ShoppingBag className="h-6 w-6" />
          <span>To Buy</span>
          <Badge variant="default">{toBuyCount}</Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => alert('To Do view not implemented yet.')}>
          <ListTodo className="h-6 w-6" />
          <span>To Do</span>
          <Badge variant="default">
            {completedTodosCount}/{totalTodosCount}
          </Badge>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;