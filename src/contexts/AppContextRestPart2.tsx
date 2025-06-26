import { Trip, Item } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople } from '@/data/defaultData';

const showToast = (message: string) => {
  console.log(`Toast: ${message}`);
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 p-4 rounded-md text-white z-50 bg-green-500';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

const STORAGE_KEY = 'packThatData';

export const createTripMethods = (data: any, setData: any, saveCurrentTripState: any) => {
  const createTrip = (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating trip:', trip.name);
    
    if (data.currentTripId) {
      saveCurrentTripState();
    }
    
    const now = new Date().toISOString();
    const newTrip: Trip = { 
      ...trip, 
      id: Date.now().toString(), 
      createdAt: now, 
      updatedAt: now, 
      items: [],
      categories: [...defaultCategories],
      subcategories: [...defaultSubcategories],
      bags: [...defaultBags],
      people: [...defaultPeople],
      todos: [],
      tripBags: []
    };
    
    setData((prev: any) => {
      const newData = {
        ...prev,
        trips: [...prev.trips, newTrip],
        currentTripId: newTrip.id,
        currentTripType: newTrip.name,
        items: [],
        categories: [...defaultCategories],
        subcategories: [...defaultSubcategories],
        bags: [...defaultBags],
        people: [...defaultPeople],
        todos: [],
        tripBags: []
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    
    showToast(`Trip "${trip.name}" created successfully!`);
  };
  
  const loadTrip = (tripId: string) => {
    console.log('Loading trip:', tripId);
    
    if (data.currentTripId && data.currentTripId !== tripId) {
      saveCurrentTripState();
    }
    
    const trip = data.trips.find((t: Trip) => t.id === tripId);
    if (trip) {
      setData((prev: any) => ({
        ...prev,
        currentTripId: tripId,
        currentTripType: trip.name,
        items: [...(trip.items || [])],
        categories: [...(trip.categories || defaultCategories)],
        subcategories: [...(trip.subcategories || defaultSubcategories)],
        bags: [...(trip.bags || defaultBags)],
        people: [...(trip.people || defaultPeople)],
        todos: [...(trip.todos || [])],
        tripBags: [...(trip.tripBags || [])]
      }));
      
      showToast(`Loaded trip: ${trip.name}`);
    }
  };
  
  const resetTrip = (tripId: string) => {
    const trip = data.trips.find((t: Trip) => t.id === tripId);
    if (trip) {
      const resetItems = trip.items.map((item: Item) => ({ ...item, packed: false }));
      const updatedTrip = { ...trip, items: resetItems, updatedAt: new Date().toISOString() };
      setData((prev: any) => ({ ...prev, trips: prev.trips.map((t: Trip) => t.id === tripId ? updatedTrip : t), items: prev.currentTripId === tripId ? resetItems : prev.items }));
      showToast('Trip reset successfully!');
    }
  };
  
  const cloneTrip = (tripId: string, newName: string) => {
    const trip = data.trips.find((t: Trip) => t.id === tripId);
    if (trip) {
      const now = new Date().toISOString();
      const clonedTrip: Trip = { ...trip, id: Date.now().toString(), name: newName, items: trip.items.map((item: Item) => ({ ...item, id: Date.now().toString() + Math.random(), packed: false })), createdAt: now, updatedAt: now, tripBags: trip.tripBags || [] };
      setData((prev: any) => ({ ...prev, trips: [...prev.trips, clonedTrip] }));
      showToast(`Trip cloned as: ${newName}`);
    }
  };
  
  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setData((prev: any) => ({ ...prev, trips: prev.trips.map((trip: Trip) => trip.id === tripId ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip) }));
  };
  
  const deleteTrip = (tripId: string) => {
    setData((prev: any) => ({ ...prev, trips: prev.trips.filter((trip: Trip) => trip.id !== tripId) }));
    showToast('Trip deleted successfully!');
  };

  return {
    createTrip,
    loadTrip,
    resetTrip,
    cloneTrip,
    updateTrip,
    deleteTrip
  };
};