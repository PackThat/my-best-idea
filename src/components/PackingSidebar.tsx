import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  ShoppingCart, 
  CheckSquare, 
  Layers,
  FileSpreadsheet,
  Users,
  Briefcase,
  X
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { CatalogImportDialog } from './CatalogImportDialog';
import { Item, Bag, Person } from '@/types';
import { defaultPeople } from '@/data/defaultData';

interface PackingSidebarProps {
  items: Item[];
  bags: Bag[];
  people: Person[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCloseSidebar: () => void;
}

const PackingSidebar: React.FC<PackingSidebarProps> = ({
  items,
  bags,
  people,
  activeView,
  onViewChange,
  onCloseSidebar,
}) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  
  const packedCount = items.filter(item => item.packed).length;
  const totalCount = items.length;
  const toBuyCount = items.filter(item => item.needsToBuy).length;
  // Show all people from database, not just trip people
  const allPeopleCount = defaultPeople.length;
  const bagsCount = bags.length;

  const mainMenuItems = [
    { id: 'all', label: 'All Items', icon: Package, count: totalCount },
    { id: 'packed', label: 'Packed', icon: CheckSquare, count: packedCount },
    { id: 'tobuy', label: 'To Buy', icon: ShoppingCart, count: toBuyCount },
    { id: 'selector', label: 'Add by Category', icon: Layers },
    { id: 'items-import', label: 'Items', icon: FileSpreadsheet },
  ];

  const dataMenuItems = [
    { id: 'people-management', label: 'People', icon: Users, count: allPeopleCount },
    { id: 'bags-management', label: 'Bags', icon: Briefcase, count: bagsCount },
  ];

  const handleClose = () => {
    onCloseSidebar();
    if (window.innerWidth < 768) toggleSidebar();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } md:relative md:translate-x-0`}>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start mb-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleClose}
          >
            <X className="h-4 w-4 mr-2" />
            CLOSE
          </Button>
          
          <div className="space-y-2 mb-6">
            {mainMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  onViewChange(item.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.count !== undefined && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 px-2">App Data</h3>
            {dataMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  onViewChange(item.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.count !== undefined && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PackingSidebar;