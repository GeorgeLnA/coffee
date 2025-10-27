import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
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
  // visibility toggles
  hide_season?: boolean | null;
  hide_video?: boolean | null;
  hide_about?: boolean | null;
  hide_cafes?: boolean | null;
  hide_news?: boolean | null;
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
  // visibility toggles
  hide_supply?: boolean | null;
  hide_discounts?: boolean | null;
  hide_benefits?: boolean | null;
  hide_cta?: boolean | null;
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
  // visibility toggles
  hide_contact_info?: boolean | null;
  hide_trade_points?: boolean | null;
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

// ===== Custom Page Sections =====
export interface DBPageSection {
  id: number;
  created_at: string;
  page: 'home' | 'office' | 'contact';
  anchor_key: string;
  sort: number | null;
  active: boolean | null;
  title_ua: string | null;
  title_ru: string | null;
  body_ua: string | null;
  body_ru: string | null;
  media_url: string | null;
  media_type: 'none' | 'image' | 'video' | null;
  button_text_ua: string | null;
  button_text_ru: string | null;
  button_url: string | null;
  bg_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  layout: 'text-left' | 'text-right' | 'center' | null;
  full_width: boolean | null;
}

export function usePageSections(page: 'home' | 'office' | 'contact') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`page-sections-${page}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_sections', filter: `page=eq.${page}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['page-sections', page] }); } catch {}
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [page, queryClient]);

  return useQuery({
    queryKey: ['page-sections', page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page', page)
        .order('anchor_key', { ascending: true, nullsFirst: true })
        .order('sort', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data || []) as DBPageSection[];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
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
  image_url: string | null;
  special: boolean | null;
}

export interface DBCoffeeProduct {
  id: number;
  slug: string | null;
  sort: number | null;
  name_ua: string;
  name_ru: string;
  description_ua: string | null;
  description_ru: string | null;
  image_url: string | null;
  origin: string | null;
  roast: string | null; // 'light' | 'medium' | 'dark'
  in_stock: boolean | null;
  custom_label: string | null;
  custom_label_ru: string | null;
  custom_label_color: string | null;
  custom_label_text_color: string | null;
  active: boolean | null;
  flavor_notes_array: string[] | null;
  aftertaste_ua?: string[] | null;
  aftertaste_ru?: string[] | null;
  metric_label_strength?: string | null;
  metric_label_acidity?: string | null;
  metric_label_roast?: string | null;
  metric_label_body?: string | null;
  strength_level?: number | null;
  acidity_level?: number | null;
  roast_level?: number | null;
  body_level?: number | null;
  label_data?: any | null;
  label_image_url?: string | null;
  seo_keywords_ua?: string[] | null;
  seo_keywords_ru?: string[] | null;
  coffee_sizes?: DBCoffeeSize[];
}

function mapLevelToString(level: number | null | undefined, low: string, medium: string, high: string): string {
  if (!level) return medium;
  if (level <= 2) return low;
  if (level >= 4) return high;
  return medium;
}

export function useCoffeeProducts() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Realtime updates for coffee products and sizes
  useEffect(() => {
    const channel = supabase
      .channel('coffee-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_products' }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_sizes' }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['coffee-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_products')
        .select('*, coffee_sizes(*)')
        .order('sort', { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data as DBCoffeeProduct[] | null) || [];
      const mappedData = list.map((p) => {
        const sizes = (p.coffee_sizes || []).filter(s => s.price != null);
        const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : 0;
        const name = language === 'ru' ? (p.name_ru || p.name_ua || '') : (p.name_ua || p.name_ru || '');
        const description = language === 'ru' ? (p.description_ru || p.description_ua || '') : (p.description_ua || p.description_ru || '');
        // Choose aftertaste by language, fallback to flavor_notes_array
        const flavorNotes = language === 'ru'
          ? (Array.isArray(p.aftertaste_ru) ? p.aftertaste_ru : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []))
          : (Array.isArray(p.aftertaste_ua) ? p.aftertaste_ua : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []));
        const acidity = mapLevelToString(p.acidity_level, 'low', 'medium', 'high');
        const body = mapLevelToString(p.body_level, 'light', 'medium', 'full');
        const mappedProduct = {
          id: String(p.id),
          slug: p.slug || String(p.id),
          name,
          origin: p.origin || '',
          roast: p.roast || 'medium',
          price: minPrice,
          image: p.image_url || '/250-g_Original.PNG',
          description,
          weight: sizes.length ? Math.min(...sizes.map(s => s.weight || 0)) : 250,
          flavorNotes,
          acidity,
          body,
          process: '',
          elevation: 0,
          inStock: !!p.in_stock,
          active: p.active !== false, // Default to true if not explicitly set to false
          custom_label: p.custom_label || null,
          custom_label_ru: p.custom_label_ru || null,
          custom_label_color: p.custom_label_color || '#f59e0b',
          custom_label_text_color: p.custom_label_text_color || '#92400e',
          // Expose numeric metrics and label data for custom labels
          strength_level: p.strength_level || 0,
          acidity_level: p.acidity_level || 0,
          roast_level: p.roast_level || 0,
          body_level: p.body_level || 0,
          label_data: p.label_data || null,
          label_image_url: p.label_image_url || null,
          seo_keywords_ua: p.seo_keywords_ua || null,
          seo_keywords_ru: p.seo_keywords_ru || null,
        };
        return mappedProduct;
      });
      return mappedData;
    },
    // Refetch behaviours to feel "live"
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    queryKey: ['coffee-products', language], // Add language to query key so it refetches when language changes
  });
}

