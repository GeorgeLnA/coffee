import type { Handler } from "@netlify/functions";
import crypto from "crypto";

/**
 * Helper function to base64 encode
 */
function base64(str: string): string {
  return Buffer.from(str).toString("base64");
}

/**
 * Helper function to create LiqPay signature
 */
function sign(data: string, privateKey: string): string {
  return crypto.createHash("sha1").update(privateKey + data + privateKey).digest("base64");
}

/**
 * Netlify serverless function to prepare order with LiqPay payment data
 * 
 * POST /api/orders/prepare
 * Body: { customer, shipping, payment, items, notes }
 * 
 * Returns: { data, signature, orderId, paymentMethod }
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
    const { customer, shipping, payment, items, notes } = body;

    // Debug logging
    console.log("prepareOrder received:", {
      hasCustomer: !!customer,
      hasItems: !!items,
      itemsIsArray: Array.isArray(items),
      itemsLength: items?.length,
      customerKeys: customer ? Object.keys(customer) : [],
    });

    // Validation
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      console.log("Validation failed:", {
        customer: !!customer,
        items: !!items,
        isArray: Array.isArray(items),
        length: items?.length,
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid order payload" }),
      };
    }

    const paymentMethod = payment?.method || "liqpay";

    // For cash payments, we don't need LiqPay - just create order and return success
    if (paymentMethod === "cash") {
      // TODO: Save order to database here
      // For now, just return success response
      const orderId = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: true,
          orderId,
          paymentMethod: "cash",
          message: "Order created successfully. Payment will be collected upon delivery.",
        }),
      };
    }

    // For online payments, prepare LiqPay payment
    const publicKey =
      process.env.LIQPAY_PUBLIC_KEY || process.env.VITE_LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;

    // Debug logging
    console.log("LiqPay Keys Check:", {
      hasPublicKey: !!publicKey,
      hasPrivateKey: !!privateKey,
      publicKeyLength: publicKey?.length,
      privateKeyLength: privateKey?.length,
    });

    if (!publicKey || !privateKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "LiqPay keys are not configured" }),
      };
    }

    const orderId = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const description = items
      .map(
        (it: any) =>
          `${it.name}${it.variant ? ` (${it.variant})` : ""} x${it.quantity}`
      )
      .join(", ");
    const amount = Number(
      (
        items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0) +
        (shipping?.price || 0)
      ).toFixed(2)
    );

    // Determine paytypes based on payment method
    let paytypes = "card";
    if (paymentMethod === "apple_pay") {
      paytypes = "applepay";
    } else if (paymentMethod === "google_pay") {
      paytypes = "googlepay";
    }

    // Get the origin/host from the request
    const host = event.headers["host"] || event.headers["x-forwarded-host"] || "localhost";
    const protocol = event.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${protocol}://${host}`;

    const params = {
      version: 3,
      public_key: publicKey,
      action: "pay",
      amount,
      currency: "UAH",
      description: `Замовлення ${orderId} — THE COFFEE MANIFEST`,
      order_id: orderId,
      result_url: `${baseUrl}/basket?payment=return`,
      server_url: `${baseUrl}/.netlify/functions/liqpay-callback`,
      language: "uk",
      paytypes,
      sandbox: process.env.VITE_LIQPAY_SANDBOX === "true" ? 1 : undefined,
      info: description,
    } as Record<string, any>;

    // Remove undefined values
    Object.keys(params).forEach(
      (k) => params[k] === undefined && delete params[k]
    );

    const data = base64(JSON.stringify(params));
    const signature = sign(data, privateKey);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ data, signature, orderId, paymentMethod }),
    };
  } catch (err: any) {
    console.error("prepareOrder error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err?.message || "Failed to prepare order",
      }),
    };
  }
};

