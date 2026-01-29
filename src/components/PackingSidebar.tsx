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

    // --- NAVIGATION ROUTING LOGIC ---
    
    // 1. People Page (Has its own URL)
    if (newView === 'people-management' as any) {
      setView(newView);
      return navigate('/people');
    }
    
    // 2. Bags Page (Has its own URL)
    if (newView === 'bags-management' as any) {
      setView(newView);
      return navigate('/bags');
    }
    
    // 3. My Trips (Resets to Home)
    if (newView === 'my-trips') {
      clearCurrentTrip(); // Resets trip AND view
      return navigate('/');
    }

    // 4. FIX: Item Catalog
    if (newView === 'items-management') {
        // STEP 1: Clear the trip first (which defaults view to 'my-trips')
        clearCurrentTrip(); 
        
        // STEP 2: IMMEDIATELY override the view back to Catalog
        // This ensures 'items-management' wins the race
        setView('items-management');
        
        return navigate('/');
    }

    // Default for other internal views (like 'global-tobuy')
    setView(newView);
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
      "bg-sidebar", 
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          <div className="flex justify-between items-center bg-sidebar-header text-sidebar-header-foreground rounded-md px-2 py-1">
            <h3 className="font-bold text-lg">PackThat!</h3>
            <Button variant="ghost" size="icon" className="hover:bg-black/10 dark:hover:bg-white/10" onClick={toggleSidebar}>
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
                  {showSection && <h3 className="text-sm font-semibold text-sidebar-foreground px-2 pt-4 pb-2">{item.section}</h3>}
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
                       <Badge className={cn(
                        "ml-auto rounded-full w-6 h-6 flex items-center justify-center",
                        "bg-sidebar-counter-badge text-sidebar-counter-badge-foreground"
                      )}>
                        {item.count}
                      </Badge>
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