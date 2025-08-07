import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/SupabaseClient';
import { Item, CatalogItem, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export type AppView =
  | 'my-trips' | 'items-management' | 'people-management' | 'bags-management' | 'subcategory-management'
  | 'item-catalog-list' | 'global-tobuy' | 'global-todo' | 'trip-home' | 'trip-people' | 'trip-bags'
  | 'trip-items' | 'trip-add-item' | 'trip-settings' | 'create-trip-page' | 'person-detail' | 'bag-detail' | 'category-detail'
  | 'trip-add-subcategory' | 'trip-add-item-list' | 'trip-tobuy';

interface AppContextType {
  view: AppView;
  setView: (view: AppView) => void;
  selectedCategoryId: string | null;
  selectCategory: (categoryId: string) => void;
  selectedSubcategoryId: string | null;
  selectSubcategory: (subcategoryId: string) => void;
  addingCategoryId: string | null; 
  setAddingCategoryId: (id: string | null) => void; 
  addingSubcategoryId: string | null;
  setAddingSubcategoryId: (id: string | null) => void;
  addingForPersonId: number | null;
  setAddingForPersonId: (id: number | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  categories: Category[];
  subcategories: Subcategory[];
  catalog_items: CatalogItem[];
  bags: Bag[];
  people: Person[];
  items: Item[];
  todos: TodoItem[];
  trips: Trip[];
  currentTrip: Trip | null;
  currentTripId: string | null;
  currentPerson: Person | null;
  currentBag: Bag | null;
  currentCategory: Category | null;
  selectPerson: (personId: string | null) => void;
  selectBag: (bagId: string | null) => void;
  selectCategoryForView: (categoryId: string | null) => void;
  createTrip: (tripData: { name: string; date?: string }) => Promise<void>;
  loadTrip: (tripId: string) => void;
  clearCurrentTrip: () => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  createPerson: (personData: Omit<Person, 'id' | 'createdAt'>) => Promise<Person | null>;
  updatePerson: (personId: number, updates: Partial<Person>) => Promise<void>;
  deletePerson: (personId: number) => Promise<void>;
  addPersonToTrip: (personId: number) => Promise<void>;
  removePersonFromTrip: (personId: number) => Promise<void>;
  createBag: (bagData: Omit<Bag, 'id' | 'createdAt'>) => Promise<Bag | null>;
  updateBag: (bagId: number, updates: Partial<Bag>) => Promise<void>;
  deleteBag: (bagId: number) => Promise<void>;
  addBagToTrip: (bagId: number) => Promise<void>;
  removeBagFromTrip: (bagId: number) => Promise<void>;
  updateCatalogItem: (itemId: string, updates: Partial<CatalogItem>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addMultipleCatalogItemsToTripItems: (bagId: number | undefined, personId: number | undefined, itemsToAdd: { catalogItemId: string; quantity: number; notes?: string; isToBuy?: boolean }[]) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [currentBagId, setCurrentBagId] = useState<string | null>(null);
  const [currentCategoryForViewId, setCurrentCategoryForViewId] = useState<string | null>(null);
  const [addingCategoryId, setAddingCategoryId] = useState<string | null>(null);
  const [addingSubcategoryId, setAddingSubcategoryId] = useState<string | null>(null);
  const [addingForPersonId, setAddingForPersonId] = useState<number | null>(null);

  const currentTrip = useMemo(() => trips.find(trip => trip.id === currentTripId) || null, [trips, currentTripId]);
  const currentPerson = useMemo(() => people.find(person => String(person.id) === currentPersonId) || null, [people, currentPersonId]);
  const currentBag = useMemo(() => bags.find(bag => String(bag.id) === currentBagId) || null, [bags, currentBagId]);
  const currentCategory = useMemo(() => categories.find(category => category.id === currentCategoryForViewId) || null, [categories, currentCategoryForViewId]);
  const currentTripItems = useMemo(() => currentTrip?.items || [], [currentTrip]);
  const currentTripTodos = useMemo(() => currentTrip?.todos || [], [currentTrip]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          peopleResult, bagsResult, tripsResult, categoriesResult, subcategoriesResult, catalogItemsResult,
        ] = await Promise.all([
          supabase.from('people').select('*'),
          supabase.from('bags').select('*'),
          supabase.from('trips').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('subcategories').select('*'),
          supabase.from('catalog_items').select('*'),
        ]);
        
        setPeople(peopleResult.data || []);
        setBags(bagsResult.data || []);
        setTrips(tripsResult.data?.map(t => ({...t, tripTheme: t.trip_theme, backgroundImageUrl: t.background_image_url, peopleIds: t.trip_people, bagIds: t.trip_bags })) || []);
        setCategories(categoriesResult.data?.map(c => ({ id: c.id, name: c.name, createdAt: c.created_at })) || []);
        setSubcategories(subcategoriesResult.data?.map(sc => ({ id: sc.id, name: sc.name, categoryId: sc.category_id, createdAt: sc.created_at })) || []);
        setCatalogItems(catalogItemsResult.data?.map(ci => ({ id: ci.id, name: ci.name, categoryId: ci.category_id, subcategoryId: ci.subcategory_id, is_favorite: ci.is_favorite, createdAt: ci.created_at })) || []);

        const storedTripId = localStorage.getItem('currentTripId');
        if (storedTripId && tripsResult.data?.some(t => t.id === storedTripId)) {
          setCurrentTripId(storedTripId);
          setView('trip-home');
        } else {
          setView('my-trips');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentTripId) localStorage.setItem('currentTripId', currentTripId);
    else localStorage.removeItem('currentTripId');
  }, [currentTripId]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const loadTrip = useCallback((tripId: string) => { setCurrentTripId(tripId); setView('trip-home'); }, [setView]);
  const clearCurrentTrip = useCallback(() => { setCurrentTripId(null); setView('my-trips'); }, [setView]);
  
  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    const updatesForSupabase: { [key: string]: any } = {};
    if (updates.peopleIds !== undefined) { updatesForSupabase.trip_people = updates.peopleIds; }
    if (updates.bagIds !== undefined) { updatesForSupabase.trip_bags = updates.bagIds; }
    if (updates.tripTheme !== undefined) { updatesForSupabase.trip_theme = updates.tripTheme; }
    if (updates.backgroundImageUrl !== undefined) { updatesForSupabase.background_image_url = updates.backgroundImageUrl; }
    if (updates.name !== undefined) { updatesForSupabase.name = updates.name; }
    if (updates.date !== undefined) { updatesForSupabase.date = updates.date; }
    if (updates.items !== undefined) { updatesForSupabase.items = updates.items; }
    if (updates.todos !== undefined) { updatesForSupabase.todos = updates.todos; }
    
    const { data, error } = await supabase.from('trips').update(updatesForSupabase).eq('id', tripId).select().single();
    
    if (error) { console.error("Error updating trip:", error); return; }
    
    if (data) {
      const updatedTrip = { ...data, tripTheme: data.trip_theme, backgroundImageUrl: data.background_image_url, peopleIds: data.trip_people, bagIds: data.trip_bags };
      setTrips(prev => prev.map(trip => (trip.id === tripId ? updatedTrip : trip)));
    }
  }, [setTrips]);

  const createTrip = useCallback(async (tripData: { name: string; date?: string }) => {
    const { data, error } = await supabase.from('trips').insert({ ...tripData, id: uuidv4() }).select().single();
    if (error) { console.error("Error creating trip:", error); return; }
    if (data) {
      const newTrip = { ...data, tripTheme: data.trip_theme, backgroundImageUrl: data.background_image_url, peopleIds: data.trip_people, bagIds: data.trip_bags };
      setTrips(prev => [...prev, newTrip]);
      loadTrip(newTrip.id);
    }
  }, [setTrips, loadTrip]);
  
  const deleteTrip = useCallback(async (tripId: string) => {
    await supabase.from('trips').delete().eq('id', tripId);
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    if (currentTripId === tripId) {
      clearCurrentTrip();
    }
  }, [currentTripId, clearCurrentTrip, setTrips]);

  const createPerson = useCallback(async (personData: Omit<Person, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('people').insert(personData).select().single();
    if (error) { console.error("Error creating person:", error); return null; }
    setPeople(prev => [...prev, data]);
    return data;
  }, [setPeople]);

  const updatePerson = useCallback(async (personId: number, updates: Partial<Person>) => {
    const { data, error } = await supabase.from('people').update(updates).eq('id', personId).select().single();
    if (error) { console.error("Error updating person:", error); return; }
    setPeople(prev => prev.map(p => (p.id === personId ? data : p)));
  }, [setPeople]);

  const deletePerson = useCallback(async (personId: number) => {
    await supabase.from('people').delete().eq('id', personId);
    setPeople(prev => prev.filter(p => p.id !== personId));
  }, [setPeople]);
  
  const addPersonToTrip = useCallback(async (personId: number) => {
    if (!currentTrip) return;
    const updatedPeopleIds = Array.from(new Set([...(currentTrip.peopleIds || []), personId]));
    await updateTrip(currentTrip.id, { peopleIds: updatedPeopleIds });
  }, [currentTrip, updateTrip]);

  const removePersonFromTrip = useCallback(async (personId: number) => {
    if (!currentTrip) return;
    const updatedPeopleIds = (currentTrip.peopleIds || []).filter(id => id !== personId);
    await updateTrip(currentTrip.id, { peopleIds: updatedPeopleIds });
  }, [currentTrip, updateTrip]);

  const createBag = useCallback(async (bagData: Omit<Bag, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('bags').insert(bagData).select().single();
    if (error) { console.error("Error creating bag:", error); return null; }
    setBags(prev => [...prev, data]);
    return data;
  }, [setBags]);

  const updateBag = useCallback(async (bagId: number, updates: Partial<Bag>) => {
    const { data, error } = await supabase.from('bags').update(updates).eq('id', bagId).select().single();
    if (error) { console.error("Error updating bag:", error); return; }
    setBags(prev => prev.map(b => (b.id === bagId ? data : b)));
  }, [setBags]);

  const deleteBag = useCallback(async (bagId: number) => {
    await supabase.from('bags').delete().eq('id', bagId);
    setBags(prev => prev.filter(b => b.id !== bagId));
  }, [setBags]);
  
  const addBagToTrip = useCallback(async (bagId: number) => {
    if (!currentTrip) return;
    const updatedBagIds = Array.from(new Set([...(currentTrip.bagIds || []), bagId]));
    await updateTrip(currentTrip.id, { bagIds: updatedBagIds });
  }, [currentTrip, updateTrip]);

  const removeBagFromTrip = useCallback(async (bagId: number) => {
    if (!currentTrip) return;
    const updatedBagIds = (currentTrip.bagIds || []).filter(id => id !== bagId);
    await updateTrip(currentTrip.id, { bagIds: updatedBagIds });
  }, [currentTrip, updateTrip]);

  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setView('subcategory-management');
  }, [setView]);

  const selectSubcategory = useCallback((subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setView('item-catalog-list');
  }, [setView]);

  const selectPerson = useCallback((personId: string | null) => {
    setCurrentPersonId(personId);
    setView(personId ? 'person-detail' : 'people-management');
  }, [setView]);

  const selectBag = useCallback((bagId: string | null) => {
    setCurrentBagId(bagId);
    setView(bagId ? 'bag-detail' : 'bags-management');
  }, [setView]);

  const selectCategoryForView = useCallback((categoryId: string | null) => {
    setCurrentCategoryForViewId(categoryId);
    setView(categoryId ? 'category-detail' : 'item-catalog-list');
  }, [setView]);

  const updateCatalogItem = useCallback(async (itemId: string, updates: Partial<CatalogItem>) => {
    const { data, error } = await supabase.from('catalog_items').update({ is_favorite: updates.is_favorite }).eq('id', itemId).select().single();
    if (error) { console.error("Error updating catalog item:", error); return; }
    if (data) {
      setCatalogItems(prev => prev.map(i => (i.id === itemId ? { ...i, is_favorite: data.is_favorite } : i)));
    }
  }, [setCatalogItems]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<Item>) => {
    if (!currentTrip) return;
    const updatedItems = (currentTrip.items || []).map(item => (item.id === itemId ? { ...item, ...updates } : item));
    await updateTrip(currentTrip.id, { items: updatedItems });
  }, [currentTrip, updateTrip]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!currentTrip) return;
    const updatedItems = (currentTrip.items || []).filter(item => item.id !== itemId);
    await updateTrip(currentTrip.id, { items: updatedItems });
  }, [currentTrip, updateTrip]);

  const addMultipleCatalogItemsToTripItems = useCallback(async (
    bagId: number | undefined, personId: number | undefined,
    itemsToAdd: { catalogItemId: string; quantity: number; notes?: string; isToBuy?: boolean }[]
  ) => {
    if (!currentTrip) return;
    const newItems: Item[] = [];
    for (const itemData of itemsToAdd) {
      const catalogItem = catalogItems.find(ci => ci.id === itemData.catalogItemId);
      if (catalogItem) {
        newItems.push({
          id: uuidv4(), name: catalogItem.name, catalogItemId: catalogItem.id,
          categoryId: catalogItem.categoryId, subcategoryId: catalogItem.subcategoryId,
          packed: false, quantity: itemData.quantity, isToBuy: itemData.isToBuy || false,
          bagId, personId, notes: itemData.notes, createdAt: new Date().toISOString(),
        });
      }
    }
    await updateTrip(currentTrip.id, { items: [...(currentTrip.items || []), ...newItems] });
  }, [currentTrip, catalogItems, updateTrip]);

  const value = {
    view, setView, selectedCategoryId, selectCategory, selectedSubcategoryId, selectSubcategory,
    addingCategoryId, setAddingCategoryId, addingSubcategoryId, setAddingSubcategoryId,
    addingForPersonId, setAddingForPersonId,
    sidebarOpen, toggleSidebar, isLoading, categories, subcategories, catalog_items: catalogItems,
    bags, people, items: currentTripItems, todos: [], trips, currentTrip, currentTripId,
    currentPerson, currentBag, currentCategory, selectPerson, selectBag, selectCategoryForView,
    createTrip, loadTrip, clearCurrentTrip, updateTrip, deleteTrip, createPerson, updatePerson,
    deletePerson, addPersonToTrip, removePersonFromTrip, createBag, updateBag, deleteBag,
    addBagToTrip, removeBagFromTrip,
    updateCatalogItem, updateItem, deleteItem, addMultipleCatalogItemsToTripItems,
    // Dummy functions for unimplemented features
    addCategory: async () => null, updateCategory: async () => {}, deleteCategory: async () => {},
    addSubcategory: async () => null, updateSubcategory: async () => {}, deleteSubcategory: async () => {},
    addCatalogItem: async () => null, deleteCatalogItem: async () => {},
    addItemToTrip: async () => {},
    addSingleCatalogItemToTripItems: async () => {},
  };

  return (
    <AppContext.Provider value={value as AppContextType}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;