import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface HomepageSettings {
  id: number;
  // Legacy fields (keep for backward compatibility)
  hero_title_line1?: string | null;
  hero_title_line2?: string | null;
  hero_title_line3?: string | null;
  hero_cta_text?: string | null;
  season_title?: string | null;
  hero_video?: string | null;

  // i18n and media fields
  hero_cta_text_ua?: string | null;
  hero_cta_text_ru?: string | null;
  hero_cta_link?: string | null;
  hero_video_url?: string | null;
  season_title_ua?: string | null;
  season_title_ru?: string | null;
  video_url?: string | null;
  about_image_url?: string | null;
}

export interface FeaturedSlide {
  id: number;
  sort: number | null;
  status: string | null;
  title_ua: string;
  description_ua: string | null;
  title_ru: string;
  description_ru: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  link_url: string | null;
}

export interface OfficeSettings {
  id: number;
  hero_title_ua: string | null;
  hero_title_ru: string | null;
  hero_subtitle_ua: string | null;
  hero_subtitle_ru: string | null;

  supply_title_ua: string | null;
  supply_title_ru: string | null;
  supply_subtitle_ua: string | null;
  supply_subtitle_ru: string | null;

  supply_coffee_title_ua: string | null;
  supply_coffee_title_ru: string | null;
  supply_coffee_desc_ua: string | null;
  supply_coffee_desc_ru: string | null;
  supply_coffee_point1_ua: string | null;
  supply_coffee_point1_ru: string | null;
  supply_coffee_point2_ua: string | null;
  supply_coffee_point2_ru: string | null;
  supply_coffee_point3_ua: string | null;
  supply_coffee_point3_ru: string | null;

  supply_machines_title_ua: string | null;
  supply_machines_title_ru: string | null;
  supply_machines_desc_ua: string | null;
  supply_machines_desc_ru: string | null;
  supply_machines_point1_ua: string | null;
  supply_machines_point1_ru: string | null;
  supply_machines_point2_ua: string | null;
  supply_machines_point2_ru: string | null;
  supply_machines_point3_ua: string | null;
  supply_machines_point3_ru: string | null;

  supply_water_title_ua: string | null;
  supply_water_title_ru: string | null;
  supply_water_desc_ua: string | null;
  supply_water_desc_ru: string | null;
  supply_water_point1_ua: string | null;
  supply_water_point1_ru: string | null;
  supply_water_point2_ua: string | null;
  supply_water_point2_ru: string | null;

  supply_cups_title_ua: string | null;
  supply_cups_title_ru: string | null;
  supply_cups_desc_ua: string | null;
  supply_cups_desc_ru: string | null;
  supply_cups_point1_ua: string | null;
  supply_cups_point1_ru: string | null;
  supply_cups_point2_ua: string | null;
  supply_cups_point2_ru: string | null;

  discounts_badge_ua: string | null;
  discounts_badge_ru: string | null;
  discounts_title_ua: string | null;
  discounts_title_ru: string | null;
  discounts_desc_ua: string | null;
  discounts_desc_ru: string | null;
  tier1_title_ua: string | null;
  tier1_title_ru: string | null;
  tier1_desc_ua: string | null;
  tier1_desc_ru: string | null;
  tier2_title_ua: string | null;
  tier2_title_ru: string | null;
  tier2_desc_ua: string | null;
  tier2_desc_ru: string | null;
  tier3_title_ua: string | null;
  tier3_title_ru: string | null;
  tier3_desc_ua: string | null;
  tier3_desc_ru: string | null;
  combos_title_ua: string | null;
  combos_title_ru: string | null;
  combos_point1_ua: string | null;
  combos_point1_ru: string | null;
  combos_point2_ua: string | null;
  combos_point2_ru: string | null;

  benefits_delivery_title_ua: string | null;
  benefits_delivery_title_ru: string | null;
  benefits_delivery_desc_ua: string | null;
  benefits_delivery_desc_ru: string | null;
  benefits_schedule_title_ua: string | null;
  benefits_schedule_title_ru: string | null;
  benefits_schedule_desc_ua: string | null;
  benefits_schedule_desc_ru: string | null;
  benefits_support_title_ua: string | null;
  benefits_support_title_ru: string | null;
  benefits_support_desc_ua: string | null;
  benefits_support_desc_ru: string | null;

  cta_title_ua: string | null;
  cta_title_ru: string | null;
  cta_subtitle_ua: string | null;
  cta_subtitle_ru: string | null;
  cta_call_text_ua: string | null;
  cta_call_text_ru: string | null;
  cta_email_text_ua: string | null;
  cta_email_text_ru: string | null;
  cta_phone: string | null;
  cta_email: string | null;
}

export function useOfficeSettings() {
  return useQuery({
    queryKey: ['office-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as OfficeSettings | null;
    },
  });
}

export interface ContactSettings {
  id: number;
  title_ua: string | null;
  title_ru: string | null;
  phone_title_ua: string | null;
  phone_title_ru: string | null;
  phone1: string | null;
  phone2: string | null;
  phone_desc_ua: string | null;
  phone_desc_ru: string | null;
  email_title_ua: string | null;
  email_title_ru: string | null;
  email1: string | null;
  email2: string | null;
  email_desc_ua: string | null;
  email_desc_ru: string | null;
  hours_title_ua: string | null;
  hours_title_ru: string | null;
  hours_details_ua: string | null;
  hours_details_ru: string | null;
  hours_desc_ua: string | null;
  hours_desc_ru: string | null;
  trading_title_ua: string | null;
  trading_title_ru: string | null;
  trading_desc_ua: string | null;
  trading_desc_ru: string | null;
}