export function useCoffeeProduct(id: string | number) {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Realtime updates for a single product
  useEffect(() => {
    const channel = supabase
      .channel(`coffee-product-${id}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_products', filter: `id=eq.${Number(id)}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-product', id] }); } catch {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_sizes', filter: `product_id=eq.${Number(id)}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-product', id] }); } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [id, queryClient]);

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
        slug: p.slug || String(p.id),
        name: language === 'ru' ? (p.name_ru || p.name_ua || '') : (p.name_ua || p.name_ru || ''),
        origin: p.origin || '',
        roast: p.roast || 'medium',
        price: minPrice,
        image: p.image_url || '/250-g_Original.PNG',
        description: language === 'ru' ? (p.description_ru || p.description_ua || '') : (p.description_ua || p.description_ru || ''),
        weight: sizes.length ? Math.min(...sizes.map(s => s.weight || 0)) : 250,
        // Choose aftertaste by language, fallback to flavor_notes_array
        flavorNotes: language === 'ru'
          ? (Array.isArray(p.aftertaste_ru) ? p.aftertaste_ru : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []))
          : (Array.isArray(p.aftertaste_ua) ? p.aftertaste_ua : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : [])),
        acidity: mapLevelToString(p.acidity_level, 'low', 'medium', 'high'),
        body: mapLevelToString(p.body_level, 'light', 'medium', 'full'),
        process: '',
        elevation: 0,
        inStock: !!p.in_stock,
        active: p.active !== false,
        custom_label: p.custom_label || null,
        custom_label_ru: p.custom_label_ru || null,
        custom_label_color: p.custom_label_color || '#f59e0b',
        custom_label_text_color: p.custom_label_text_color || '#92400e',
        sizes,
        strength_level: p.strength_level || 0,
        acidity_level: p.acidity_level || 0,
        roast_level: p.roast_level || 0,
        body_level: p.body_level || 0,
        label_data: p.label_data || null,
        label_image_url: p.label_image_url || null,
        seo_keywords_ua: (p as any).seo_keywords_ua || null,
        seo_keywords_ru: (p as any).seo_keywords_ru || null,
      };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    queryKey: ['coffee-product', id, language], // Add language to query key so it refetches when language changes
  });
}

// Water types from Supabase
export interface DBWaterSize {
  id: number;
  product_id: number;
  sort: number | null;
  enabled: boolean | null;
  label_ua: string | null;
  label_ru: string | null;
  volume: string | null;
  price: number | null;
  image_url: string | null;
}

export interface DBWaterProduct {
  id: number;
  sort: number | null;
  name_ua: string;
  name_ru: string;
  description_ua: string | null;
  description_ru: string | null;
  image_url: string | null;
  volume: string | null;
  price: number | null;
  active: boolean | null;
  features_ua: string[] | null;
  features_ru: string[] | null;
  water_sizes?: DBWaterSize[];
}

export function useWaterProducts() {
  const queryClient = useQueryClient();

  // Realtime updates for water products and sizes
  useEffect(() => {
    const channel = supabase
      .channel('water_products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'water_products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-products'] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_sizes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['water-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_products')
        .select('*, water_sizes(*)')
        .order('sort', { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data as DBWaterProduct[] | null) || [];
      const mappedData = list.map((p) => {
        const name = p.name_ua || p.name_ru || '';
        const description = p.description_ua || p.description_ru || '';
        const features = Array.isArray(p.features_ua) ? p.features_ua : [];
        const mappedProduct = {
          id: String(p.id),
          name,
          description,
          image: p.image_url || '/dreamstime_xl_12522351.jpg',
          price: p.price || 0,
          volume: p.volume || '',
          active: p.active !== false,
          features,
        };
        return mappedProduct;
      });
      return mappedData;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

export function useWaterProduct(id: string | number) {
  const queryClient = useQueryClient();

  // Realtime updates for a single product
  useEffect(() => {
    const channel = supabase
      .channel('water_product_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_products', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-product', id] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_sizes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-product', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, id]);

  return useQuery({
    queryKey: ['water-product', id],
    queryFn: async () => {
      const idNum = Number(id);
      let p: DBWaterProduct | null = null;
      if (!Number.isNaN(idNum) && idNum > 0) {
        const { data, error } = await supabase
          .from('water_products')
          .select('*, water_sizes(*)')
          .eq('id', idNum)
          .single();
        if (!error && data) p = data as DBWaterProduct;
      }
      if (!p && typeof id === 'string') {
        const { data } = await supabase
          .from('water_products')
          .select('*, water_sizes(*)')
          .eq('slug', id as string)
          .maybeSingle();
        if (data) p = data as DBWaterProduct;
      }
      if (!p) return null as any;
      return {
        id: String(p.id),
        name: p.name_ua || p.name_ru || '',
        description: p.description_ua || p.description_ru || '',
        image: p.image_url || '/dreamstime_xl_12522351.jpg',
        price: p.price || 0,
        volume: p.volume || '',
        active: p.active !== false,
        features: Array.isArray(p.features_ua) ? p.features_ua : [],
      };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

export function useFilterOptions(language: string = 'ua') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`filter-options-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'filter_options' }, () => {
        try {
          queryClient.invalidateQueries({ queryKey: ['filter-options'] });
          queryClient.invalidateQueries({ queryKey: ['filter-options', language] });
        } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [queryClient, language]);

  return useQuery({
    queryKey: ['filter-options', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('filter_options')
        .select('*')
        .eq('active', true)
        .order('filter_type', { ascending: true })
        .order('sort', { ascending: true, nullsFirst: true });

      if (error) {
        console.error('Error fetching filter options:', error);
        return { origins: [], roasts: [], originPairs: [], roastPairs: [] } as {
          origins: string[];
          roasts: string[];
          originPairs: { ua: string; ru: string }[];
          roastPairs: { ua: string; ru: string }[];
        };
      }

      // Use value_ru for Russian, value for Ukrainian/English
      const all = (data || []) as Array<{ filter_type: string; value: string; value_ru?: string | null }>;
      const origins = all
        .filter(f => f.filter_type === 'origin')
        .map(f => language === 'ru' ? (f.value_ru || f.value) : f.value);
      
      const roasts = all
        .filter(f => f.filter_type === 'roast')
        .map(f => language === 'ru' ? (f.value_ru || f.value) : f.value);

      const originPairs = all
        .filter(f => f.filter_type === 'origin')
        .map(f => ({ ua: f.value, ru: f.value_ru || f.value }));

      const roastPairs = all
        .filter(f => f.filter_type === 'roast')
        .map(f => ({ ua: f.value, ru: f.value_ru || f.value }));

      return { origins, roasts, originPairs, roastPairs };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}
