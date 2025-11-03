import type { Handler } from "@netlify/functions";
import crypto from "crypto";

// LiqPay callback data type
type LiqPayStatus =
  | "success"
  | "wait_accept"
  | "sandbox"
  | "failure"
  | "error"
  | "reversed"
  | "subscribed"
  | "unsubscribed"
  | "processing";

interface LiqPayCallbackData {
  status: LiqPayStatus;
  order_id: string;
  transaction_id?: number;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Helper function to verify LiqPay callback signature
 */
function verifySignature(data: string, signature: string, privateKey: string): boolean {
  const sha1 = crypto.createHash("sha1");
  sha1.update(privateKey + data + privateKey);
  const expectedSignature = sha1.digest("base64");
  return expectedSignature === signature;
}

/**
 * Netlify serverless function to handle LiqPay payment callbacks
 * 
 * POST /.netlify/functions/liqpay-callback
 * Body: Form data with 'data' and 'signature' fields
 * 
 * This endpoint is called by LiqPay to notify about payment status changes
 */
export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get private key from environment variables
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;

    if (!privateKey) {
      console.error("LIQPAY_PRIVATE_KEY not configured");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Payment gateway not configured" }),
      };
    }

    // LiqPay sends callback as form data (application/x-www-form-urlencoded)
    let data = "";
    let signature = "";

    if (event.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
      // Parse URL-encoded form data
      const params = new URLSearchParams(event.body || "");
      data = params.get("data") || "";
      signature = params.get("signature") || "";
    } else {
      // Try to parse as JSON (fallback)
      const body = JSON.parse(event.body || "{}");
      data = body.data || "";
      signature = body.signature || "";
    }

    if (!data || !signature) {
      console.error("Missing data or signature in callback");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing data or signature" }),
      };
    }

    // Verify signature
    if (!verifySignature(data, signature, privateKey)) {
      console.error("Invalid signature in callback");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    // Decode base64 data
    const decodedData = Buffer.from(data, "base64").toString("utf-8");
    const callbackData: LiqPayCallbackData = JSON.parse(decodedData);

    console.log("LiqPay callback received:", {
      status: callbackData.status,
      order_id: callbackData.order_id,
      transaction_id: callbackData.transaction_id,
      amount: callbackData.amount,
    });

    // TODO: Update order status in database based on callbackData.status
    // Example:
    // - status: "success" -> mark order as paid
    // - status: "failure" -> mark order as failed
    // - status: "wait_accept" -> mark order as pending
    // - etc.

    // Process the callback based on status
    switch (callbackData.status) {
      case "success":
      case "sandbox":
        // Payment successful - update order in database
        // await updateOrderStatus(callbackData.order_id, "paid");
        console.log(`Order ${callbackData.order_id} payment successful`);
        break;
      case "failure":
      case "error":
        // Payment failed - update order in database
        // await updateOrderStatus(callbackData.order_id, "failed");
        console.log(`Order ${callbackData.order_id} payment failed`);
        break;
      case "wait_accept":
        // Payment is being processed
        // await updateOrderStatus(callbackData.order_id, "pending");
        console.log(`Order ${callbackData.order_id} payment pending`);
        break;
      default:
        console.log(`Order ${callbackData.order_id} status: ${callbackData.status}`);
    }

    // Return success to LiqPay (they expect a specific response)
    // LiqPay expects HTTP 200 with response format: {"status": "ok"} or just 200 OK
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "ok" }),
    };
  } catch (error: any) {
    console.error("Error processing LiqPay callback:", error);
    // Still return 200 to LiqPay to prevent retries, but log the error
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "error", message: error.message }),
    };
  }
};

