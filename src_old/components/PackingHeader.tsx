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
  backButtonText = 'Back'
}) => {
  const { toggleSidebar, currentTripId } = useAppContext();

  return (
    <div className="bg-header text-header-foreground p-4">
      {/* This is now a 3-column grid to perfectly center the title */}
      <div className="grid grid-cols-3 items-center">
        
        {/* Left Column */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-black/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center Column */}
        <div className="flex justify-center items-center gap-2">
          <Package className="h-7 w-7" />
          <h1 className="text-2xl font-bold">PackThat!</h1>
        </div>

        {/* Right Column */}
        <div className="flex justify-end">
          {showBackButton && currentTripId && onBackClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="hover:bg-black/10 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backButtonText}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PackingHeader;