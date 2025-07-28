// src/contexts/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/SupabaseClient';
import { Item, CatalogItem, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
  | 'trip-items'
  | 'trip-settings'
  | 'create-trip-page';

interface AppContextType {
  view: AppView;
  setView: (view: AppView) => void;
  selectedCategoryId: string | null;
  selectCategory: (categoryId: string) => void;
  selectedSubcategoryId: string | null;
  selectSubcategory: (subcategoryId: string) => void;

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

  createTrip: (tripData: { name: string; startDate?: string; endDate?: string; backgroundImageUrl?: string }) => Promise<void>;
  loadTrip: (tripId: string) => void;
  clearCurrentTrip: () => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;

  createPerson: (personData: Omit<Person, 'id' | 'createdAt'>) => Promise<number | null>;
  updatePerson: (personId: number, updates: Partial<Person>) => Promise<void>;
  deletePerson: (personId: number) => Promise<void>;
  addPersonToTrip: (personId: number) => Promise<void>;
  removePersonFromTrip: (personId: number) => Promise<void>;

  createBag: (bagData: Omit<Bag, 'id'>) => Promise<number | null>;
  updateBag: (bagId: number, updates: Partial<Bag>) => Promise<void>;
  deleteBag: (bagId: number) => Promise<void>;

  addCategory: (categoryData: Omit<Category, 'id' | 'tripId'>) => Promise<number | null>;
  updateCategory: (categoryId: number, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;

  addSubcategory: (subcategoryData: Omit<Subcategory, 'id' | 'tripId'>) => Promise<number | null>;
  updateSubcategory: (subcategoryId: number, updates: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (subcategoryId: number) => Promise<void>;

  addCatalogItem: (itemData: Omit<CatalogItem, 'id'>) => Promise<number | null>;
  updateCatalogItem: (itemId: number, updates: Partial<CatalogItem>) => Promise<void>;
  deleteCatalogItem: (itemId: number) => Promise<void>;

  addItemToTrip: (itemData: Omit<Item, 'tripId'>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addSingleCatalogItemToTripItems: (
    bagId: number | null,
    personId: number | null,
    catalogItem: CatalogItem,
    quantity: number,
    notes?: string,
    isToBuy?: boolean
  ) => Promise<void>;
  addMultipleCatalogItemsToTripItems: (
    bagId: number | null,
    personId: number | null,
    itemsToAdd: { catalogItemId: number; quantity: number; notes?: string; isToBuy?: boolean }[]
  ) => Promise<void>;
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

  const currentTrip = useMemo(() => {
    return trips.find(trip => trip.id === currentTripId) || null;
  }, [trips, currentTripId]);

  const currentTripItems = useMemo(() => {
    return (currentTrip?.items as Item[] || []).map(item => ({
      ...item,
      id: String(item.id),
      categoryId: item.categoryId ? Number(item.categoryId) : undefined,
      subcategoryId: item.subcategoryId ? Number(item.subcategoryId) : undefined,
      personId: item.personId ? Number(item.personId) : undefined,
      bagId: item.bagId ? Number(item.bagId) : undefined,
      catalogItemId: item.catalogItemId ? Number(item.catalogItemId) : undefined,
    }));
  }, [currentTrip]);

  const currentTripTodos = useMemo(() => {
    return (currentTrip?.todos as TodoItem[] || []).map(todo => ({
      ...todo,
      id: String(todo.id),
    }));
  }, [currentTrip]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: peopleData, error: peopleError } = await supabase.from('people').select('*');
        const { data: bagsData, error: bagsError } = await supabase.from('bags').select('*');
        const { data: tripsData, error: tripsError } = await supabase.from('trips').select(`
          id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
          trip_people, trip_bags, items, todos
        `);
        const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
        const { data: subcategoriesData, error: subcategoriesError } = await supabase.from('subcategories').select('*');
        const { data: catalogItemsData, error: catalogItemsError } = await supabase.from('catalog_items').select('*');

        if (peopleError) console.error("Error fetching people:", peopleError);
        if (bagsError) console.error("Error fetching bags:", bagsError);
        if (tripsError) console.error("Error fetching trips:", tripsError);
        if (categoriesError) console.error("Error fetching categories:", categoriesError);
        if (subcategoriesError) console.error("Error fetching subcategories:", subcategoriesError);
        if (catalogItemsError) console.error("Error fetching catalog items:", catalogItemsError);

        setPeople(peopleData || []);
        setBags(bagsData || []);
        setTrips(tripsData?.map(t => ({
          id: t.id,
          name: t.name,
          date: t.date,
          tripTheme: t.trip_theme,
          updatedAt: t.updated_at,
          backgroundImageUrl: t.background_image_url,
          userId: t.user_id,
          createdAt: t.created_at,
          peopleIds: t.trip_people || [],
          bagIds: t.trip_bags || [],
          items: t.items || [],
          todos: t.todos || [],
        })) || []);
        setCategories(categoriesData || []);
        setSubcategories(subcategoriesData || []);
        setCatalogItems(catalogItemsData || []);

        const storedCurrentTripId = localStorage.getItem('currentTripId');
        let initialView: AppView = 'my-trips';

        if (!tripsData || tripsData.length === 0) {
            initialView = 'my-trips';
            setCurrentTripId(null);
        } else if (storedCurrentTripId && tripsData.some(t => t.id === storedCurrentTripId)) {
            setCurrentTripId(storedCurrentTripId);
            initialView = 'trip-home';
        } else {
            localStorage.removeItem('currentTripId');
            setCurrentTripId(null);
            initialView = 'my-trips';
        }
        setView(initialView);

      } catch (error) {
        console.error("Failed to load initial data from Supabase", error);
        setView('my-trips');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentTripId) {
      localStorage.setItem('currentTripId', currentTripId);
    } else {
      localStorage.removeItem('currentTripId');
    }
    if (currentTripId === null && trips.length > 0) {
      setView('my-trips');
    }
  }, [currentTripId, trips.length, setView]);

  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setView('subcategory-management');
  }, [setView]);

  const selectSubcategory = useCallback((subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setView('item-catalog-list');
  }, [setView]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const createTrip = useCallback(async (tripData: { name: string; startDate?: string; endDate?: string; backgroundImageUrl?: string }) => {
    const newTripId = uuidv4();
    const { data, error } = await supabase
      .from('trips')
      .insert({
        id: newTripId,
        name: tripData.name,
        date: tripData.startDate,
        trip_theme: tripData.endDate,
        background_image_url: tripData.backgroundImageUrl,
        created_at: new Date().toISOString(),
        trip_people: [],
        trip_bags: [],
        items: [],
        todos: [],
      })
      .select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
      `);

    if (error) {
      console.error("Error creating trip:", error);
      return;
    }
    if (data && data.length > 0) {
      const createdTrip: Trip = {
        id: data[0].id,
        name: data[0].name,
        date: data[0].date,
        tripTheme: data[0].trip_theme,
        updatedAt: data[0].updated_at,
        backgroundImageUrl: data[0].background_image_url,
        userId: data[0].user_id,
        createdAt: data[0].created_at,
        peopleIds: data[0].trip_people || [],
        bagIds: data[0].trip_bags || [],
        items: data[0].items || [],
        todos: data[0].todos || [],
      };
      setTrips(prev => [...prev, createdTrip]);
      setCurrentTripId(createdTrip.id);
      setView('trip-home');
    }
  }, [setTrips, setCurrentTripId, setView]);

  const loadTrip = useCallback(async (tripId: string) => {
    setCurrentTripId(tripId);
    setView('trip-home');
  }, [setCurrentTripId, setView]);

  const clearCurrentTrip = useCallback(() => {
    setCurrentTripId(null);
    setView('my-trips');
  }, [setCurrentTripId, setView]);

  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    const updateData: any = {
      name: updates.name,
      date: updates.date,
      trip_theme: updates.tripTheme,
      background_image_url: updates.backgroundImageUrl,
      updated_at: new Date().toISOString(),
      ...(updates.peopleIds !== undefined && { trip_people: updates.peopleIds }),
      ...(updates.bagIds !== undefined && { trip_bags: updates.bagIds }),
      ...(updates.items !== undefined && { items: updates.items }),
      ...(updates.todos !== undefined && { todos: updates.todos }),
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
      `);

    if (error) {
      console.error("Error updating trip:", error);
      return;
    }
    if (data && data.length > 0) {
      setTrips(prev => prev.map(trip =>
        trip.id === tripId ? {
          ...trip,
          name: data[0].name,
          date: data[0].date,
          tripTheme: data[0].trip_theme,
          updatedAt: data[0].updated_at,
          backgroundImageUrl: data[0].background_image_url,
          peopleIds: data[0].trip_people || [],
          bagIds: data[0].trip_bags || [],
          items: data[0].items || [],
          todos: data[0].todos || [],
        } : trip
      ));
    }
  }, [setTrips]);

  const deleteTrip = useCallback(async (tripId: string) => {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      console.error("Error deleting trip:", error);
      return;
    }
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    if (currentTripId === tripId) {
      clearCurrentTrip();
    }
    if (trips.filter(t => t.id !== tripId).length === 0) {
        setView('my-trips');
    }
  }, [currentTripId, clearCurrentTrip, trips, setTrips, setView]);

  const createPerson = useCallback(async (personData: Omit<Person, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          name: personData.name,
          color: personData.color,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error creating person:", error);
        return null;
      }

      const newPersonFromDb = data[0];
      setPeople(prev => [...prev, {
        id: newPersonFromDb.id,
        name: newPersonFromDb.name,
        color: newPersonFromDb.color,
        createdAt: newPersonFromDb.created_at,
      }]);

      return newPersonFromDb.id;
    } catch (error) {
      console.error("Failed to create person:", error);
      return null;
    }
  }, [setPeople]);

  const updatePerson = useCallback(async (personId: number, updates: Partial<Person>) => {
    const updateData: any = {
      name: updates.name,
      color: updates.color,
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', personId)
      .select();

    if (error) {
      console.error("Error updating person:", error);
      return;
    }
    if (data && data.length > 0) {
      setPeople(prev => prev.map(person =>
        person.id === personId ? {
          ...person,
          name: data[0].name,
          color: data[0].color,
        } : person
      ));
    }
  }, [setPeople]);

  const deletePerson = useCallback(async (personId: number) => {
    const tripsToUpdate = trips.filter(trip =>
      (trip.items as Item[])?.some(item => item.personId === personId) ||
      (trip.peopleIds as number[])?.includes(personId)
    );

    for (const trip of tripsToUpdate) {
        const updatedItems = (trip.items as Item[] || []).map(item =>
            item.personId === personId ? { ...item, personId: undefined } : item
        );
        const updatedPeopleIds = (trip.peopleIds as number[] || []).filter(id => id !== personId);

        const { error: tripUpdateError } = await supabase
            .from('trips')
            .update({
                items: updatedItems,
                trip_people: updatedPeopleIds
            })
            .eq('id', trip.id);

        if (tripUpdateError) {
            console.error(`Error disassociating person from trip ${trip.id}'s items/trip_people:`, tripUpdateError);
        }
    }

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) {
      console.error("Error deleting person:", error);
      return;
    }
    setPeople(prev => prev.filter(person => person.id !== personId));

    const { data: updatedTripsData, error: tripsFetchError } = await supabase.from('trips').select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
    `);
    if (tripsFetchError) console.error("Error re-fetching trips after person deletion:", tripsFetchError);
    setTrips(updatedTripsData?.map(t => ({
        id: t.id, name: t.name, date: t.date, tripTheme: t.trip_theme, updatedAt: t.updated_at,
        backgroundImageUrl: t.background_image_url, userId: t.user_id, createdAt: t.created_at,
        peopleIds: t.trip_people || [], bagIds: t.trip_bags || [],
        items: t.items || [], todos: t.todos || []
    })) || []);
  }, [trips, setPeople, setTrips]);

  const addPersonToTrip = useCallback(async (personId: number) => {
    if (!currentTripId) {
      console.error("addPersonToTrip: No current trip ID selected.");
      return;
    }

    // Fetch the current trip's state to ensure we have the latest version
    const { data: tripData, error: fetchError } = await supabase
        .from('trips')
        .select(`id, trip_people`)
        .eq('id', currentTripId)
        .single();

    if (fetchError || !tripData) {
        console.error("Error fetching current trip for person add:", fetchError || "Trip not found");
        return;
    }

    const currentPeopleIds = (tripData.trip_people || []) as number[];
    const updatedPeopleIds = [...currentPeopleIds, personId];
    const uniquePeopleIds = Array.from(new Set(updatedPeopleIds));

    console.log("Attempting to add personId:", personId, "to trip_people:", uniquePeopleIds);

    const { data, error } = await supabase
      .from('trips')
      .update({ trip_people: uniquePeopleIds })
      .eq('id', currentTripId)
      .select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
      `);

    if (error) {
      console.error("Error adding person to trip in Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("Successfully added person to trip, data received:", data[0]);
      setTrips(prev => prev.map(trip =>
        trip.id === currentTripId ? {
          ...trip,
          name: data[0].name,
          date: data[0].date,
          tripTheme: data[0].trip_theme,
          updatedAt: data[0].updated_at,
          backgroundImageUrl: data[0].background_image_url,
          userId: data[0].user_id,
          createdAt: data[0].created_at,
          peopleIds: data[0].trip_people || [],
          bagIds: data[0].trip_bags || [],
          items: data[0].items || [],
          todos: data[0].todos || [],
        } : trip
      ));
    } else {
        console.warn("Supabase update for adding person returned no data.");
    }
  }, [currentTripId, setTrips]);

  const removePersonFromTrip = useCallback(async (personId: number) => {
    if (!currentTripId) {
      console.error("removePersonFromTrip: No current trip ID selected.");
      return;
    }

    // Fetch the current trip's state to ensure we have the latest version
    const { data: tripData, error: fetchError } = await supabase
        .from('trips')
        .select(`id, trip_people, items`)
        .eq('id', currentTripId)
        .single();

    if (fetchError || !tripData) {
        console.error("Error fetching current trip for person removal:", fetchError || "Trip not found");
        return;
    }

    const currentPeopleIds = (tripData.trip_people || []) as number[];
    const updatedPeopleIds = currentPeopleIds.filter(id => id !== personId);

    const currentItems = (tripData.items || []) as Item[];
    const updatedItems = currentItems.map(item =>
        item.personId === personId ? { ...item, personId: undefined } : item
    );

    console.log("Attempting to remove personId:", personId, "from trip_people:", updatedPeopleIds);

    const { data, error } = await supabase
      .from('trips')
      .update({ trip_people: updatedPeopleIds, items: updatedItems })
      .eq('id', currentTripId)
      .select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
      `);

    if (error) {
      console.error("Error removing person from trip in Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
        console.log("Successfully removed person from trip, data received:", data[0]);
      setTrips(prev => prev.map(trip =>
        trip.id === currentTripId ? {
          ...trip,
          name: data[0].name,
          date: data[0].date,
          tripTheme: data[0].trip_theme,
          updatedAt: data[0].updated_at,
          backgroundImageUrl: data[0].background_image_url,
          userId: data[0].user_id,
          createdAt: data[0].created_at,
          peopleIds: data[0].trip_people || [],
          bagIds: data[0].trip_bags || [],
          items: data[0].items || [],
          todos: data[0].todos || [],
        } : trip
      ));
    } else {
        console.warn("Supabase update for removing person returned no data.");
    }
  }, [currentTripId, setTrips]);

  const createBag = useCallback(async (bagData: Omit<Bag, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('bags')
        .insert({ name: bagData.name, color: bagData.color, created_at: new Date().toISOString() })
        .select();

      if (error) {
        console.error("Error creating bag:", error);
        return null;
      }
      const newBagFromDb = data[0];
      setBags(prev => [...prev, {
        id: newBagFromDb.id,
        name: newBagFromDb.name,
        color: newBagFromDb.color,
        createdAt: newBagFromDb.created_at,
      }]);
      return newBagFromDb.id;
    } catch (error) {
      console.error("Failed to create bag:", error);
      return null;
    }
  }, [setBags]);

  const updateBag = useCallback(async (bagId: number, updates: Partial<Bag>) => {
    const updateData: any = {
      name: updates.name,
      color: updates.color,
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('bags')
      .update(updateData)
      .eq('id', bagId)
      .select();

    if (error) {
      console.error("Error updating bag:", error);
      return;
    }
    if (data && data.length > 0) {
      setBags(prev => prev.map(bag =>
        bag.id === bagId ? {
          ...bag,
          name: data[0].name,
          color: data[0].color,
        } : bag
      ));
    }
  }, [setBags]);

  const deleteBag = useCallback(async (bagId: number) => {
    const tripsToUpdate = trips.filter(trip =>
      (trip.items as Item[])?.some(item => item.bagId === bagId) ||
      (trip.bagIds as number[])?.includes(bagId)
    );

    for (const trip of tripsToUpdate) {
        const updatedItems = (trip.items as Item[] || []).map(item =>
            item.bagId === bagId ? { ...item, bagId: undefined, packed: false } : item
        );
        const updatedBagIds = (trip.bagIds as number[] || []).filter(id => id !== bagId);

        const { error: tripUpdateError } = await supabase
            .from('trips')
            .update({
                items: updatedItems,
                trip_bags: updatedBagIds
            })
            .eq('id', trip.id);

        if (tripUpdateError) {
            console.error(`Error disassociating bag from trip ${trip.id}'s items/trip_bags:`, tripUpdateError);
        }
    }

    const { error } = await supabase
      .from('bags')
      .delete()
      .eq('id', bagId);

    if (error) {
      console.error("Error deleting bag:", error);
      return;
    }
    setBags(prev => prev.filter(bag => bag.id !== bagId));

    const { data: updatedTripsData, error: tripsFetchError } = await supabase.from('trips').select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
    `);
    if (tripsFetchError) console.error("Error re-fetching trips after bag deletion:", tripsFetchError);
    setTrips(updatedTripsData?.map(t => ({
        id: t.id, name: t.name, date: t.date, tripTheme: t.trip_theme, updatedAt: t.updated_at,
        backgroundImageUrl: t.background_image_url, userId: t.user_id, createdAt: t.created_at,
        peopleIds: t.trip_people || [], bagIds: t.trip_bags || [],
        items: t.items || [], todos: t.todos || []
    })) || []);
  }, [trips, setBags, setTrips]);

  const addCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'tripId'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryData.name, created_at: new Date().toISOString() })
        .select();

      if (error) {
        console.error("Error creating category:", error);
        return null;
      }
      const newCategoryFromDb = data[0];
      setCategories(prev => [...prev, {
        id: newCategoryFromDb.id,
        name: newCategoryFromDb.name,
        createdAt: newCategoryFromDb.created_at,
      }]);
      return newCategoryFromDb.id;
    } catch (error) {
      console.error("Failed to create category:", error);
      return null;
    }
  }, [setCategories]);

  const updateCategory = useCallback(async (categoryId: number, updates: Partial<Category>) => {
    const updateData: any = { name: updates.name };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select();

    if (error) {
      console.error("Error updating category:", error);
      return;
    }
    if (data && data.length > 0) {
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, name: data[0].name } : cat
      ));
    }
  }, [setCategories]);

  const deleteCategory = useCallback(async (categoryId: number) => {
    const tripsToUpdateForItems = trips.filter(trip => (trip.items as Item[])?.some(item => item.categoryId === categoryId));

    for (const trip of tripsToUpdateForItems) {
        const updatedItems = (trip.items as Item[] || []).map(item =>
            item.categoryId === categoryId ? { ...item, categoryId: undefined } : item
        );
        const { error: tripUpdateError } = await supabase
            .from('trips')
            .update({ items: updatedItems })
            .eq('id', trip.id);

        if (tripUpdateError) {
            console.error(`Error disassociating category from trip ${trip.id}'s items:`, tripUpdateError);
        }
    }

    const { error: subcategoryDeleteError } = await supabase
      .from('subcategories')
      .delete()
      .eq('category_id', categoryId);
    if (subcategoryDeleteError) console.error("Error deleting subcategories under category:", subcategoryDeleteError);
    setSubcategories(prev => prev.filter(sub => sub.categoryId !== categoryId));

    const { error: catalogItemDeleteError } = await supabase
        .from('catalog_items')
        .delete()
        .eq('category_id', categoryId);
    if (catalogItemDeleteError) console.error("Error deleting catalog items under category:", catalogItemDeleteError);
    setCatalogItems(prev => prev.filter(item => item.categoryId !== categoryId));

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error("Error deleting category:", error);
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));

    const { data: updatedTripsData, error: tripsFetchError } = await supabase.from('trips').select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
    `);
    if (tripsFetchError) console.error("Error re-fetching trips after category deletion:", tripsFetchError);
    setTrips(updatedTripsData?.map(t => ({
        id: t.id, name: t.name, date: t.date, tripTheme: t.trip_theme, updatedAt: t.updated_at,
        backgroundImageUrl: t.background_image_url, userId: t.user_id, createdAt: t.created_at,
        peopleIds: t.trip_people || [], bagIds: t.trip_bags || [],
        items: t.items || [], todos: t.todos || []
    })) || []);
  }, [trips, setCategories, setSubcategories, setCatalogItems, setTrips]);

  const addSubcategory = useCallback(async (subcategoryData: Omit<Subcategory, 'id' | 'tripId'>) => {
    if (!selectedCategoryId) {
      console.error("No category selected for subcategory creation.");
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert({ name: subcategoryData.name, category_id: Number(selectedCategoryId), created_at: new Date().toISOString() })
        .select();

      if (error) {
        console.error("Error creating subcategory:", error);
        return null;
      }
      const newSubcategoryFromDb = data[0];
      setSubcategories(prev => [...prev, {
        id: newSubcategoryFromDb.id,
        name: newSubcategoryFromDb.name,
        categoryId: newSubcategoryFromDb.category_id,
        createdAt: newSubcategoryFromDb.created_at,
      }]);
      return newSubcategoryFromDb.id;
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      return null;
    }
  }, [selectedCategoryId, setSubcategories]);

  const updateSubcategory = useCallback(async (subcategoryId: number, updates: Partial<Subcategory>) => {
    const updateData: any = { name: updates.name };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('subcategories')
      .update(updateData)
      .eq('id', subcategoryId)
      .select();

    if (error) {
      console.error("Error updating subcategory:", error);
      return;
    }
    if (data && data.length > 0) {
      setSubcategories(prev => prev.map(sub =>
        sub.id === subcategoryId ? { ...sub, name: data[0].name } : sub
      ));
    }
  }, [setSubcategories]);

  const deleteSubcategory = useCallback(async (subcategoryId: number) => {
    const tripsToUpdateForItems = trips.filter(trip => (trip.items as Item[])?.some(item => item.subcategoryId === subcategoryId));

    for (const trip of tripsToUpdateForItems) {
        const updatedItems = (trip.items as Item[] || []).map(item =>
            item.subcategoryId === subcategoryId ? { ...item, subcategoryId: undefined } : item
        );
        const { error: tripUpdateError } = await supabase
            .from('trips')
            .update({ items: updatedItems })
            .eq('id', trip.id);

        if (tripUpdateError) {
            console.error(`Error disassociating subcategory from trip ${trip.id}'s items:`, tripUpdateError);
        }
    }

    const { error: catalogItemDeleteError } = await supabase
        .from('catalog_items')
        .delete()
        .eq('subcategory_id', subcategoryId);
    if (catalogItemDeleteError) console.error("Error deleting catalog items under subcategory:", catalogItemDeleteError);
    setCatalogItems(prev => prev.filter(item => item.subcategoryId !== subcategoryId));

    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      console.error("Error deleting subcategory:", error);
      return;
    }
    setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));

    const { data: updatedTripsData, error: tripsFetchError } = await supabase.from('trips').select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
    `);
    if (tripsFetchError) console.error("Error re-fetching trips after subcategory deletion:", tripsFetchError);
    setTrips(updatedTripsData?.map(t => ({
        id: t.id, name: t.name, date: t.name, tripTheme: t.trip_theme, updatedAt: t.updated_at,
        backgroundImageUrl: t.background_image_url, userId: t.user_id, createdAt: t.created_at,
        peopleIds: t.trip_people || [], bagIds: t.trip_bags || [],
        items: t.items || [], todos: t.todos || []
    })) || []);
  }, [trips, setSubcategories, setCatalogItems, setTrips]);

  const addCatalogItem = useCallback(async (itemData: Omit<CatalogItem, 'id'>) => {
    if (!itemData.categoryId) {
      console.error("Cannot create catalog item without a category ID.");
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert({
          name: itemData.name,
          category_id: Number(itemData.categoryId),
          subcategory_id: itemData.subcategoryId ? Number(itemData.subcategoryId) : null,
          is_favorite: itemData.is_favorite || false,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error creating catalog item:", error);
        return null;
      }
      const newCatalogItemFromDb = data[0];
      setCatalogItems(prev => [...prev, {
        id: newCatalogItemFromDb.id,
        name: newCatalogItemFromDb.name,
        categoryId: newCatalogItemFromDb.category_id,
        subcategoryId: newCatalogItemFromDb.subcategory_id,
        is_favorite: newCatalogItemFromDb.is_favorite,
        createdAt: newCatalogItemFromDb.created_at,
      }]);
      return newCatalogItemFromDb.id;
    } catch (error) {
      console.error("Failed to create catalog item:", error);
      return null;
    }
  }, [setCatalogItems]);

  const updateCatalogItem = useCallback(async (itemId: number, updates: Partial<CatalogItem>) => {
    const updateData: any = {
      name: updates.name,
      category_id: updates.categoryId ? Number(updates.categoryId) : undefined,
      subcategory_id: updates.subcategoryId ? Number(updates.subcategoryId) : null,
      is_favorite: updates.is_favorite,
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from('catalog_items')
      .update(updateData)
      .eq('id', itemId)
      .select();

    if (error) {
      console.error("Error updating catalog item:", error);
      return;
    }
    if (data && data.length > 0) {
      setCatalogItems(prev => prev.map(item =>
        item.id === itemId ? {
          ...item,
          name: data[0].name,
          categoryId: data[0].category_id,
          subcategoryId: data[0].subcategory_id,
          is_favorite: data[0].is_favorite,
        } : item
      ));
    }
  }, [setCatalogItems]);

  const deleteCatalogItem = useCallback(async (itemId: number) => {
    const tripsToUpdateForItems = trips.filter(trip => (trip.items as Item[])?.some(item => item.catalogItemId === itemId));

    for (const trip of tripsToUpdateForItems) {
        const updatedItems = (trip.items as Item[] || []).map(item =>
            item.catalogItemId === itemId ? { ...item, catalogItemId: undefined, name: item.name + " (Deleted Catalog Item)" } : item
        );

        const { error: tripUpdateError } = await supabase
            .from('trips')
            .update({ items: updatedItems })
            .eq('id', trip.id);

        if (tripUpdateError) {
            console.error(`Error disassociating catalog item from trip ${trip.id}'s items:`, tripUpdateError);
        }
    }

    const { error } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error("Error deleting catalog item:", error);
      return;
    }
    setCatalogItems(prev => prev.filter(item => item.id !== itemId));

    const { data: updatedTripsData, error: tripsFetchError } = await supabase.from('trips').select(`
        id, name, date, trip_theme, updated_at, created_at, background_image_url, user_id,
        trip_people, trip_bags, items, todos
    `);
    if (tripsFetchError) console.error("Error re-fetching trips after catalog item deletion:", tripsFetchError);
    setTrips(updatedTripsData?.map(t => ({
        id: t.id, name: t.name, date: t.date, tripTheme: t.trip_theme, updatedAt: t.updated_at,
        backgroundImageUrl: t.background_image_url, userId: t.user_id, createdAt: t.created_at,
        peopleIds: t.trip_people || [], bagIds: t.trip_bags || [],
        items: t.items || [], todos: t.todos || []
    })) || []);
  }, [trips, setCatalogItems, setTrips]);

  const addItemToTrip = useCallback(async (itemData: Omit<Item, 'tripId'>) => {
    if (!currentTripId || !currentTrip) {
      console.error("No current trip selected to add item to.");
      return;
    }

    const newItem: Item = {
      id: uuidv4(),
      name: itemData.name,
      catalogItemId: itemData.catalogItemId,
      categoryId: itemData.categoryId,
      subcategoryId: itemData.subcategoryId,
      personId: itemData.personId,
      bagId: itemData.bagId,
      packed: itemData.packed || false,
      quantity: itemData.quantity || 1,
      isToBuy: itemData.isToBuy || false,
      notes: itemData.notes || null,
      createdAt: new Date().toISOString(),
    };

    const updatedItems = [...(currentTrip.items || []), newItem];

    await updateTrip(currentTripId, { items: updatedItems });
  }, [currentTripId, currentTrip, updateTrip]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<Item>) => {
    if (!currentTripId || !currentTrip) {
      console.error("No current trip selected to update item in.");
      return;
    }

    const updatedItems = (currentTrip.items || []).map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    await updateTrip(currentTripId, { items: updatedItems });
  }, [currentTripId, currentTrip, updateTrip]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!currentTripId || !currentTrip) {
      console.error("No current trip selected to delete item from.");
      return;
    }

    const updatedItems = (currentTrip.items || []).filter(item => item.id !== itemId);

    await updateTrip(currentTripId, { items: updatedItems });
  }, [currentTripId, currentTrip, updateTrip]);

  const addSingleCatalogItemToTripItems = useCallback(async (
    bagId: number | null,
    personId: number | null,
    catalogItem: CatalogItem,
    quantity: number,
    notes?: string,
    isToBuy: boolean = false
  ) => {
    const itemToAdd: Omit<Item, 'tripId'> = {
      name: catalogItem.name,
      catalogItemId: catalogItem.id,
      categoryId: catalogItem.categoryId,
      subcategoryId: catalogItem.subcategoryId,
      packed: false,
      quantity: quantity,
      isToBuy: isToBuy,
      bagId: bagId,
      personId: personId,
      notes: notes,
    };
    await addItemToTrip(itemToAdd);
  }, [addItemToTrip]);

  const addMultipleCatalogItemsToTripItems = useCallback(async (
    bagId: number | null,
    personId: number | null,
    itemsToAdd: { catalogItemId: number; quantity: number; notes?: string; isToBuy?: boolean }[]
  ) => {
    if (!currentTripId || !currentTrip) {
      console.error("No current trip selected to add items to.");
      return;
    }

    const newItems: Item[] = [];
    itemsToAdd.forEach(itemData => {
      const catalogItem = catalogItems.find(ci => ci.id === itemData.catalogItemId);
      if (!catalogItem) {
        console.warn(`Catalog item with ID ${itemData.catalogItemId} not found. Skipping.`);
        return;
      }
      newItems.push({
        id: uuidv4(),
        name: catalogItem.name,
        catalogItemId: catalogItem.id,
        categoryId: catalogItem.categoryId,
        subcategoryId: catalogItem.subcategoryId,
        packed: false,
        quantity: itemData.quantity,
        isToBuy: itemData.isToBuy || false,
        bagId: bagId,
        personId: personId,
        notes: itemData.notes || null,
        createdAt: new Date().toISOString(),
      });
    });

    const updatedItems = [...(currentTrip.items || []), ...newItems];

    await updateTrip(currentTripId, { items: updatedItems });
  }, [currentTripId, currentTrip, catalogItems, updateTrip]);


  const value = useMemo(() => ({
    categories,
    subcategories,
    catalog_items: catalogItems,
    bags,
    people,
    items: currentTripItems,
    todos: currentTripTodos,
    trips,
    currentTrip,
    currentTripId,
    isLoading,

    view, setView,
    selectedCategoryId, selectCategory,
    selectedSubcategoryId, selectSubcategory,

    sidebarOpen, toggleSidebar,

    createTrip, loadTrip, clearCurrentTrip, updateTrip, deleteTrip,
    createPerson, updatePerson, deletePerson,
    addPersonToTrip,
    removePersonFromTrip,
    createBag, updateBag, deleteBag,
    addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    addCatalogItem, updateCatalogItem, deleteCatalogItem,
    addItemToTrip, updateItem, deleteItem,
    addSingleCatalogItemToTripItems,
    addMultipleCatalogItemsToTripItems,
  }), [
    categories, subcategories, catalogItems, bags, people,
    currentTripItems, currentTripTodos, trips, currentTrip, currentTripId,
    view, sidebarOpen, selectedCategoryId, selectedSubcategoryId, isLoading,
    setView, selectCategory, selectSubcategory, toggleSidebar,
    createTrip, loadTrip, clearCurrentTrip, updateTrip, deleteTrip,
    createPerson, updatePerson, deletePerson,
    addPersonToTrip, removePersonFromTrip,
    createBag, updateBag, deleteBag,
    addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    addCatalogItem, updateCatalogItem, deleteCatalogItem,
    addItemToTrip, updateItem, deleteItem,
    addSingleCatalogItemToTripItems, addMultipleCatalogItemsToTripItems,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;