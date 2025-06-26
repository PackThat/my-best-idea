export interface Item {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  quantity: number;
  notes: string;
  packed: boolean;
  needsToBuy: boolean;
  bagId?: string;
  personId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Bag {
  id: string;
  name: string;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  type: 'before' | 'after';
  location: 'work' | 'home' | 'online' | 'other';
}

export interface TripType {
  id: string;
  name: string;
  items: Item[];
  todos: TodoItem[];
}

export interface Trip {
  id: string;
  name: string;
  date?: string;
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  bags: Bag[];
  people: Person[];
  todos: TodoItem[];
  tripBags: string[];
  createdAt: string;
  updatedAt: string;
}