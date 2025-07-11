import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/SupabaseClient';
import { Item, CatalogItem, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';

export type AppView =
  | 'my-trips'
  | 'items-management'
  | 'people-management'
  | 'bags-management'
  | 'subcategory-management'
  | 'item-catalog-list'
  | 'global-tobuy'
  | 'global-todo'
  | 'trip-home'
  | 'trip-people'
  | 'trip-bags'
  | 'trip-items'; // Added for clarity, though not strictly needed for routing yet

interface AppContextType {
  // View management
  view: AppView;
  setView: (view: AppView) => void;
  selectedCategoryId: string | null;
  selectCategory: (categoryId: string) => void;
  selectedSubcategoryId: string | null;
  selectSubcategory: (subcategoryId: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // State properties
  categories: Category[];
  subcategories: Subcategory[];
  catalog_items: CatalogItem[];
  bags: Bag[];
  people: Person[];
  items: Item[];
  todos: TodoItem[];
  trips: Trip[];
  tripBags: string[];
  tripPeople: string[];
  currentTripType: string;
  currentTripId?: string;

  // Functions
  createTrip: (tripData: { name: string; date?: string }) => Promise<void>;
  loadTrip: (tripId: string) => void;
  clearCurrentTrip: () => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  addPerson: (personData: Omit<Person, 'id'>) => Promise<Person | null>;
  updatePerson: (personId: string, updates: Partial<Person>) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;
  addPersonToTrip: (personId: string) => void;
  removePersonFromTrip: (personId: string) => void;
  addBag: (bagData: Omit<Bag, 'id'>) => Promise<Bag | null>;
  updateBag: (bagId: string, updates: Partial<Bag>) => Promise<void>;
  deleteBag: (bagId: string) => Promise<void>;
  addExistingBagToTrip: (bagId: string) => void;
  removeBagFromTrip: (bagId: string) => void;
  addCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addSubcategory: (subcategoryData: Omit<Subcategory, 'id' | 'category_id'>) => Promise<void>;
  updateSubcategory: (subcategoryId: string, updates: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (subcategoryId: string) => Promise<void>;
  addCatalogItem: (itemData: { name: string }) => Promise<void>;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  deleteCatalogItem: (itemId: string) => Promise<void>;
  addItemToTrip: (item: Omit<Item, 'id'>) => void; // New
  updateItem: (itemId: string, updates: Partial<Item>) => void; // New
  deleteItem: (itemId: string) => void; // New
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>('my-trips');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const [data, setData] = useState<{
    categories: Category[]; subcategories: Subcategory[]; catalog_items: CatalogItem[]; bags: Bag[]; people: Person[];
    items: Item[]; todos: TodoItem[]; trips: Trip[]; tripBags: string[]; tripPeople: string[];
    currentTripType: string; currentTripId?: string;
  }>({
    categories: [], subcategories: [], catalog_items: [], bags: [], people: [],
    items: [], todos: [], trips: [], tripBags: [], tripPeople: [],
    currentTripType: 'No trip selected', currentTripId: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: peopleData } = await supabase.from('people').select('*');
      const { data: bagsData } = await supabase.from('bags').select('*');
      const { data: tripsData } = await supabase.from('trips').select('*');
      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: subcategoriesData } = await supabase.from('subcategories').select('*');
      const { data: catalogItemsData } = await supabase.from('catalog_items').select('*');

      setData(prev => ({
        ...prev,
        people: peopleData || [],
        bags: bagsData || [],
        trips: tripsData || [],
        categories: categoriesData || [],
        subcategories: subcategoriesData || [],
        catalog_items: catalogItemsData || [],
      }));
    };
    fetchData();
  }, []);

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setView('subcategory-management');
  };

  const selectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setView('item-catalog-list');
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const saveCurrentTripState = useCallback(async () => { /* ... */ }, [data]);
  const clearCurrentTrip = useCallback(() => { /* ... */ }, [saveCurrentTripState]);
  const loadTrip = useCallback((tripId: string) => { /* ... */ }, [saveCurrentTripState]);
  const createTrip = useCallback(async (tripData: { name: string; date?: string }) => { /* ... */ }, []);
  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => { /* ... */ }, []);
  const deleteTrip = useCallback(async (tripId: string) => { /* ... */ }, []);
  const addPerson = useCallback(async (personData: Omit<Person, 'id'>) => { /* ... */ return null; }, []);
  const updatePerson = useCallback(async (personId: string, updates: Partial<Person>) => { /* ... */ }, []);
  const deletePerson = useCallback(async (personId: string) => { /* ... */ }, []);
  const addPersonToTrip = useCallback((personId: string) => { /* ... */ }, []);
  const removePersonFromTrip = useCallback((personId: string) => { /* ... */ }, []);
  const addBag = useCallback(async (bagData: Omit<Bag, 'id'>) => { /* ... */ return null; }, []);
  const updateBag = useCallback(async (bagId: string, updates: Partial<Bag>) => { /* ... */ }, []);
  const deleteBag = useCallback(async (bagId: string) => { /* ... */ }, []);
  const addExistingBagToTrip = useCallback((bagId: string) => { /* ... */ }, []);
  const removeBagFromTrip = useCallback((bagId: string) => { /* ... */ }, []);
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => { /* ... */ }, []);
  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>) => { /* ... */ }, []);
  const deleteCategory = useCallback(async (categoryId: string) => { /* ... */ }, []);
  const addSubcategory = useCallback(async (subcategoryData: Omit<Subcategory, 'id' | 'category_id'>) => { /* ... */ }, [selectedCategoryId]);
  const updateSubcategory = useCallback(async (subcategoryId: string, updates: Partial<Subcategory>) => { /* ... */ }, []);
  const deleteSubcategory = useCallback(async (subcategoryId: string) => { /* ... */ }, []);
  const addCatalogItem = useCallback(async (itemData: { name: string }) => { /* ... */ }, [selectedCategoryId, selectedSubcategoryId]);
  const updateCatalogItem = useCallback(async (itemId: string, updates: Partial<CatalogItem>) => { /* ... */ }, []);
  const deleteCatalogItem = useCallback(async (itemId: string) => { /* ... */ }, []);

  const addItemToTrip = useCallback((item: Omit<Item, 'id'>) => {
    setData(prev => ({ ...prev, items: [...prev.items, { ...item, id: crypto.randomUUID() }] }));
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<Item>) => {
    setData(prev => ({ ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
  }, []);

  const value = useMemo(() => ({
    ...data,
    sidebarOpen, toggleSidebar,
    view, setView,
    selectedCategoryId, selectCategory,
    selectedSubcategoryId, selectSubcategory,
    createTrip, loadTrip, clearCurrentTrip, updateTrip, deleteTrip,
    addPerson, updatePerson, deletePerson, addPersonToTrip, removePersonFromTrip,
    addBag, updateBag, deleteBag, addExistingBagToTrip, removeBagFromTrip,
    addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    addCatalogItem, updateCatalogItem, deleteCatalogItem,
    addItemToTrip, updateItem, deleteItem, // New
  }), [
    data, sidebarOpen, view, selectedCategoryId, selectedSubcategoryId,
    toggleSidebar, setView, selectCategory, selectSubcategory,
    createTrip, loadTrip, clearCurrentTrip, updateTrip, deleteTrip,
    addPerson, updatePerson, deletePerson, addPersonToTrip, removePersonFromTrip,
    addBag, updateBag, deleteBag, addExistingBagToTrip, removeBagFromTrip,
    addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    addCatalogItem, updateCatalogItem, deleteCatalogItem,
    addItemToTrip, updateItem, deleteItem, // New
  ]);

  return (
    <AppContext.Provider value={value as any}>
      {children}
    </AppContext.Provider>
  );
};