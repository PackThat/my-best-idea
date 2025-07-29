// src/components/PackingApp.tsx
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
      case 'trip-items':
      case 'trip-settings':
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

  const handleTripViewChange = useCallback((newTripSubView: 'people' | 'bags' | 'items' | 'tobuy' | 'trips') => {
    switch (newTripSubView) {
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
        setView('global-tobuy');
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
  }, [selectPerson]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    selectCategoryForView(categoryId);
  }, [selectCategoryForView]);

  const handleBagClick = useCallback((bagId: string) => {
    selectBag(bagId);
  }, [selectBag]);

  const handleBackToList = useCallback(() => {
    if (view === 'trip-people' || view === 'trip-bags') {
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

  return (
    <PackingAppContent
      viewState={viewState}
      onTripViewChange={handleTripViewChange}
      onNavigateToTripHome={handleNavigateToTripHome}
onPersonClick={handlePersonClick}
onCategoryClick={handleCategoryClick}
onBackToList={handleBackToList}
/>
  );
};

export default PackingApp;