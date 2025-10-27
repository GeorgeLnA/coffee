import { RequestHandler } from "express";
import crypto from "crypto";
import { LiqPayConfig, LiqPayCheckoutInit } from "@shared/api";

// Create signature for LiqPay
function createSignature(data: string, privateKey: string): string {
  const sha1 = crypto.createHash('sha1');
  sha1.update(privateKey + data + privateKey);
  return sha1.digest('base64');
}

export const handleLiqPaySignature: RequestHandler = (req, res) => {
  try {
    const { data } = req.body as { data: string };
    
    if (!data) {
      return res.status(400).json({ error: "Missing data parameter" });
    }

    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      console.warn("LIQPAY_PRIVATE_KEY not configured");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const signature = createSignature(data, privateKey);

    res.json({ signature });
  } catch (error: any) {
    console.error("Error generating LiqPay signature:", error);
    res.status(500).json({ error: error.message || "Failed to generate signature" });
  }
};

