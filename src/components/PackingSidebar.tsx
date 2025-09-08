// src/components/PackingSidebar.tsx
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
  X,
  Plus
} from 'lucide-react';
import { useAppContext, AppView } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const PackingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    people,
    bags,
    trips,
    view,
    setView,
    sidebarOpen,
    toggleSidebar,
    clearCurrentTrip,
  } = useAppContext();

  const handleViewChange = (newView: AppView) => {
    if (sidebarOpen) {
      toggleSidebar();
    }
    setView(newView);
    if (newView === 'people-management' as any) {
      return navigate('/people');
    }
    if (newView === 'bags-management' as any) {
      return navigate('/bags');
    }
    if (newView === 'my-trips') {
      clearCurrentTrip();
      return navigate('/');
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
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-200 ease-in-out",
      "bg-sidebar text-sidebar-foreground",
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-sidebar-foreground">PackThat!</h3>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-black/10 dark:hover:bg-white/10" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-1 mt-4">
            {menuItems.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              lastSection = item.section || lastSection;
              const isActive = view === item.id;

              return (
                <React.Fragment key={item.id}>
                  {showSection && <h3 className="text-sm font-semibold text-sidebar-muted-foreground px-2 pt-4 pb-2">{item.section}</h3>}
                  <Button
                    className={cn(
                      "w-full justify-start h-10",
                      isActive
                        ? "bg-sidebar-button-active text-sidebar-button-active-foreground hover:bg-sidebar-button-active/90"
                        : "bg-sidebar-button text-sidebar-button-foreground hover:bg-sidebar-button/90"
                    )}
                    onClick={() => handleViewChange(item.id as any)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.count !== undefined && (
                      <Badge className="ml-auto bg-sidebar-badge text-sidebar-badge-foreground">{item.count}</Badge>
                    )}
                  </Button>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4 border-t border-border">
        <Button
          variant="default"
          className="w-full justify-center"
          onClick={() => handleViewChange('create-trip-page')}
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Trip
        </Button>
      </div>
    </div>
  );
};

export default PackingSidebar;