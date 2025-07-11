import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import HomeView from './HomeView';
import { TripsList } from './TripsList';
import PersonView from './PersonView';
import CategoryView from './CategoryView';
import { ViewState } from '@/types'; // Now correctly imports the shared type

interface PackingAppContentProps {
  viewState: ViewState;
  onTripViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'trips') => void; // Corrected typo here
  onNavigateToTripHome: () => void;
  onPersonClick: (personId: string) => void;
  onCategoryClick: (categoryId: string, personId?: string) => void;
  onBackToList: () => void;
}

const PackingAppContent: React.FC<PackingAppContentProps> = ({
  viewState,
  onTripViewChange, // Corrected typo here
  onNavigateToTripHome,
  onPersonClick,
  onCategoryClick,
  onBackToList
}) => {
  const { currentTripId } = useAppContext();

  const renderContent = () => {
    switch (viewState.type) {
      case 'home':
        return <HomeView onViewChange={onTripViewChange} />;
      
      case 'list':
        return <TripsList onTripSelected={onNavigateToTripHome} />;

      case 'person':
        if (!viewState.personId) return null;
        return (
          <PersonView
            personId={viewState.personId}
            onCategoryClick={onCategoryClick}
            onBack={onBackToList}
          />
        );
      
      case 'category':
        if (!viewState.categoryId) return null;
        return (
          <CategoryView
            categoryId={viewState.categoryId}
            personId={viewState.personId}
            onBack={onBackToList}
          />
        );
      
      default:
        // Fallback view
        return currentTripId ? <HomeView onViewChange={onTripViewChange} /> : <TripsList onTripSelected={onNavigateToTripHome} />;
    }
  };

  return renderContent();
};

export default PackingAppContent;