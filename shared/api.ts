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
  // Predefined template id (one of six curated options) or custom
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold' | 'custom';
  // Label size
  size: 'small' | 'medium' | 'large';
  // Flavor notes to render on the label
  flavor_notes?: string[];
  // Pattern for the label background
  pattern?: 'dots' | 'stripes' | 'grid' | 'geometric' | 'waves' | 'stars' | 'leaves' | 'diamonds' | 'lines';
  // Custom colors when template is 'custom'
  customColors?: {
    bg: string;
    text: string;
    accent: string;
  };
}

/**
 * Coffee product interface
 */
export interface CoffeeProduct {
  id: string;
  slug?: string;
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
  process: string;
  /**
   * Human-readable process label adjusted for the active language.
   * Falls back to the raw process when no mapping is found.
   */
  processDisplay?: string;
  /**
   * Original process string as stored in the database (can be UA/RU/EN).
   */
  processRaw?: string;
  elevation: number; // in meters
  inStock: boolean;
  active?: boolean;
  custom_label?: string | null;
  custom_label_color?: string | null;
  custom_label_text_color?: string | null;
  // New fields for custom labels and metrics
  /**
   * Coffee metric levels (0-5; 0 means not specified/displayed)
   */
  strength_level?: number; // 0—5
  acidity_level?: number;
  roast_level?: number;
  body_level?: number;
  label_data?: CoffeeLabelData | null;
  label_image_url?: string | null;
  seo_keywords_ua?: string[] | null;
  seo_keywords_ru?: string[] | null;
}

/**
 * Coffee filters interface
 */
export interface CoffeeFilters {
  search: string;
  origins: string[];
  roasts: string[];
  processes: string[];
  priceRange: [number, number];
  inStock: boolean | null;
}

/**
 * LiqPay client-side types (no private key needed)
 */
export interface LiqPayConfig {
  version: number;
  public_key: string;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url?: string;
  server_url?: string;
  language?: string;
  paytypes?: string;
  sandbox?: number;
  info?: string;
  customer?: string;
}

export interface LiqPayCheckoutInit {
  data: string; // base64-encoded config
  signature: string; // empty for client-side
  language: string;
  mode: "embed" | "popup";
}

export type LiqPayStatus =
  | "success"
  | "wait_accept"
  | "sandbox"
  | "failure"
  | "error"
  | "reversed"
  | "subscribed"
  | "unsubscribed"
  | "processing";

export interface LiqPayCallbackData {
  status: LiqPayStatus;
  order_id: string;
  transaction_id?: number;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}
