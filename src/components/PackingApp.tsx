import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import PackingHeader from './PackingHeader';
import PackingSidebar from './PackingSidebar';
import HomeView from './HomeView';
import { TripsList } from './TripsList';
import TripPeopleView from './TripPeopleView';
import TripBagsView from './TripBagsView';
import PeopleManagementView from './PeopleManagementView';
import BagsManagementView from './BagsManagementView';
import { ItemsManagementView } from './ItemsManagementView';
import SubcategoryManagementView from './SubcategoryManagementView';
import ItemCatalogListView from './ItemCatalogListView'; // Import the new view

const PackingApp: React.FC = () => {
  const { view, setView, currentTripId, clearCurrentTrip } = useAppContext();

  useEffect(() => {
    // This hook ensures the correct view is shown when a trip is loaded or cleared.
    if (!currentTripId && view.startsWith('trip-')) {
      setView('my-trips');
    }
  }, [currentTripId, view, setView]);

  const renderContent = () => {
    switch (view) {
      case 'my-trips':
        return <TripsList />;
      case 'items-management':
        return <ItemsManagementView />;
      case 'people-management':
        return <PeopleManagementView />;
      case 'bags-management':
        return <BagsManagementView />;
      case 'subcategory-management':
        return <SubcategoryManagementView />;
      case 'item-catalog-list': // New case for the item list view
        return <ItemCatalogListView />;
      case 'trip-home':
        return <HomeView />;
      case 'trip-people':
        return <TripPeopleView onBack={() => setView('trip-home')} onPersonClick={() => {}} />;
      case 'trip-bags':
        return <TripBagsView onBack={() => setView('trip-home')} onBagClick={() => {}} />;
      case 'global-tobuy':
        return <div>Global To Buy List (Not Implemented)</div>;
      case 'global-todo':
        return <div>Global To Do List (Not Implemented)</div>;
      default:
        return <TripsList />;
    }
  };

  const globalManagementViews = ['items-management', 'people-management', 'bags-management', 'subcategory-management'];
  const showBackButton = globalManagementViews.includes(view);

  const backButtonAction = () => {
    clearCurrentTrip();
  };
  
  const backButtonText = 'Back to My Trips';

  return (
    <div className="min-h-screen">
      <PackingHeader showBackButton={showBackButton} onBackClick={backButtonAction} backButtonText={backButtonText} />
      <div className="flex">
        <PackingSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PackingApp;