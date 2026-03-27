import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Item, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople, defaultItems } from '@/data/defaultData';

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
    const bag = data.bags.find(b => b.id === bagId);
    if (!bag) {
      toast({ title: 'Bag not found', variant: 'destructive' });
      return;
    }
    
    if (data.tripBags.includes(bagId)) {
      toast({ title: `${bag.name} is already in this trip` });
      return;
    }
    
    setData(prev => {
      const newTripBags = [...prev.tripBags, bagId];
      const newData = {
        ...prev,
        tripBags: newTripBags
      };
      
      if (prev.currentTripId) {
        const currentTrip = prev.trips.find(t => t.id === prev.currentTripId);
        if (currentTrip) {
          const updatedTrip = {
            ...currentTrip,
            tripBags: newTripBags,
            updatedAt: new Date().toISOString()
          };
          newData.trips = prev.trips.map(t => t.id === prev.currentTripId ? updatedTrip : t);
        }
      }
      
      return newData;
    });
    
    toast({ title: `Added ${bag.name} to trip` });
  };