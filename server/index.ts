import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLiqPaySignature } from "./routes/liqpay";
import { prepareOrder } from "./routes/orders.ts";
import { getWarehouses, searchSettlements } from "./routes/nova-poshta";

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
    });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/liqpay-signature", handleLiqPaySignature);
  app.post("/api/orders/prepare", prepareOrder);
  app.get("/api/warehouses", getWarehouses);
  app.get("/api/settlements", searchSettlements);

  return app;
}
