// src/types/index.ts

export interface Trip {
  id: string;
  name: string;
  date?: string;
  tripTheme?: string;
  updatedAt?: string;
  createdAt: string;
  backgroundImageUrl?: string;
  userId?: string;
  peopleIds?: number[];
  bagIds?: number[];
  items?: Item[];
  todos?: TodoItem[];
}

export interface Person {
  id: number;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface Bag {
  id: number;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  createdAt?: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  categoryId: number;
  subcategoryId?: number;
  is_favorite?: boolean;
  createdAt?: string;
}

export interface Item {
  id: string; // UUID
  name: string;
  catalogItemId?: number; // Link to catalog item
  categoryId?: number;
  subcategoryId?: number;
  personId?: number;
  bagId?: number;
  packed: boolean;
  quantity: number;
  isToBuy: boolean;
  notes?: string;
  createdAt: string;
}

export interface TodoItem {
  id: string; // UUID
  name: string;
  isComplete: boolean;
  createdAt: string;
}