export interface ContactPoint {
  id: number;
  sort: number | null;
  name_ua: string | null;
  name_ru: string | null;
  address: string | null;
  hours_ua: string | null;
  hours_ru: string | null;
}

export function useContactSettings() {
  return useQuery({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as ContactSettings | null;
    },
  });
}

export function useContactPoints() {
  return useQuery({
    queryKey: ['contact-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_trade_points')
        .select('*')
        .order('sort', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data || []) as ContactPoint[];
    },
  });
}

// Hook to fetch homepage settings from Supabase
export function useHomepageSettings() {
  return useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as HomepageSettings | null;
    },
  });
}

// Hook to fetch featured slides from Supabase
export function useFeaturedSlides() {
  return useQuery({
    queryKey: ['featured-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .order('sort', { ascending: true, nullsFirst: true })
        .limit(3);
      if (error) throw error;
      return (data || []) as FeaturedSlide[];
    },
  });
}

// Coffee types from Supabase
export interface DBCoffeeSize {
  id: number;
  product_id: number;
  sort: number | null;
  enabled: boolean | null;
  label_ua: string | null;
  label_ru: string | null;
  weight: number | null;
  price: number | null;
}

export interface DBCoffeeProduct {
  id: number;
  slug: string | null;
  name_ua: string;
  name_ru: string;
  description_ua: string | null;
  description_ru: string | null;
  image_url: string | null;
  origin: string | null;
  roast: string | null; // 'light' | 'medium' | 'dark'
  in_stock: boolean | null;
  featured: boolean | null;
  active: boolean | null;
  metric_label_strength?: string | null;
  metric_label_acidity?: string | null;
  metric_label_roast?: string | null;
  metric_label_body?: string | null;
  strength_level?: number | null;
  acidity_level?: number | null;
  roast_level?: number | null;
  body_level?: number | null;
  coffee_sizes?: DBCoffeeSize[];
}

function mapLevelToString(level: number | null | undefined, low: string, medium: string, high: string): string {
  if (!level) return medium;
  if (level <= 2) return low;
  if (level >= 4) return high;
  return medium;
}

export function useCoffeeProducts() {
  return useQuery({
    queryKey: ['coffee-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_products')
        .select('*, coffee_sizes(*)')
        .order('id', { ascending: true });
      if (error) throw error;
      const list = (data as DBCoffeeProduct[] | null) || [];
      return list.map((p) => {
        const sizes = (p.coffee_sizes || []).filter(s => s.price != null);
        const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : 0;
        const name = p.name_ua || p.name_ru || '';
        const description = p.description_ua || p.description_ru || '';
        const acidity = mapLevelToString(p.acidity_level, 'low', 'medium', 'high');
        const body = mapLevelToString(p.body_level, 'light', 'medium', 'full');
        return {
          id: String(p.id),
          name,
          origin: p.origin || '',
          roast: p.roast || 'medium',
          price: minPrice,
          image: p.image_url || '/250-g_Original.PNG',
          description,
          weight: 250,
          flavorNotes: [] as string[],
          acidity,
          body,
          process: '',
          elevation: 0,
          inStock: !!p.in_stock,
        };
      });
    },
  });
}

export function useCoffeeProduct(id: string | number) {
  return useQuery({
    queryKey: ['coffee-product', id],
    queryFn: async () => {
      const idNum = Number(id);
      let p: DBCoffeeProduct | null = null;
      if (!Number.isNaN(idNum) && idNum > 0) {
        const { data, error } = await supabase
          .from('coffee_products')
          .select('*, coffee_sizes(*)')
          .eq('id', idNum)
          .single();
        if (!error && data) p = data as DBCoffeeProduct;
      }
      if (!p && typeof id === 'string') {
        const { data } = await supabase
          .from('coffee_products')
          .select('*, coffee_sizes(*)')
          .eq('slug', id as string)
          .maybeSingle();
        if (data) p = data as DBCoffeeProduct;
      }
      if (!p) return null as any;
      const sizes = (p.coffee_sizes || []).filter(s => s.price != null);
      const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : 0;
      return {
        id: String(p.id),
        name: p.name_ua || p.name_ru || '',
        origin: p.origin || '',
        roast: p.roast || 'medium',
        price: minPrice,
        image: p.image_url || '/250-g_Original.PNG',
        description: p.description_ua || p.description_ru || '',
        weight: 250,
        flavorNotes: [] as string[],
        acidity: mapLevelToString(p.acidity_level, 'low', 'medium', 'high'),
        body: mapLevelToString(p.body_level, 'light', 'medium', 'full'),
        process: '',
        elevation: 0,
        inStock: !!p.in_stock,
        sizes,
        metrics: {
          strength: p.strength_level || 0,
          acidity: p.acidity_level || 0,
          roast: p.roast_level || 0,
          body: p.body_level || 0,
        }
      };
    },
  });
}
