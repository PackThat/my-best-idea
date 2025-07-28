// src/components/PackingApp.tsx

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
import ItemCatalogListView from './ItemCatalogListView';
import { InlineTripForm } from './InlineTripForm'; // This is the full-page trip creation component

const PackingApp: React.FC = () => {
  const { view, setView, currentTripId, clearCurrentTrip, isLoading, trips } = useAppContext();

  useEffect(() => {
    // This hook ensures the correct view is shown when data is loaded.
    if (!isLoading) {
      if (!currentTripId && trips.length === 0 && view !== 'my-trips') {
        // If no trip is selected AND no trips exist, and we're not already on my-trips,
        // ensure we go to 'my-trips' which will display the "No Trips yet" card.
        // This makes 'my-trips' the default landing for no trips.
        setView('my-trips');
      } else if (!currentTripId && trips.length > 0 && view === 'create-trip-page') {
        // If no trip is selected, but trips exist, and we are on create-trip-page, go to my-trips
        setView('my-trips');
      } else if (currentTripId && !view.startsWith('trip-')) {
        // If a trip is selected but we're not in a trip view, go to trip home
        setView('trip-home');
      } else if (!currentTripId && view.startsWith('trip-')) {
        // If no trip is selected but we are in a trip view (e.g., after deleting the current trip), go back to my-trips
        setView('my-trips');
      }
    }
  }, [currentTripId, view, setView, isLoading, trips.length]);


  const renderContent = () => {
    // Show a loading message if data is still being fetched
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading your packing data...
        </div>
      );
    }

    // Now, render content based on the view after loading
    switch (view) {
      case 'my-trips':
        // TripsList will contain the logic to show "No Trips Yet" card or the list of trips.
        // It will also have the "Create Trip" button that calls setView('create-trip-page').
        return <TripsList />;
      case 'create-trip-page': // This is the full-page form for creating a trip
        return <InlineTripForm />;
      case 'items-management':
        return <ItemsManagementView />;
      case 'people-management':
        return <PeopleManagementView />;
      case 'bags-management':
        return <BagsManagementView />;
      case 'subcategory-management':
        return <SubcategoryManagementView />;
      case 'item-catalog-list':
        return <ItemCatalogListView />;
      case 'trip-home':
        // If a trip is not selected but the view is trip-home, redirect to my-trips
        if (!currentTripId) {
            return <TripsList />;
        }
        return <HomeView />;
      case 'trip-people':
        // Ensure a trip is selected for trip-specific views
        if (!currentTripId) {
            return <TripsList />;
        }
        return <TripPeopleView onBack={() => setView('trip-home')} onPersonClick={() => {}} />;
      case 'trip-bags':
        // Ensure a trip is selected for trip-specific views
        if (!currentTripId) {
            return <TripsList />;
        }
        return <TripBagsView onBack={() => setView('trip-home')} onBagClick={() => {}} />;
      case 'global-tobuy':
        return <div>Global To Buy List (Not Implemented)</div>;
      case 'global-todo':
        return <div>Global To Do List (Not Implemented)</div>;
      case 'trip-settings':
        if (!currentTripId) {
            return <TripsList />;
        }
        return <div>Trip Settings View (Not Implemented yet)</div>;
      default:
        // Default to my-trips view, which will handle displaying "No Trips Yet" or the list.
        return <TripsList />;
    }
  };

  const globalManagementViews = ['items-management', 'people-management', 'bags-management', 'subcategory-management', 'item-catalog-list'];
  const showBackButton = globalManagementViews.includes(view);

  const backButtonAction = () => {
    if (globalManagementViews.includes(view)) {
        clearCurrentTrip();
        setView('my-trips');
    } else if (view.startsWith('trip-') && currentTripId) {
        setView('trip-home');
    } else {
        setView('my-trips');
    }
  };
  
  const backButtonText = view.startsWith('trip-') && currentTripId
    ? 'Back to Trip Home'
    : 'Back to My Trips';


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