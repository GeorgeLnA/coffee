import dotenv from "dotenv";

// Load .env.local explicitly (higher priority), then .env
dotenv.config({ path: ".env.local" });
dotenv.config(); // Load .env as fallback

// Debug: Check if EmailJS env vars are loaded
console.log("=== SERVER STARTUP - EMAILJS ENV CHECK ===");
console.log("EMAILJS_SERVICE_ID:", process.env.EMAILJS_SERVICE_ID ? `${process.env.EMAILJS_SERVICE_ID.substring(0, 8)}...` : "NOT SET");
console.log("EMAILJS_TEMPLATE_ID_CUSTOMER:", process.env.EMAILJS_TEMPLATE_ID_CUSTOMER || "NOT SET");
console.log("EMAILJS_TEMPLATE_ID_ADMIN:", process.env.EMAILJS_TEMPLATE_ID_ADMIN || "NOT SET");
console.log("EMAILJS_PUBLIC_KEY:", process.env.EMAILJS_PUBLIC_KEY ? `${process.env.EMAILJS_PUBLIC_KEY.substring(0, 4)}...` : "NOT SET");
console.log("ADMIN_EMAILS:", process.env.ADMIN_EMAILS || "NOT SET");
console.log("=== END ENV CHECK ===");

import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLiqPaySignature } from "./routes/liqpay";
import { prepareOrder } from "./routes/orders.ts";
import { getWarehouses, searchSettlements } from "./routes/nova-poshta";
import { testEmail } from "./routes/test-email";

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

  app.get("/api/env-check", (_req, res) => {
    res.json({
      hasLiqPayPublic: !!process.env.LIQPAY_PUBLIC_KEY,
      hasLiqPayPrivate: !!process.env.LIQPAY_PRIVATE_KEY,
      hasNovaPoshta: !!process.env.NOVA_POSHTA_API_KEY,
      hasGoogleMaps: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
      publicKeyLength: process.env.LIQPAY_PUBLIC_KEY?.length || 0,
      privateKeyLength: process.env.LIQPAY_PRIVATE_KEY?.length || 0,
      // EmailJS
      hasEmailJS: {
        serviceId: !!process.env.EMAILJS_SERVICE_ID,
        customerTemplate: !!process.env.EMAILJS_TEMPLATE_ID_CUSTOMER,
        adminTemplate: !!process.env.EMAILJS_TEMPLATE_ID_ADMIN,
        publicKey: !!process.env.EMAILJS_PUBLIC_KEY,
        adminEmails: !!process.env.ADMIN_EMAILS,
      },
      emailJSValues: {
        serviceId: process.env.EMAILJS_SERVICE_ID || "NOT SET",
        customerTemplate: process.env.EMAILJS_TEMPLATE_ID_CUSTOMER || "NOT SET",
        adminTemplate: process.env.EMAILJS_TEMPLATE_ID_ADMIN || "NOT SET",
        publicKey: process.env.EMAILJS_PUBLIC_KEY ? `${process.env.EMAILJS_PUBLIC_KEY.substring(0, 4)}...` : "NOT SET",
        adminEmails: process.env.ADMIN_EMAILS || "NOT SET",
      },
    });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/liqpay-signature", handleLiqPaySignature);
  app.post("/api/orders/prepare", prepareOrder);
  app.get("/api/warehouses", getWarehouses);
  app.get("/api/settlements", searchSettlements);
  app.post("/api/test-email", testEmail);

  return app;
}
