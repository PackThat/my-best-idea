import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Menu, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface PackingHeaderProps {
  onAddItem?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
}

const PackingHeader: React.FC<PackingHeaderProps> = ({
  showBackButton = false,
  onBackClick,
  backButtonText = 'Back to Trip'
}) => {
  const { toggleSidebar, currentTripId } = useAppContext();

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold">PackThat!</h1>
        </div>
        
        {showBackButton && currentTripId && onBackClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="text-white hover:bg-white/20 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PackingHeader;