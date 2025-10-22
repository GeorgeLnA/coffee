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
 * Coffee label data interface
 */
export interface CoffeeLabelData {
  // Predefined template id (one of six curated options)
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold';
  // Label size
  size: 'small' | 'medium' | 'large';
  // Flavor notes to render on the label
  flavor_notes?: string[];
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
  // New fields for custom labels and metrics
  strength_level?: number;
  acidity_level?: number;
  roast_level?: number;
  body_level?: number;
  label_data?: CoffeeLabelData | null;
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
