import React from 'react';
import { Item, Category, Subcategory, Bag, Person, TodoItem, Trip } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople, defaultItems } from '@/data/defaultData';
import { createTripMethods } from './AppContextRestPart2';

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

export const createRestOfContext = (data: any, setData: any) => {
  const saveCurrentTripState = () => {
    console.log('💾 saveCurrentTripState called for tripId:', data.currentTripId);
    
    if (data.currentTripId) {
      setData((prev: any) => {
        const updatedTrip = {
          id: prev.currentTripId,
          name: prev.currentTripType,
          items: [...prev.items],
          categories: [...prev.categories],
          subcategories: [...prev.subcategories],
          bags: [...prev.bags],
          people: [...prev.people],
          todos: [...prev.todos],
          tripBags: [...prev.tripBags],
          updatedAt: new Date().toISOString(),
          createdAt: prev.trips.find((t: Trip) => t.id === prev.currentTripId)?.createdAt || new Date().toISOString()
        };
        
        const newTrips = prev.trips.map((t: Trip) => 
          t.id === prev.currentTripId ? updatedTrip : t
        );
        
        const newData = {
          ...prev,
          trips: newTrips
        };
        
        console.log('💾 Saved trip state for:', updatedTrip.name);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
      });
    }
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setData((prev: any) => ({ ...prev, items: [...prev.items, newItem] }));
    return newItem;
  };
  
  const addItemToPacking = (itemId: string, personId?: string, bagId?: string, quantity = 1) => {
    const catalogItem = defaultItems.find(item => item.id === itemId) || data.items.find((item: Item) => item.id === itemId);
    if (!catalogItem) return;
    const packingItem: Omit<Item, 'id'> = { name: catalogItem.name, categoryId: catalogItem.categoryId, subcategoryId: catalogItem.subcategoryId, quantity, notes: catalogItem.notes, packed: false, needsToBuy: false, personId, bagId };
    addItem(packingItem);
    showToast(`Added ${catalogItem.name} to packing list`);
  };
  
  const updateItem = (id: string, updates: Partial<Item>) => {
    setData((prev: any) => ({ ...prev, items: prev.items.map((item: Item) => item.id === id ? { ...item, ...updates } : item) }));
  };
  
  const deleteItem = (id: string) => {
    setData((prev: any) => ({ ...prev, items: prev.items.filter((item: Item) => item.id !== id) }));
  };
  
  const updateTripType = (tripType: string) => {
    setData((prev: any) => ({ ...prev, currentTripType: tripType }));
  };
  
  const addPerson = (person: Omit<Person, 'id'>) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const newPerson = { ...person, id: Date.now().toString(), color: colors[data.people.length % colors.length] };
    setData((prev: any) => ({ ...prev, people: [...prev.people, newPerson] }));
    showToast('Person added successfully!');
  };
  
  const updatePerson = (personId: string, updates: Partial<Person>) => {
    // Update in defaultPeople array as well
    const personIndex = defaultPeople.findIndex(p => p.id === personId);
    if (personIndex !== -1) {
      defaultPeople[personIndex] = { ...defaultPeople[personIndex], ...updates };
    }
    
    setData((prev: any) => ({
      ...prev,
      people: prev.people.map((p: Person) => p.id === personId ? { ...p, ...updates } : p)
    }));
    showToast('Person updated successfully!');
  };
  
  const updateBag = (bagId: string, updates: Partial<Bag>) => {
    setData((prev: any) => ({
      ...prev,
      bags: prev.bags.map((b: Bag) => b.id === bagId ? { ...b, ...updates } : b)
    }));
    showToast('Bag updated successfully!');
  };
  
  const deletePerson = (personId: string) => {
    const person = defaultPeople.find((p: Person) => p.id === personId);
    if (person) {
      // Remove from defaultPeople array
      const personIndex = defaultPeople.findIndex(p => p.id === personId);
      if (personIndex !== -1) {
        defaultPeople.splice(personIndex, 1);
      }
      
      setData((prev: any) => ({
        ...prev,
        people: prev.people.filter((p: Person) => p.id !== personId),
        items: prev.items.filter((item: Item) => item.personId !== personId)
      }));
      showToast(`Deleted ${person.name} from database`);
    }
  };
  
  const deleteBag = (bagId: string) => {
    const bag = data.bags.find((b: Bag) => b.id === bagId);
    if (bag) {
      setData((prev: any) => ({
        ...prev,
        bags: prev.bags.filter((b: Bag) => b.id !== bagId),
        items: prev.items.filter((item: Item) => item.bagId !== bagId),
        tripBags: prev.tripBags.filter((id: string) => id !== bagId)
      }));
      showToast(`Deleted ${bag.name} from database`);
    }
  };
  
  const removePersonFromTrip = (personId: string) => {
    const person = data.people.find((p: Person) => p.id === personId);
    if (person) {
      setData((prev: any) => ({
        ...prev,
        items: prev.items.filter((item: Item) => item.personId !== personId),
        people: prev.people.filter((p: Person) => p.id !== personId)
      }));
      showToast(`Removed ${person.name} from trip`);
    }
  };
  
  const removeBagFromTrip = (bagId: string) => {
    const bag = data.bags.find((b: Bag) => b.id === bagId);
    if (bag) {
      setData((prev: any) => ({
        ...prev,
        tripBags: prev.tripBags.filter((id: string) => id !== bagId),
        items: prev.items.filter((item: Item) => item.bagId !== bagId)
      }));
      showToast(`Removed ${bag.name} from trip`);
    }
  };
  
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setData((prev: any) => ({ ...prev, categories: [...prev.categories, newCategory] }));
    showToast('Category added successfully!');
  };
  
  const addSubcategory = (subcategory: Omit<Subcategory, 'id'>) => {
    const newSubcategory = { ...subcategory, id: Date.now().toString() };
    setData((prev: any) => ({ ...prev, subcategories: [...prev.subcategories, newSubcategory] }));
    showToast('Subcategory added successfully!');
  };
  
  const addBag = (bag: Omit<Bag, 'id'>) => {
    const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];
    const newBag = { ...bag, id: Date.now().toString(), color: bag.color || colors[data.bags.length % colors.length] };
    
    setData((prev: any) => {
      const newData = { ...prev, bags: [...prev.bags, newBag] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    
    showToast('Bag added successfully!');
    return newBag;
  };
  
  const addMultipleItems = (items: any[]) => {
    const newItems = items.map((item, index) => ({ id: (Date.now() + index).toString(), name: item.name || 'Unnamed Item', category: item.category || 'General', subcategory: item.subcategory || 'General', categoryId: '', subcategoryId: '', quantity: item.quantity || 1, notes: item.notes || '', packed: false, needsToBuy: false, personId: '', bagId: '' }));
    setData((prev: any) => ({ ...prev, items: [...prev.items, ...newItems] }));
  };

  const tripMethods = createTripMethods(data, setData, saveCurrentTripState);

  return {
    addItem,
    updateItem,
    deleteItem,
    updateTripType,
    addPerson,
    updatePerson,
    updateBag,
    deletePerson,
    deleteBag,
    removePersonFromTrip,
    removeBagFromTrip,
    addCategory,
    addSubcategory,
    addBag,
    addMultipleItems,
    saveCurrentTripState,
    addItemToPacking,
    ...tripMethods
  };
};