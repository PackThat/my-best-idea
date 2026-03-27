import React, { useMemo, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import PackingAppContent from './PackingAppContent';
import { ViewState } from '@/types';

export const PackingApp: React.FC = () => {
  const { tripId: urlTripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const {
    view, setView,
    currentTripId, loadTrip, clearCurrentTrip,
    selectPerson,
    currentPerson,
    selectBag,
    currentBag,
    selectCategoryForView,
    currentCategory,
    selectSubcategory, // Needed for back button logic
    selectCategory     // Needed for back button logic
  } = useAppContext();

  // 1. URL SYNC LOGIC
  useEffect(() => {
    // List of views that are "Global" and should NOT load a trip from URL
    const isCatalogView = [
      'items-management', 
      'catalog-subcategory-list', 
      'subcategory-management',
      'category-detail',
      'item-catalog-list',
      'catalog-item-list'
    ].includes(view as string);
    
    const isCatalogPath = location.pathname.includes('/catalog');
    
    if (urlTripId && urlTripId !== currentTripId && !isCatalogView && !isCatalogPath) {
      loadTrip(urlTripId);
    }
  }, [urlTripId, currentTripId, loadTrip, view, location.pathname]);

  // 2. VIEW STATE CALCULATION
  const viewState: ViewState = useMemo(() => {
    switch (view) {
      // --- List Views ---
      case 'my-trips':
      case 'create-trip-page':
        return { type: 'list' };

      // --- Global Dashboards ---
      case 'trip-home':
      case 'global-tobuy':
      case 'global-todo':
        return { type: 'home' };

      // --- Catalog Views ---
      case 'items-management':
        return { type: 'items-management' } as any; 
      
      // Handle both names for the subcategory list
      case 'catalog-subcategory-list':
      case 'subcategory-management':
        return { type: 'catalog-subcategory-list' } as any;

      // FIX: This maps the Sidebar's 'item-catalog-list' to the Content's 'catalog-item-list'
      case 'item-catalog-list':
      case 'catalog-item-list':
        return { type: 'catalog-item-list' } as any;
      
      // --- Trip Specific Views ---
      case 'trip-people': return { type: 'trip-people' };
      case 'trip-bags': return { type: 'trip-bags' };
      case 'trip-items': return { type: 'trip-items' };
      case 'trip-tobuy': return { type: 'trip-tobuy' };
      case 'trip-add-item': return { type: 'trip-add-item' };
      case 'trip-add-subcategory': return { type: 'trip-add-subcategory' };
      case 'trip-add-item-list': return { type: 'trip-add-item-list' };
      case 'trip-settings': return { type: 'trip-settings' };

      // --- Detail Views ---
      case 'person-detail':
        return { type: 'person', personId: currentPerson?.id ? String(currentPerson.id) : undefined };
      case 'bag-detail':
        return { type: 'bag', bagId: currentBag?.id ? String(currentBag.id) : undefined };
      
      // FIX: Removed the invalid "case 'category':" that caused the TS error
      case 'category-detail':
        return { 
          type: 'category', 
          categoryId: currentCategory?.id ? String(currentCategory.id) : undefined 
        };
        
      default:
        return { type: 'home' };
    }
  }, [view, currentPerson, currentBag, currentCategory]);

  // 3. NAVIGATION HANDLERS
  const handleTripViewChange = useCallback((newTripSubView: 'people' | 'bags' | 'items' | 'tobuy' | 'trips' | 'todo' | 'settings') => {
    const viewMap: Record<string, any> = {
        'settings': 'trip-settings',
        'people': 'trip-people',
        'bags': 'trip-bags',
        'items': 'trip-items',
        'tobuy': 'trip-tobuy',
        'trips': 'my-trips'
    };
    setView(viewMap[newTripSubView] || 'trip-home');
  }, [setView]);

  const handleNavigateToTripHome = useCallback(() => {
    const targetId = urlTripId || currentTripId;
    if (targetId) {
        loadTrip(targetId);
        setView('trip-home');
    } else {
        setView('trip-home');
    }
  }, [urlTripId, currentTripId, loadTrip, setView]);

  const handlePersonClick = useCallback((personId: string) => {
    selectPerson(personId);
    setView('person-detail');
  }, [selectPerson, setView]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    selectCategoryForView(categoryId);
    setView('category-detail');
  }, [selectCategoryForView, setView]);

  const handleBagClick = useCallback((bagId: string) => {
    selectBag(bagId);
    setView('bag-detail');
  }, [selectBag, setView]);

  const handleBackToList = useCallback(() => {
    if (view === 'trip-people' || view === 'trip-bags' || view === 'trip-items') {
      setView('trip-home');
    } else if (view === 'person-detail') {
        const hasTrip = urlTripId || currentTripId;
        setView(hasTrip ? 'trip-people' : 'people-management');
        selectPerson(null);
    } else if (view === 'bag-detail') {
        const hasTrip = urlTripId || currentTripId;
        setView(hasTrip ? 'trip-bags' : 'bags-management');
        selectBag(null);
    } else if (view === 'category-detail') {
        setView('catalog-subcategory-list');
        selectCategoryForView(null);
    
    // BACK BUTTON LOGIC FOR CATALOG
    } else if (['item-catalog-list', 'catalog-item-list'].includes(view)) {
        setView('subcategory-management'); 
        if (selectSubcategory) selectSubcategory(null as any); 
    } else if (['catalog-subcategory-list', 'subcategory-management'].includes(view)) {
        setView('items-management'); 
        if (selectCategory) selectCategory(null as any); 

    } else if (view === 'trip-home' && (urlTripId || currentTripId)) {
        clearCurrentTrip();
    } else {
        setView('my-trips');
    }
  }, [view, urlTripId, currentTripId, clearCurrentTrip, setView, selectPerson, selectBag, selectCategoryForView, selectSubcategory, selectCategory]);

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