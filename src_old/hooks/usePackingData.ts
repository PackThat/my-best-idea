import { useState, useEffect } from 'react';
import { Item, Category, Subcategory, Bag, Person, TodoItem, TripType } from '@/types';
import { defaultCategories, defaultSubcategories, defaultBags, defaultPeople, defaultItems } from '@/data/defaultData';

const STORAGE_KEY = 'packThatData';

interface PackingData {
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  items: Item[];
  todos: TodoItem[];
  currentTripType: string;
}

export const usePackingData = () => {
  const [data, setData] = useState<PackingData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      categories: defaultCategories,
      subcategories: defaultSubcategories,
      bags: defaultBags,
      people: defaultPeople,
      items: defaultItems,
      todos: [],
      currentTripType: 'General Trip',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<PackingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    updateData({ items: [...data.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    const items = data.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateData({ items });
  };

  const deleteItem = (id: string) => {
    const items = data.items.filter(item => item.id !== id);
    updateData({ items });
  };

  return {
    ...data,
    updateData,
    addItem,
    updateItem,
    deleteItem,
  };
};