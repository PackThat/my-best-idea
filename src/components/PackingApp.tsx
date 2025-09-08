import React, { useMemo, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import PackingAppContent from './PackingAppContent';
import { ViewState } from '@/types';

export const PackingApp: React.FC = () => {
  const {
    view, setView,
    currentTripId, loadTrip, clearCurrentTrip,
    selectPerson,
    currentPerson,
    selectBag,
    currentBag,
    selectCategoryForView,
    currentCategory
  } = useAppContext();

  const viewState: ViewState = useMemo(() => {
    switch (view) {
      case 'my-trips':
      case 'create-trip-page':
        return { type: 'list' };
      case 'trip-home':
      case 'global-tobuy':
      case 'global-todo':
      case 'items-management':
      case 'subcategory-management':
      case 'item-catalog-list':
        return { type: 'home' };
      case 'trip-people':
        return { type: 'trip-people' };
      case 'trip-bags':
        return { type: 'trip-bags' };
      case 'trip-items':
        return { type: 'trip-items' };
      case 'trip-tobuy':
        return { type: 'trip-tobuy' };
      case 'trip-add-item':
        return { type: 'trip-add-item' };
      case 'trip-add-subcategory':
        return { type: 'trip-add-subcategory' };
      case 'trip-add-item-list':
        return { type: 'trip-add-item-list' };
      case 'trip-settings':
        return { type: 'trip-settings' };
      case 'person-detail':
        return { type: 'person', personId: currentPerson?.id ? String(currentPerson.id) : undefined };
      case 'bag-detail':
        return { type: 'bag', bagId: currentBag?.id ? String(currentBag.id) : undefined };
      case 'category-detail':
        return { type: 'category', categoryId: currentCategory?.id ? String(currentCategory.id) : undefined };
      default:
        return { type: 'home' };
    }
  }, [view, currentPerson, currentBag, currentCategory]);

  const handleTripViewChange = useCallback((newTripSubView: 'people' | 'bags' | 'items' | 'tobuy' | 'trips' | 'todo' | 'settings') => {
    switch (newTripSubView) {
      case 'settings':
        setView('trip-settings');
        break;
      case 'people':
        setView('trip-people');
        break;
      case 'bags':
        setView('trip-bags');
        break;
      case 'items':
        setView('trip-items');
        break;
      case 'tobuy':
        setView('trip-tobuy');
        break;
      case 'trips':
        setView('my-trips');
        break;
      default:
        setView('trip-home');
    }
  }, [setView]);

  const handleNavigateToTripHome = useCallback(() => {
    if (currentTripId) {
        loadTrip(currentTripId);
    } else {
        setView('trip-home');
    }
  }, [currentTripId, loadTrip, setView]);

  const handlePersonClick = useCallback((personId: string) => {
    selectPerson(personId);
    setView('person-detail');
  }, [selectPerson, setView]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    selectCategoryForView(categoryId);
  }, [selectCategoryForView]);

  const handleBagClick = useCallback((bagId: string) => {
    selectBag(bagId);
    setView('bag-detail');
  }, [selectBag, setView]);

  const handleBackToList = useCallback(() => {
    if (view === 'trip-people' || view === 'trip-bags' || view === 'trip-items') {
      setView('trip-home');
    } else if (view === 'person-detail') {
        if (currentTripId) {
            setView('trip-people');
        } else {
            setView('people-management');
        }
        selectPerson(null);
    } else if (view === 'bag-detail') {
        if (currentTripId) {
            setView('trip-bags');
        } else {
            setView('bags-management');
        }
        selectBag(null);
    } else if (view === 'category-detail') {
        if (currentTripId) {
            setView('trip-items');
        } else {
            setView('item-catalog-list');
        }
        selectCategoryForView(null);
    } else if (view === 'trip-home' && currentTripId) {
        clearCurrentTrip();
    } else {
        setView('my-trips');
    }
  }, [view, currentTripId, clearCurrentTrip, setView, selectPerson, selectBag, selectCategoryForView]);

  console.log("2. PackingApp: Rendering with view state -", view);

  return (
    <PackingAppContent
      viewState={viewState}
      onTripViewChange={handleTripViewChange}
      onNavigateToTripHome={handleNavigateToTripHome}
      onPersonClick={handlePersonClick}
      onBagClick={handleBagClick}
      onCategoryClick={handleCategoryClick}
      onBackToList={handleBackToList}
    />
  );
};

export default PackingApp;
