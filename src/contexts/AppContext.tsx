import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople, defaultItems } from '@/data/defaultData';
import { createRestOfContext } from './AppContextRest';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  items: Item[];
  todos: TodoItem[];
  trips: Trip[];
  currentTripType: string;
  currentTripId?: string;
  tripBags: string[];
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  updateTripType: (tripType: string) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deletePerson: (personId: string) => void;
  removePersonFromTrip: (personId: string) => void;
  updateBag: (bagId: string, updates: Partial<Bag>) => void;
  deleteBag: (bagId: string) => void;
  removeBagFromTrip: (bagId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => void;
  addBag: (bag: Omit<Bag, 'id'>) => Bag;
  addBagToTrip: (bagId: string) => void;
  addMultipleItems: (items: any[]) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loadTrip: (tripId: string) => void;
  resetTrip: (tripId: string) => void;
  cloneTrip: (tripId: string, newName: string) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  saveCurrentTripState: () => void;
  addItemToPacking: (itemId: string, personId?: string, bagId?: string, quantity?: number) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

const STORAGE_KEY = 'packThatData';

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`Toast ${type}: ${message}`);
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
    type === 'error' ? 'bg-red-500' : 'bg-green-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, trips: parsed.trips || [], tripBags: parsed.tripBags || [] };
    }
    return {
      categories: defaultCategories,
      subcategories: defaultSubcategories,
      bags: defaultBags,
      people: defaultPeople,
      items: defaultItems,
      todos: [],
      trips: [],
      currentTripType: 'General Trip',
      currentTripId: undefined,
      tripBags: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  const addBagToTrip = (bagId: string) => {
    console.log('🎒 addBagToTrip called with bagId:', bagId);
    
    setData(currentData => {
      const bag = currentData.bags.find(b => b.id === bagId);
      if (!bag) {
        console.log('❌ Bag not found:', bagId);
        showToast('Bag not found', 'error');
        return currentData;
      }
      
      if (currentData.tripBags.includes(bagId)) {
        console.log('⚠️ Bag already in trip:', bag.name);
        showToast(`${bag.name} is already in this trip`);
        return currentData;
      }
      
      console.log('✅ Adding bag to trip:', bag.name);
      const newTripBags = [...currentData.tripBags, bagId];
      console.log('🎒 Updated tripBags:', newTripBags);
      
      const newData = {
        ...currentData,
        tripBags: newTripBags
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      showToast(`Added ${bag.name} to trip`);
      return newData;
    });
  };

  const restMethods = createRestOfContext(data, setData);

  return (
    <AppContext.Provider value={{
      sidebarOpen,
      toggleSidebar,
      ...data,
      addBagToTrip,
      ...restMethods
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider };