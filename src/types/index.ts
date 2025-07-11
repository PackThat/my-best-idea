export interface Item {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  packed: boolean;
  needsToBuy: boolean;
  personId?: string;
  bagId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export interface Bag {
  id: string;
  name: string;
  color?: string;
}

export interface Person {
  id: string;
  name: string;
  color?: string;
}

// This is the main fix for this file
export interface Trip {
  id: string;
  name: string;
  date?: string;
  items: Item[];
  todos: TodoItem[];
  // These now use snake_case to match the database columns
  trip_bags: string[];
  trip_people: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
export interface CatalogItem {
  id: string;
  name: string;
  category_id: string;
  subcategory_id: string;
  notes?: string;
}