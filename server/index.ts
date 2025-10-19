import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authenticateDirectus } from "./lib/directus";
import { getPosts, getPostBySlug } from "./routes/directus-posts";
import { getPages, getPageBySlug } from "./routes/directus-pages";
import { getGlobals, getNavigation } from "./routes/directus-globals";
import { getHomepageSettings, getFeaturedProducts, getTradePoints } from "./routes/directus-homepage";

// Initialize Directus authentication
authenticateDirectus().catch(console.error);

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Directus CMS routes
  app.get("/api/cms/posts", getPosts);
  app.get("/api/cms/posts/:slug", getPostBySlug);
  app.get("/api/cms/pages", getPages);
  app.get("/api/cms/pages/:slug", getPageBySlug);
  app.get("/api/cms/globals", getGlobals);
  app.get("/api/cms/navigation", getNavigation);
  
  // Homepage content routes
  app.get("/api/cms/homepage", getHomepageSettings);
  app.get("/api/cms/featured-products", getFeaturedProducts);
  app.get("/api/cms/trade-points", getTradePoints);

  return app;
}
