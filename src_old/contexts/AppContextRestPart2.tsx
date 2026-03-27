import { Trip, Item } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople } from '@/data/defaultData';

const STORAGE_KEY = 'packThatData';

export const createTripMethods = (data: any, setData: any) => {

  const saveCurrentTripState = (prevState: any) => {
    if (!prevState.currentTripId) return prevState.trips;

    const tripIndex = prevState.trips.findIndex((t: Trip) => t.id === prevState.currentTripId);
    if (tripIndex === -1) return prevState.trips;
    
    const updatedTrips = [...prevState.trips];
    updatedTrips[tripIndex] = {
      ...updatedTrips[tripIndex],
      items: prevState.items,
      categories: prevState.categories,
      subcategories: prevState.subcategories,
      bags: prevState.bags,
      people: prevState.people,
      todos: prevState.todos,
      tripBags: prevState.tripBags,
      updatedAt: new Date().toISOString()
    };
    return updatedTrips;
  };

  const createTrip = (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    setData((prev: any) => {
      const updatedTrips = saveCurrentTripState(prev);

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
      
      const newTripsArray = [...updatedTrips, newTrip];

      const newData = {
        ...prev,
        trips: newTripsArray,
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
  };
  
  const loadTrip = (tripId: string) => {
    // BREADCRUMB 1: Check if this function is called
    console.log(`BREADCRUMB 1: loadTrip function called with tripId: ${tripId}`);
    
    setData((prev: any) => {
      if (prev.currentTripId === tripId) return prev; 

      const updatedTrips = saveCurrentTripState(prev);
      const tripToLoad = updatedTrips.find((t: Trip) => t.id === tripId);
      
      if (tripToLoad) {
        const newState = {
          ...prev,
          trips: updatedTrips,
          currentTripId: tripId,
          currentTripType: tripToLoad.name,
          items: [...(tripToLoad.items || [])],
          categories: [...(tripToLoad.categories || defaultCategories)],
          subcategories: [...(tripToLoad.subcategories || defaultSubcategories)],
          bags: [...(tripToLoad.bags || defaultBags)],
          people: [...(tripToLoad.people || defaultPeople)],
          todos: [...(tripToLoad.todos || [])],
          tripBags: [...(tripToLoad.tripBags || [])]
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }
      
      return prev; 
    });
  };
  
  const resetTrip = (tripId: string) => {
    setData((prev: any) => {
      const tripIndex = prev.trips.findIndex((t: Trip) => t.id === tripId);
      if (tripIndex === -1) return prev;

      const trip = prev.trips[tripIndex];
      const resetItems = trip.items.map((item: Item) => ({ ...item, packed: false }));
      const updatedTrip = { ...trip, items: resetItems, updatedAt: new Date().toISOString() };
      
      const newTrips = [...prev.trips];
      newTrips[tripIndex] = updatedTrip;
      
      const newState = {
        ...prev,
        trips: newTrips,
        items: prev.currentTripId === tripId ? resetItems : prev.items
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };
  
  const cloneTrip = (tripId: string, newName: string) => {
    setData((prev: any) => {
      const tripToClone = prev.trips.find((t: Trip) => t.id === tripId);
      if (!tripToClone) return prev;

      const now = new Date().toISOString();
      const newItems = (tripToClone.items || []).map((item: Item) => ({
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        packed: false,
      }));

      const clonedTrip: Trip = { 
        ...tripToClone, 
        id: Date.now().toString(), 
        name: newName, 
        items: newItems,
        createdAt: now, 
        updatedAt: now, 
      };
      
      const newState = {
        ...prev,
        trips: [...prev.trips, clonedTrip]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };
  
  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setData((prev: any) => {
      const newTrips = prev.trips.map((trip: Trip) => 
        trip.id === tripId ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
      );
      const newState = { ...prev, trips: newTrips };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };
  
  const deleteTrip = (tripId: string) => {
    setData((prev: any) => {
      const newState = {
        ...prev,
        trips: prev.trips.filter((trip: Trip) => trip.id !== tripId)
      };
      if (prev.currentTripId === tripId) {
        newState.currentTripId = null;
        newState.currentTripType = 'No trip selected';
        newState.items = [];
        newState.categories = [...defaultCategories];
        newState.subcategories = [...defaultSubcategories];
        newState.bags = [...defaultBags];
        newState.people = [...defaultPeople];
        newState.todos = [];
        newState.tripBags = [];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
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