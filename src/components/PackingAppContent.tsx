import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import PackingList from './PackingList';
import PersonView from './PersonView';
import CategoryView from './CategoryView';
import HomeView from './HomeView';
import TripPeopleView from './TripPeopleView';
import TripBagsView from './TripBagsView';
import TripItemsView from './TripItemsView';
import TripToBuyView from './TripToBuyView';
import TripCategoryView from './TripCategoryView';
import TripSubcategoryView from './TripSubcategoryView';
import PeopleListView from './PeopleListView';
import BagsListView from './BagsListView';
import ItemsImportView from './ItemsImportView';
import PeopleManagementView from './PeopleManagementView';
import BagsManagementView from './BagsManagementView';
import PersonPackingView from './PersonPackingView';
import { TripsList } from './TripsList';

type ViewState = {
  type: 'list' | 'person' | 'category' | 'items' | 'selector' | 'home' | 'trip-people' | 'trip-bags' | 'trip-tobuy' | 'trip-todo' | 'trip-items' | 'trip-category' | 'trip-subcategory' | 'people-list' | 'bags-list' | 'items-import' | 'people-management' | 'bags-management' | 'person-packing';
  personId?: string;
  categoryId?: string;
  subcategoryId?: string;
  filter?: string;
};

interface PackingAppContentProps {
  viewState: ViewState;
  onPersonClick: (personId: string) => void;
  onCategoryClick: (categoryId: string, personId?: string) => void;
  onTripCategoryClick: (categoryId: string) => void;
  onSubcategoryClick: (subcategoryId: string) => void;
  onBackToList: () => void;
  onBackToPerson: (personId: string) => void;
  onBackToTripItems: () => void;
  onBackToTripPeople: () => void;
  onTripViewChange: (view: 'people' | 'bags' | 'items' | 'tobuy' | 'trips') => void;
  onShowAddDialog: () => void;
  getFilteredItems: () => any[];
}

const PackingAppContent: React.FC<PackingAppContentProps> = ({
  viewState,
  onPersonClick,
  onCategoryClick,
  onTripCategoryClick,
  onSubcategoryClick,
  onBackToList,
  onBackToPerson,
  onBackToTripItems,
  onBackToTripPeople,
  onTripViewChange,
  onShowAddDialog,
  getFilteredItems
}) => {
  const {
    categories,
    subcategories,
    bags,
    people,
    items,
    currentTripId,
    updateItem,
    deleteItem,
    addPerson,
    updatePerson,
    deletePerson,
    addBag,
    updateBag,
    deleteBag
  } = useAppContext();

  const renderContent = () => {
    if (!currentTripId) {
      return <TripsList />;
    }

    switch (viewState.type) {
      case 'home':
        return <HomeView onViewChange={onTripViewChange} />;
      
      case 'list':
        return <TripsList />;
      
      case 'person':
        if (!viewState.personId) return null;
        return (
          <PersonView
            personId={viewState.personId}
            onCategoryClick={onCategoryClick}
            onBack={onBackToList}
          />
        );
      
      case 'person-packing':
        if (!viewState.personId) return null;
        return (
          <PersonView
            personId={viewState.personId}
            onCategoryClick={onCategoryClick}
            onBack={onBackToTripPeople}
          />
        );
      
      case 'category':
        if (!viewState.categoryId) return null;
        return (
          <CategoryView
            categoryId={viewState.categoryId}
            personId={viewState.personId}
            onBackToPerson={onBackToPerson}
            onBackToList={onBackToList}
          />
        );
      
      case 'items':
        return (
          <PackingList
            items={getFilteredItems()}
            categories={categories}
            subcategories={subcategories}
            bags={bags}
            people={people}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onAddItem={onShowAddDialog}
            showAddButton={true}
          />
        );
      
      case 'trip-people':
        return <TripPeopleView onPersonClick={onPersonClick} />;
      
      case 'trip-bags':
        return <TripBagsView />;
      
      case 'trip-items':
        return <TripItemsView onCategoryClick={onTripCategoryClick} />;
      
      case 'trip-tobuy':
        return <TripToBuyView />;
      
      case 'trip-category':
        if (!viewState.categoryId) return null;
        return (
          <TripCategoryView
            categoryId={viewState.categoryId}
            onSubcategoryClick={onSubcategoryClick}
            onBackToItems={onBackToTripItems}
          />
        );
      
      case 'trip-subcategory':
        if (!viewState.subcategoryId) return null;
        return (
          <TripSubcategoryView
            subcategoryId={viewState.subcategoryId}
            onBackToItems={onBackToTripItems}
          />
        );
      
      case 'people-list':
        return <PeopleListView />;
      
      case 'bags-list':
        return <BagsListView />;
      
      case 'items-import':
        return <ItemsImportView />;
      
      case 'people-management':
        return (
          <PeopleManagementView
            onBack={() => onTripViewChange('people')}
          />
        );
      
      case 'bags-management':
        return (
          <BagsManagementView
            bags={bags}
            onAddBag={addBag}
            onUpdateBag={updateBag}
            onDeleteBag={deleteBag}
          />
        );
      
      default:
        return <HomeView onViewChange={onTripViewChange} />;
    }
  };

  return renderContent();
};

export default PackingAppContent;