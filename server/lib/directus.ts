import { createDirectus, rest, authentication } from '@directus/sdk';

// Define your Directus collections schema
export interface DirectusSchema {
  posts: Post[];
  pages: Page[];
  globals: Global[];
  navigation: Navigation[];
  navigation_items: NavigationItem[];
  homepage_settings: HomepageSettings;
  homepage_featured_products: FeaturedProduct[];
  trade_points: TradePoint[];
  // Add more collections as needed based on your Directus setup
}

export interface Post {
  id: string;
  status: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author?: string;
  date_created: string;
  date_updated: string;
}

export interface Page {
  id: string;
  status: string;
  title: string;
  slug: string;
  permalink?: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
  date_created: string;
  date_updated: string;
}

export interface Global {
  id: string;
  site_name?: string;
  site_description?: string;
  site_logo?: string;
  contact_email?: string;
  social_links?: any;
}

export interface Navigation {
  id: string;
  name: string;
  items?: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  title: string;
  url?: string;
  page?: string;
  target?: string;
  sort?: number;
}

export interface HomepageSettings {
  id: string;
  hero_title_line1?: string;
  hero_title_line2?: string;
  hero_title_line3?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_video?: string;
  season_title?: string;
  news_section_title?: string;
  news_section_subtitle?: string;
  trade_points_title?: string;
}

export interface FeaturedProduct {
  id: string;
  status: string;
  sort?: number;
  title: string;
  description?: string;
  image?: string;
  hover_image?: string;
  link_url?: string;
}

export interface TradePoint {
  id: string;
  status: string;
  name: string;
  address: string;
  hours?: string;
  day_of_week?: number;
  open_hour?: number;
  close_hour?: number;
  latitude: number;
  longitude: number;
}

// Create and configure Directus client
const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';

export const directusClient = createDirectus<DirectusSchema>(directusUrl)
  .with(rest())
  .with(authentication());

// Helper function to authenticate with static token (if provided)
export async function authenticateDirectus() {
  const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
  const email = process.env.DIRECTUS_ADMIN_EMAIL;
  const password = process.env.DIRECTUS_ADMIN_PASSWORD;

  try {
    if (staticToken) {
      // Use static token if available
      await directusClient.setToken(staticToken);
      console.log('✓ Directus authenticated with static token');
    } else if (email && password) {
      // Login with credentials
      await directusClient.login(email, password);
      console.log('✓ Directus authenticated with credentials');
    } else {
      console.log('ℹ Directus client created (no authentication)');
    }
  } catch (error) {
    console.error('✗ Directus authentication failed:', error);
  }
}

// Export a ready-to-use client
export default directusClient;

