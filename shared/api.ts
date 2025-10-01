/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Coffee product interface
 */
export interface CoffeeProduct {
  id: string;
  name: string;
  origin: string;
  roast: 'light' | 'medium' | 'dark';
  price: number;
  image: string;
  description: string;
  weight: number; // in grams
  flavorNotes: string[];
  acidity: 'low' | 'medium' | 'high';
  body: 'light' | 'medium' | 'full';
  process: 'washed' | 'natural' | 'honey' | 'semi-washed';
  elevation: number; // in meters
  inStock: boolean;
}

/**
 * Coffee filters interface
 */
export interface CoffeeFilters {
  search: string;
  origins: string[];
  roasts: string[];
  priceRange: [number, number];
  inStock: boolean | null;
}
