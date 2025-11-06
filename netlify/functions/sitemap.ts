import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTQsImV4cCI6MjA3NjE3NDYxNH0.UXuBlmkHgZCgoe95nTZ_PrAZU9TeoBHt9FjMw0sAFDo";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate sitemap XML with dynamic product pages
 */
async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://manifestcoffee.com.ua';
  const today = formatDate(new Date());
  const supabase = getSupabaseClient();

  // Fetch active coffee products
  let coffeeProducts: any[] = [];
  try {
    const { data: coffeeData, error: coffeeError } = await supabase
      .from('coffee_products')
      .select('id, updated_at')
      .eq('active', true);
    
    if (!coffeeError && coffeeData) {
      coffeeProducts = coffeeData;
    }
  } catch (e) {
    console.error('Error fetching coffee products:', e);
  }

  // Fetch active water products
  let waterProducts: any[] = [];
  try {
    const { data: waterData, error: waterError } = await supabase
      .from('water_products')
      .select('id, updated_at')
      .eq('active', true);
    
    if (!waterError && waterData) {
      waterProducts = waterData;
    }
  } catch (e) {
    console.error('Error fetching water products:', e);
  }

  // Build sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/?lang=ru" />
  </url>
  
  <!-- Coffee Page -->
  <url>
    <loc>${baseUrl}/coffee</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/coffee?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/coffee?lang=ru" />
  </url>
  
  <!-- Coffee Product Pages -->
${coffeeProducts.map(product => {
  const productLastmod = product.updated_at ? formatDate(new Date(product.updated_at)) : today;
  return `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${productLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/product/${product.id}?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/product/${product.id}?lang=ru" />
  </url>`;
}).join('\n')}
  
  <!-- News/Blog Page -->
  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/news?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/news?lang=ru" />
  </url>
  
  <!-- Water Page -->
  <url>
    <loc>${baseUrl}/water</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/water?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/water?lang=ru" />
  </url>
  
  <!-- Water Product Pages -->
${waterProducts.map(product => {
  const productLastmod = product.updated_at ? formatDate(new Date(product.updated_at)) : today;
  return `  <url>
    <loc>${baseUrl}/water/${product.id}</loc>
    <lastmod>${productLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/water/${product.id}?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/water/${product.id}?lang=ru" />
  </url>`;
}).join('\n')}
  
  <!-- Contact Page -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/contact?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/contact?lang=ru" />
  </url>
  
  <!-- Office Page -->
  <url>
    <loc>${baseUrl}/office</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/office?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/office?lang=ru" />
  </url>
  
  <!-- Delivery Page -->
  <url>
    <loc>${baseUrl}/delivery</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/delivery?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/delivery?lang=ru" />
  </url>
  
  <!-- Terms Page -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/terms?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/terms?lang=ru" />
  </url>
  
  <!-- Returns Page -->
  <url>
    <loc>${baseUrl}/returns</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${baseUrl}/returns?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/returns?lang=ru" />
  </url>
  
</urlset>`;

  return sitemap;
}

export const handler: Handler = async (event, context) => {
  try {
    const sitemapContent = await generateSitemap();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: sitemapContent,
    };
  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://manifestcoffee.com.ua/</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
      body: fallbackSitemap,
    };
  }
};
