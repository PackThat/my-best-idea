import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  ShoppingCart,
  ListTodo,
  Layers,
  Users,
  Briefcase,
  X
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const PackingSidebar: React.FC = () => {
  const {
    people,
    bags,
    trips,
    view,
    setView,
    sidebarOpen,
    toggleSidebar,
    clearCurrentTrip, // Get the function from the context
  } = useAppContext();

  const handleViewChange = (newView: string) => {
    // The 'All Trips' button now uses a different function
    if (newView === 'my-trips') {
      clearCurrentTrip();
      if (sidebarOpen) {
        toggleSidebar();
      }
      return;
    }

    if (newView === 'global-tobuy' || newView === 'global-todo') {
      alert('This view has not been implemented yet.');
      return;
    }
    setView(newView as any);
    if (sidebarOpen) {
      toggleSidebar();
    }
  };

  const menuItems = [
    { id: 'my-trips', label: 'My Trips', icon: Home, section: 'Navigation', count: trips.length },
    { id: 'global-tobuy', label: 'To Buy', icon: ShoppingCart, count: '0/0', section: 'Action' },
    { id: 'global-todo', label: 'To Do', icon: ListTodo, count: '0/0', section: 'Action' },
    { id: 'items-management', label: 'Item Catalog', icon: Layers, section: 'App Data' },
    { id: 'people-management', label: 'People', icon: Users, count: people.length },
    { id: 'bags-management', label: 'Bags', icon: Briefcase, count: bags.length },
  ];

  let lastSection = '';

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Pack That</h3>
            <Button variant="ghost" size="icon" className="text-card-foreground hover:bg-black/10" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-1 mt-4">
            {menuItems.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              lastSection = item.section || lastSection;

              return (
                <React.Fragment key={item.id}>
                  {showSection && <h3 className="text-sm font-semibold text-card-foreground/70 px-2 pt-4 pb-2">{item.section}</h3>}
                  <Button
                    variant={view === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-card-foreground"
                    onClick={() => handleViewChange(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.count !== undefined && (
                      <Badge variant="default" className="ml-auto">{item.count}</Badge>
                    )}
                  </Button>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PackingSidebar;