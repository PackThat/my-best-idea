import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Backpack, ClipboardList, ShoppingBag, ListTodo } from 'lucide-react';

interface HomeViewProps {}

const HomeView: React.FC<HomeViewProps> = () => {
  const {
    currentTrip, // We need the currentTrip object to get its peopleIds and bagIds
    setView,
    people: allPeople, // Alias global 'people' to 'allPeople' to avoid naming conflict
    bags: allBags,     // Alias global 'bags' to 'allBags'
    items,             // These are already currentTripItems from AppContext
    todos              // These are already currentTripTodos from AppContext
  } = useAppContext();

  // Ensure currentTrip exists before accessing its properties
  // If currentTrip is null, all counts will be 0, and the name will be "Loading Trip..." or similar.
  if (!currentTrip) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-muted-foreground">Loading trip details or no trip selected...</p>
      </div>
    );
  }

  // Filter global people/bags to get only those associated with the current trip
  const tripPeople = allPeople.filter(person => currentTrip.peopleIds?.includes(person.id));
  const tripBags = allBags.filter(bag => currentTrip.bagIds?.includes(bag.id));

  // Calculate counts for the badges
  const peopleCount = tripPeople.length;
  const bagsCount = tripBags.length;
  const packedItemsCount = items.filter(item => item.packed).length;
  const totalItemsCount = items.length;
  // Assuming 'isToBuy' is the correct property for "To Buy" items in your Item type
  const toBuyCount = items.filter(item => item.isToBuy).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;
  const totalTodosCount = todos.length;

  return (
    <div className="space-y-6">
      {/* Display the actual trip name from currentTrip */}
      <h2 className="text-3xl font-bold tracking-tight">{currentTrip.name}</h2>

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
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setView('trip-items')}>
          <ClipboardList className="h-6 w-6" />
          <span>Items</span>
          <Badge variant="default">
            {packedItemsCount}/{totalItemsCount}
          </Badge>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setView('global-tobuy')}>
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