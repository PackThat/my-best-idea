import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import PackingHeader from './PackingHeader';
import PackingSidebar from './PackingSidebar';
import PackingAppContent from './PackingAppContent';
import AddItemDialog from './AddItemDialog';

type ViewState = {
  type: 'list' | 'person' | 'category' | 'items' | 'selector' | 'home' | 'trip-people' | 'trip-bags' | 'trip-tobuy' | 'trip-todo' | 'trip-items' | 'trip-category' | 'trip-subcategory' | 'people-list' | 'bags-list' | 'items-import' | 'people-management' | 'bags-management' | 'person-packing';
  personId?: string;
  categoryId?: string;
  subcategoryId?: string;
  filter?: string;
};

const PackingApp: React.FC = () => {
  const {
    categories,
    subcategories,
    bags,
    people,
    items,
    currentTripId,
    addItem,
    updateItem,
    deleteItem,
    addPerson,
    addCategory,
    addSubcategory,
    addBag,
  } = useAppContext();

  const [viewState, setViewState] = useState<ViewState>({ 
    type: 'list'
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [previousTripView, setPreviousTripView] = useState<ViewState>({ type: 'home' });

  useEffect(() => {
    console.log('PackingApp: currentTripId changed to:', currentTripId);
    if (currentTripId) {
      setViewState({ type: 'home' });
      setPreviousTripView({ type: 'home' });
    }
  }, [currentTripId]);

  const handlePersonClick = (personId: string) => {
    if (viewState.type === 'trip-people') {
      setViewState({ type: 'person-packing', personId });
    } else {
      setViewState({ type: 'person', personId });
    }
  };

  const handleCategoryClick = (categoryId: string, personId?: string) => {
    setViewState({ type: 'category', categoryId, personId });
  };

  const handleTripCategoryClick = (categoryId: string) => {
    setViewState({ type: 'trip-category', categoryId });
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setViewState({ type: 'trip-subcategory', subcategoryId });
  };

  const handleBackToList = () => {
    setViewState({ type: currentTripId ? 'home' : 'list' });
  };

  const handleBackToPerson = (personId: string) => {
    setViewState({ type: 'person', personId });
  };

  const handleBackToTripItems = () => {
    setViewState({ type: 'trip-items' });
  };

  const handleBackToTripPeople = () => {
    setViewState({ type: 'trip-people' });
  };

  const handleBackToTrip = () => {
    if (currentTripId) {
      setViewState(previousTripView);
    }
  };

  const handleCloseSidebar = () => {
    if (currentTripId) {
      setViewState({ type: 'home' });
      setPreviousTripView({ type: 'home' });
    } else {
      setViewState({ type: 'list' });
    }
  };

  const handleSidebarViewChange = (view: string) => {
    if (currentTripId && (viewState.type.startsWith('trip-') || viewState.type === 'home')) {
      setPreviousTripView(viewState);
    }

    if (view === 'all') {
      setViewState({ type: currentTripId ? 'home' : 'list' });
    } else if (view === 'selector') {
      setViewState({ type: 'selector' });
    } else if (view === 'people-list') {
      setViewState({ type: 'people-list' });
    } else if (view === 'people-management') {
      setViewState({ type: 'people-management' });
    } else if (view === 'bags-list') {
      setViewState({ type: 'bags-list' });
    } else if (view === 'bags-management') {
      setViewState({ type: 'bags-management' });
    } else if (view === 'items-import') {
      setViewState({ type: 'items-import' });
    } else {
      setViewState({ type: 'items', filter: view });
    }
  };

  const handleTripViewChange = (view: 'people' | 'bags' | 'items' | 'tobuy' | 'trips') => {
    if (view === 'trips') {
      setViewState({ type: 'list' });
    } else {
      const newViewState = { type: `trip-${view}` as ViewState['type'] };
      setViewState(newViewState);
      setPreviousTripView(newViewState);
    }
  };

  const getFilteredItems = () => {
    if (viewState.type !== 'items' || !viewState.filter) return items;
    
    const filter = viewState.filter;
    switch (filter) {
      case 'packed':
        return items.filter(item => item.packed);
      case 'tobuy':
        return items.filter(item => item.needsToBuy);
      default:
        if (filter.startsWith('bag-')) {
          const bagId = filter.replace('bag-', '');
          return items.filter(item => item.bagId === bagId);
        }
        if (filter.startsWith('person-')) {
          const personId = filter.replace('person-', '');
          return items.filter(item => item.personId === personId);
        }
        return items;
    }
  };

  const getActiveView = () => {
    if (viewState.type === 'items' && viewState.filter) {
      return viewState.filter;
    }
    return viewState.type === 'list' ? 'all' : viewState.type;
  };

  const shouldShowBackButton = () => {
    return currentTripId && !viewState.type.startsWith('trip-') && viewState.type !== 'list' && viewState.type !== 'home';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PackingHeader 
        onAddItem={() => setShowAddDialog(true)}
        showBackButton={shouldShowBackButton()}
        onBackClick={handleBackToTrip}
        backButtonText="Back to Trip"
      />
      
      <div className="flex">
        <PackingSidebar
          items={items}
          bags={bags}
          people={people}
          activeView={getActiveView()}
          onViewChange={handleSidebarViewChange}
          onCloseSidebar={handleCloseSidebar}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <PackingAppContent
              viewState={viewState}
              onPersonClick={handlePersonClick}
              onCategoryClick={handleCategoryClick}
              onTripCategoryClick={handleTripCategoryClick}
              onSubcategoryClick={handleSubcategoryClick}
              onBackToList={handleBackToList}
              onBackToPerson={handleBackToPerson}
              onBackToTripItems={handleBackToTripItems}
              onBackToTripPeople={handleBackToTripPeople}
              onTripViewChange={handleTripViewChange}
              onShowAddDialog={() => setShowAddDialog(true)}
              getFilteredItems={getFilteredItems}
            />
          </div>
        </main>
      </div>

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        subcategories={subcategories}
        bags={bags}
        people={people}
        onAddItem={addItem}
        onAddPerson={addPerson}
        onAddCategory={addCategory}
        onAddSubcategory={addSubcategory}
        onAddBag={addBag}
      />
    </div>
  );
};

export default PackingApp;