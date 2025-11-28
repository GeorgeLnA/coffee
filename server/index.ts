import dotenv from "dotenv";
import { resolveEmailJSConfig, maskForLogs } from "../shared/emailjs-config";

// Load .env.local explicitly (higher priority), then .env
dotenv.config({ path: ".env.local" });
dotenv.config(); // Load .env as fallback

const startupEmailConfig = resolveEmailJSConfig();

// Debug: Check if EmailJS env vars are loaded
console.log("=== SERVER STARTUP - EMAILJS ENV CHECK ===");
console.log("EMAILJS_SERVICE_ID:", maskForLogs(startupEmailConfig.serviceId));
console.log("EMAILJS_TEMPLATE_ID_CUSTOMER:", maskForLogs(startupEmailConfig.templateIdCustomer));
console.log("EMAILJS_TEMPLATE_ID_ADMIN:", maskForLogs(startupEmailConfig.templateIdAdmin));
console.log("EMAILJS_PUBLIC_KEY:", maskForLogs(startupEmailConfig.publicKey));
console.log("EMAILJS_PRIVATE_KEY_SOURCE:", startupEmailConfig.sources.privateKey || "NOT SET");
console.log("ADMIN_EMAILS:", startupEmailConfig.adminEmails || process.env.ADMIN_EMAILS || "NOT SET");
console.log("ADMIN_EMAILS_SOURCE:", startupEmailConfig.sources.adminEmails || "NOT SET");
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
    const emailConfig = resolveEmailJSConfig();
    const adminEmailsValue =
      emailConfig.adminEmails || process.env.ADMIN_EMAILS || "NOT SET";

    res.json({
      hasLiqPayPublic: !!process.env.LIQPAY_PUBLIC_KEY,
      hasLiqPayPrivate: !!process.env.LIQPAY_PRIVATE_KEY,
      hasNovaPoshta: !!process.env.NOVA_POSHTA_API_KEY,
      hasGoogleMaps: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
      publicKeyLength: process.env.LIQPAY_PUBLIC_KEY?.length || 0,
      privateKeyLength: process.env.LIQPAY_PRIVATE_KEY?.length || 0,
      // EmailJS
      hasEmailJS: {
        serviceId: !emailConfig.missing.serviceId,
        customerTemplate: !emailConfig.missing.templateIdCustomer,
        adminTemplate: !emailConfig.missing.templateIdAdmin,
        publicKey: !emailConfig.missing.publicKey,
        adminEmails: !!emailConfig.adminEmails,
        configured: emailConfig.configured,
      },
      emailJSValues: {
        serviceId: maskForLogs(emailConfig.serviceId),
        customerTemplate: maskForLogs(emailConfig.templateIdCustomer),
        adminTemplate: maskForLogs(emailConfig.templateIdAdmin),
        publicKey: maskForLogs(emailConfig.publicKey),
        adminEmails: adminEmailsValue,
        sources: emailConfig.sources,
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
