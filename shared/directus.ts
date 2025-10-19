// Shared Directus types for client and server

export interface DirectusResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export interface NavigationItem {
  id: string;
  title: string;
  url?: string;
  page?: string;
  target?: string;
  sort?: number;
}

export interface Navigation {
  id: string;
  name: string;
  items?: NavigationItem[];
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

