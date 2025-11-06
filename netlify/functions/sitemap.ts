import { Handler } from '@netlify/functions';

// Inline sitemap content to ensure it's served with correct content-type
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>https://manifestcoffee.com.ua/</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/?lang=ru" />
  </url>
  
  <!-- Coffee Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/coffee</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/coffee?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/coffee?lang=ru" />
  </url>
  
  <!-- News/Blog Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/news</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/news?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/news?lang=ru" />
  </url>
  
  <!-- Water Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/water</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/water?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/water?lang=ru" />
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/contact</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/contact?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/contact?lang=ru" />
  </url>
  
  <!-- Office Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/office</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/office?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/office?lang=ru" />
  </url>
  
  <!-- Delivery Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/delivery</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/delivery?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/delivery?lang=ru" />
  </url>
  
  <!-- Terms Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/terms</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/terms?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/terms?lang=ru" />
  </url>
  
  <!-- Returns Page -->
  <url>
    <loc>https://manifestcoffee.com.ua/returns</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://manifestcoffee.com.ua/returns?lang=uk" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://manifestcoffee.com.ua/returns?lang=ru" />
  </url>
  
</urlset>`;

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
    body: sitemapContent,
  };
};
