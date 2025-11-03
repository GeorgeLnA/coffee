import type { Handler } from "@netlify/functions";
import crypto from "crypto";

/**
 * Netlify serverless function to generate LiqPay signature
 * 
 * POST /api/liqpay-signature
 * Body: { data: string } - base64 encoded payment data
 * 
 * Returns: { signature: string }
 */
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { data } = body;

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing data parameter" }),
      };
    }

    // Get private key from environment variables
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    
    if (!privateKey) {
      console.warn("LIQPAY_PRIVATE_KEY not configured");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Payment gateway not configured" }),
      };
    }

    // Create signature: SHA1(private_key + data + private_key)
    const sha1 = crypto.createHash("sha1");
    sha1.update(privateKey + data + privateKey);
    const signature = sha1.digest("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ signature }),
    };
  } catch (error: any) {
    console.error("Error generating LiqPay signature:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || "Failed to generate signature" 
      }),
    };
  }
};

