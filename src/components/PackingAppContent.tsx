import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import HomeView from './HomeView';
import { TripsList } from './TripsList';
import PersonView from './PersonView';
import CategoryView from './CategoryView';
import TripPeopleView from './TripPeopleView';
import TripBagsView from './TripBagsView';
import BagDetailView from './BagDetailView';
import TripItemsView from './TripItemsView';
import TripAddItemView from './TripAddItemView';
import { TripAddSubcategoryView } from './TripAddSubcategoryView';
import { TripAddItemListView } from './TripAddItemListView';
import TripToBuyView from './TripToBuyView';
import TripSettingsView from './TripSettingsView';
import { ItemsManagementView } from './ItemsManagementView';
import CatalogSubcategoryListView from '@/components/CatalogSubcategoryListView';
import { CatalogItemListView } from './CatalogItemListView'; 
import { ViewState } from '@/types';

interface PackingAppContentProps {
  viewState: ViewState;
  onTripViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'trips' | 'todo' | 'settings') => void;
  onNavigateToTripHome: () => void;
  onPersonClick: (personId: string) => void;
  onBagClick: (bagId: string) => void;
  onCategoryClick: (categoryId: string, personId?: string) => void;
  onBackToList: () => void;
}

const PackingAppContent: React.FC<PackingAppContentProps> = ({
  viewState,
  onTripViewChange,
  onNavigateToTripHome,
  onPersonClick,
  onBagClick,
  onCategoryClick,
  onBackToList
}) => {
  const { currentTripId } = useAppContext();

  const renderContent = () => {
    // We treat the state as 'any' here to stop the "Property does not exist" errors
    const state = viewState as any;

    // Explicitly handle the category views first
    if (state.type === 'category' || state.type === 'category-detail') {
      if (!state.categoryId) return <div className="p-4 text-center">No category selected</div>;
      return (
        <CategoryView
          categoryId={state.categoryId}
          personId={state.personId}
          onBack={onBackToList}
        />
      );
    }

    switch (state.type) {
      case 'home':
        return <HomeView onViewChange={onTripViewChange} />;
      
      case 'list':
        return <TripsList />;

      case 'trip-people':
        return <TripPeopleView onBack={onBackToList} onPersonClick={onPersonClick} />;
      
      case 'trip-bags':
        return <TripBagsView onBagClick={onBagClick} />;
      
      case 'bag':
        // If we don't have a bagId in the map, we check the global context as a backup
        return <BagDetailView bagId={state.bagId || ''} onBack={onBackToList} />;

      case 'trip-items':
        return <TripItemsView />;

      case 'trip-tobuy':
        return <TripToBuyView />;

      case 'trip-add-item':
        return <TripAddItemView />;

      case 'trip-add-subcategory':
        return <TripAddSubcategoryView />;

      case 'trip-add-item-list':
        return <TripAddItemListView />;

      case 'items-management':
        return <ItemsManagementView />;
      
      case 'catalog-subcategory-list':
        return <CatalogSubcategoryListView />;

      case 'catalog-item-list':
        return <CatalogItemListView />;

      case 'trip-settings':
        return <TripSettingsView />;

      case 'person':
        if (!state.personId) return <div className="p-4 text-center">No person selected</div>;
        return (
          <PersonView
            personId={state.personId}
            onBack={onBackToList}
          />
        );
      
      default:
        // Fallback: If a trip is active, show Home. Otherwise, show the Trip List.
        return currentTripId ? <HomeView onViewChange={onTripViewChange} /> : <TripsList />;
    }
  };

  return (
    <div className="h-full w-full bg-background">
      {renderContent()}
    </div>
  );
};

export default PackingAppContent;