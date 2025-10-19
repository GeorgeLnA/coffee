import { useQuery } from '@tanstack/react-query';
import type { 
  DirectusResponse, 
  Post, 
  Page, 
  Global, 
  Navigation,
  HomepageSettings,
  FeaturedProduct,
  TradePoint
} from '@shared/directus';

const API_BASE = '/api/cms';

// Generic fetch function
async function fetchFromDirectus<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  
  const result: DirectusResponse<T> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch data');
  }
  
  return result.data;
}

// Hook to fetch all posts
export function usePosts(limit?: number) {
  return useQuery({
    queryKey: ['posts', limit],
    queryFn: () => fetchFromDirectus<Post[]>(`/posts${limit ? `?limit=${limit}` : ''}`),
  });
}

// Hook to fetch single post by slug
export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchFromDirectus<Post>(`/posts/${slug}`),
    enabled: !!slug,
  });
}

// Hook to fetch all pages
export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: () => fetchFromDirectus<Page[]>('/pages'),
  });
}

// Hook to fetch single page by slug
export function usePage(slug: string) {
  return useQuery({
    queryKey: ['page', slug],
    queryFn: () => fetchFromDirectus<Page>(`/pages/${slug}`),
    enabled: !!slug,
  });
}

// Hook to fetch global settings
export function useGlobals() {
  return useQuery({
    queryKey: ['globals'],
    queryFn: () => fetchFromDirectus<Global>('/globals'),
  });
}

// Hook to fetch navigation
export function useNavigation() {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: () => fetchFromDirectus<Navigation[]>('/navigation'),
  });
}

// Hook to fetch homepage settings
export function useHomepageSettings() {
  return useQuery({
    queryKey: ['homepage-settings'],
    queryFn: () => fetchFromDirectus<HomepageSettings>('/homepage'),
  });
}

// Hook to fetch featured products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => fetchFromDirectus<FeaturedProduct[]>('/featured-products'),
  });
}

// Hook to fetch trade points
export function useTradePoints() {
  return useQuery({
    queryKey: ['trade-points'],
    queryFn: () => fetchFromDirectus<TradePoint[]>('/trade-points'),
  });
}

