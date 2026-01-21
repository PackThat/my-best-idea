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
  id: string;
  name: string;
  createdAt?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  is_favorite?: boolean;
  createdAt?: string;
}

export interface Item {
  id: string; // UUID
  name: string;
  catalogItemId?: string; // Link to catalog item
  categoryId?: string;
  subcategoryId?: string;
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

// Updated ViewState to include the new Catalog Management views
export type ViewState =
  | { type: 'list' }
  | { type: 'home' }
  | { type: 'person'; personId?: string }
  | { type: 'bag'; bagId?: string }
  | { type: 'category'; categoryId?: string; personId?: string }
  | { type: 'trip-people' }
  | { type: 'trip-bags' }
  | { type: 'trip-items' }
  | { type: 'trip-tobuy' }
  | { type: 'trip-add-item' }
  | { type: 'trip-add-subcategory' }
  | { type: 'trip-add-item-list' }
  | { type: 'trip-settings' }
  // --- NEW VIEWS ---
  | { type: 'items-management' }
  | { type: 'catalog-subcategory-list' }
  | { type: 'catalog-item-list' };