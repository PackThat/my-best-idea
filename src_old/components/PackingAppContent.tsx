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
  // We remove the direct currentTripId check here to prevent the "Loading" override
  const { currentTripId } = useAppContext();

  const renderContent = () => {
    // Explicitly handle the category-detail/category types first
    if (viewState.type === 'category' || (viewState.type as string) === 'category-detail') {
      if (!viewState.categoryId) return <div>No category selected</div>;
      return (
        <CategoryView
          categoryId={viewState.categoryId}
          personId={viewState.personId}
          onBack={onBackToList}
        />
      );
    }

    switch (viewState.type) {
      case 'home':
        return <HomeView onViewChange={onTripViewChange} />;
      
      case 'list':
        return <TripsList />;

      case 'trip-people':
        return <TripPeopleView onBack={onBackToList} onPersonClick={onPersonClick} />;
      
      case 'trip-bags':
        return <TripBagsView onBagClick={onBagClick} />;
      
      case 'bag':
        const { currentBagId } = useAppContext();
        if (!currentBagId) return null;
        return <BagDetailView bagId={currentBagId} onBack={onBackToList} />;

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
        if (!viewState.personId) return null;
        return (
          <PersonView
            personId={viewState.personId}
            onBack={onBackToList}
          />
        );
      
      default:
        // This is the fallback. If we have an ID in the URL, show home. Otherwise list.
        return currentTripId ? <HomeView onViewChange={onTripViewChange} /> : <TripsList />;
    }
  };

  return (
    <div className="h-full w-full">
      {renderContent()}
    </div>
  );
};

export default PackingAppContent;