import type { Handler } from "@netlify/functions";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTQsImV4cCI6MjA3NjE3NDYxNH0.UXuBlmkHgZCgoe95nTZ_PrAZU9TeoBHt9FjMw0sAFDo";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Helper function to save order from order data object
 */
async function saveOrderFromData(supabase: any, orderData: any, orderId: string, amount: number) {
  const { data: orderDataResult, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "completed",
      customer_name: orderData.customer?.fullName,
      customer_email: orderData.customer?.email,
      customer_phone: orderData.customer?.phone,
      shipping_address: orderData.shipping?.address || "",
      total_price: orderData.amount || amount || 0,
      currency: "UAH",
      order_id: orderId,
      notes: orderData.notes || null,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error saving order:", orderError);
    return;
  }

  if (orderDataResult && orderData.items) {
    const orderItems = orderData.items.map((item: any) => ({
      order_id: orderDataResult.id,
      product_id: item.id?.toString() || item.product_id || "unknown",
      product_name: item.name || "Unknown Product",
      product_image: item.image || item.image_url || null,
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    await supabase.from("order_items").insert(orderItems);
    console.log(`Order ${orderId} saved via fallback method`);
  }
}

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
  info?: string; // Base64-encoded order data
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

    // Verify signature - CRITICAL: This ensures the callback is actually from LiqPay
    // and not a fake request. Without signature verification, anyone could fake payment confirmations.
    if (!verifySignature(data, signature, privateKey)) {
      console.error("SECURITY: Invalid signature in callback - possible fake payment confirmation attempt");
      console.error("Callback rejected - order will NOT be saved");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    console.log("Signature verified successfully - callback is authentic from LiqPay");

    // Decode base64 data
    const decodedData = Buffer.from(data, "base64").toString("utf-8");
    const callbackData: LiqPayCallbackData = JSON.parse(decodedData);

    console.log("=== LIQPAY CALLBACK RECEIVED ===");
    console.log("LiqPay callback received:", {
      status: callbackData.status,
      order_id: callbackData.order_id,
      transaction_id: callbackData.transaction_id,
      amount: callbackData.amount,
      currency: callbackData.currency,
      hasInfo: !!callbackData.info,
      infoLength: callbackData.info?.length || 0,
      allKeys: Object.keys(callbackData),
    });
    console.log("Full callback data:", JSON.stringify(callbackData, null, 2));

    const supabase = getSupabaseClient();

    // IMPORTANT: Only save order if payment status is confirmed successful
    // LiqPay status meanings:
    // - "success" = Payment completed successfully in production
    // - "sandbox" = Payment completed successfully in test mode
    // - "wait_accept" = Payment is being processed (not yet confirmed)
    // - "failure" = Payment failed
    // - "error" = Payment error occurred
    // - "processing" = Payment is still processing
    
    // We ONLY save orders when status is "success" or "sandbox" (confirmed payment)
    const isPaymentConfirmed = callbackData.status === "success" || callbackData.status === "sandbox";
    
    console.log(`Payment verification for order ${callbackData.order_id}:`, {
      status: callbackData.status,
      isPaymentConfirmed,
      transactionId: callbackData.transaction_id,
      amount: callbackData.amount,
    });

    if (isPaymentConfirmed) {
      // Check if order already exists
      const { data: existingOrder, error: existingOrderError } = await supabase
        .from("orders")
        .select("id")
        .eq("order_id", callbackData.order_id)
        .single();

      if (existingOrder && !existingOrderError) {
        // Order already exists, just update status
        console.log(`Order ${callbackData.order_id} already exists, updating status`);
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("order_id", callbackData.order_id);

        if (updateError) {
          console.error("Error updating order status:", updateError);
        } else {
          console.log(`Order ${callbackData.order_id} status updated to completed`);
        }
      } else {
        // Order doesn't exist - try to get order data from pending_orders table
        console.log("Attempting to retrieve order from pending_orders:", callbackData.order_id);
        
        let orderData: any = null;
        let pendingOrder: any = null;
        
        // Try pending_orders table first (if table exists)
        try {
          const { data: pendingOrderData, error: pendingError } = await supabase
            .from("pending_orders")
            .select("*")
            .eq("order_id", callbackData.order_id)
            .single();

          if (!pendingError && pendingOrderData) {
            pendingOrder = pendingOrderData;
            orderData = pendingOrder.order_data as any;
            console.log("✓ Found order in pending_orders table");
          } else {
            // Check if error is because table doesn't exist
            if (pendingError?.code === "42P01" || pendingError?.message?.includes("does not exist")) {
              console.warn("⚠ pending_orders table does not exist - run create_pending_orders_table.sql");
            } else {
              console.warn("⚠ Order not found in pending_orders:", pendingError?.message || "No data");
            }
          }
        } catch (tableError: any) {
          console.warn("⚠ Could not access pending_orders table:", tableError?.message || "Table may not exist");
          // Continue to fallback
        }

        // Fallback: try to get from info field if pending_orders didn't work
        if (!orderData) {
          console.log("Trying fallback: info field from callback");
          const infoField = (callbackData as any).info || callbackData.info;
          if (infoField) {
            try {
              const orderDataJson = Buffer.from(infoField, "base64").toString("utf-8");
              console.log("Decoded info field, length:", orderDataJson.length);
              orderData = JSON.parse(orderDataJson);
              console.log("✓ Parsed order data from info field");
            } catch (parseError: any) {
              console.error("✗ Failed to parse info field:", parseError.message);
            }
          } else {
            console.warn("✗ No info field in callback data");
          }
        }

        // If we still don't have order data, log detailed error and try to save minimal order
        if (!orderData) {
          console.error("CRITICAL: No order data available from any source!");
          console.error("Cannot save order - missing customer, shipping, and items data");
          console.error("Available callback data:", {
            order_id: callbackData.order_id,
            amount: callbackData.amount,
            transaction_id: callbackData.transaction_id,
            status: callbackData.status,
          });
          
          // Try to save at least basic order info if we have amount
          if (callbackData.amount) {
            console.log("Attempting to save minimal order with available data");
            const { data: minimalOrder, error: minimalError } = await supabase
              .from("orders")
              .insert({
                status: "completed",
                customer_name: null,
                customer_email: null,
                customer_phone: null,
                shipping_address: null,
                total_price: callbackData.amount,
                currency: callbackData.currency || "UAH",
                order_id: callbackData.order_id,
                notes: `Payment confirmed but order data missing. Transaction ID: ${callbackData.transaction_id}`,
              })
              .select()
              .single();

            if (minimalError) {
              console.error("Failed to save even minimal order:", minimalError);
            } else {
              console.log("Saved minimal order record (missing customer/items data)");
            }
          }
          
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ok" }),
          };
        }

        // We have order data - save it
        console.log("Saving order with data:", {
          hasCustomer: !!orderData?.customer,
          hasItems: !!orderData?.items,
          itemsCount: orderData?.items?.length || 0,
          amount: orderData?.amount,
        });

        // Build shipping address
        const shippingAddress = pendingOrder?.shipping_address || 
                               orderData?.shipping?.address || 
                               (orderData?.shipping?.city ? `${orderData.shipping.city}${orderData.shipping.address ? `, ${orderData.shipping.address}` : ''}` : '') ||
                               "";

        // Save order to orders table
        const { data: orderDataResult, error: orderError } = await supabase
          .from("orders")
          .insert({
            status: "completed",
            customer_name: pendingOrder?.customer_name || orderData?.customer?.fullName || null,
            customer_email: pendingOrder?.customer_email || orderData?.customer?.email || null,
            customer_phone: pendingOrder?.customer_phone || orderData?.customer?.phone || null,
            shipping_address: shippingAddress,
            total_price: pendingOrder?.total_price || orderData?.amount || callbackData.amount || 0,
            currency: pendingOrder?.currency || "UAH",
            order_id: callbackData.order_id,
            notes: pendingOrder?.notes || orderData?.notes || null,
          })
          .select()
          .single();

        if (orderError) {
          console.error("✗ Error saving order to Supabase:", orderError);
          console.error("Error details:", {
            code: orderError.code,
            message: orderError.message,
            details: orderError.details,
            hint: orderError.hint,
          });
        } else if (orderDataResult) {
          console.log("✓ Order saved successfully, ID:", orderDataResult.id);
          
          // Save order items
          const itemsToSave = orderData?.items || [];
          if (itemsToSave.length > 0) {
            const orderItems = itemsToSave.map((item: any) => ({
              order_id: orderDataResult.id,
              product_id: item.id?.toString() || item.product_id || "unknown",
              product_name: item.name || "Unknown Product",
              product_image: item.image || item.image_url || null,
              quantity: item.quantity || 1,
              price: item.price || 0,
            }));

            console.log(`Saving ${orderItems.length} order items...`);
            const { error: itemsError } = await supabase
              .from("order_items")
              .insert(orderItems);

            if (itemsError) {
              console.error("✗ Error saving order items:", itemsError);
            } else {
              console.log(`✓ Order ${callbackData.order_id} saved successfully with ${orderItems.length} items`);
            }
          } else {
            console.warn("⚠ No items to save for order");
          }
          
          // Delete from pending_orders after successful save (if it existed)
          if (pendingOrder) {
            await supabase
              .from("pending_orders")
              .delete()
              .eq("order_id", callbackData.order_id);
            console.log("✓ Cleaned up pending_orders entry");
          }
        }
      }
    } else {
      // Payment failed, pending, or not confirmed - don't save order
      console.log(`Payment NOT confirmed for order ${callbackData.order_id}:`, {
        status: callbackData.status,
        reason: callbackData.status === "wait_accept" ? "Payment still processing" :
                callbackData.status === "failure" ? "Payment failed" :
                callbackData.status === "error" ? "Payment error" :
                callbackData.status === "processing" ? "Payment processing" :
                "Unknown status",
        orderNotSaved: true,
      });
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

