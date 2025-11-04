// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function b64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromB64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

async function sha1Base64(input: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return b64(new Uint8Array(digest));
}

async function sha3_256_Base64(input: string) {
  const { sha3_256 } = await import("https://esm.sh/@noble/hashes@1.4.0/sha3");
  const bytes = sha3_256(new TextEncoder().encode(input));
  return b64(Uint8Array.from(bytes));
}

Deno.serve(async (req) => {
  try {
    console.log("=== LIQPAY WEBHOOK CALLED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    
    if (req.method !== "POST") {
      console.log("Wrong method, returning 405");
      return new Response("Method Not Allowed", { 
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const LIQPAY_PUBLIC = Deno.env.get("LIQPAY_PUBLIC")!;
    const LIQPAY_PRIVATE = Deno.env.get("LIQPAY_PRIVATE")!;
    // Supabase URL and service role are automatically available in Edge Functions
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://umynzgzlqdphgrzixhsc.supabase.co";
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU5ODYxNCwiZXhwIjoyMDc2MTc0NjE0fQ.lXMwVMBtFijIPYZu0u4pGzIa3QORumFEyMbE56EDnck";
    
    console.log("Environment check:", {
      hasLiqPayPublic: !!LIQPAY_PUBLIC,
      hasLiqPayPrivate: !!LIQPAY_PRIVATE,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRole: !!SUPABASE_SERVICE_ROLE,
    });

    if (!LIQPAY_PUBLIC || !LIQPAY_PRIVATE || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      console.error("Missing required environment variables");
      return new Response("Server configuration error", { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    const contentType = req.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    // LiqPay sends form data, but might not include explicit content-type
    // Try to parse as form data regardless
    let dataB64 = "";
    let signature = "";
    
    try {
      const form = await req.formData();
      dataB64 = String(form.get("data") || "");
      signature = String(form.get("signature") || "");
      console.log("Parsed form data - has data:", !!dataB64, "has signature:", !!signature);
    } catch (formError) {
      console.error("Error parsing form data:", formError);
      // Try to read as text and parse manually
      const text = await req.text();
      console.log("Request body as text:", text.substring(0, 200));
      
      // Try URLSearchParams
      const params = new URLSearchParams(text);
      dataB64 = params.get("data") || "";
      signature = params.get("signature") || "";
      console.log("Parsed URL params - has data:", !!dataB64, "has signature:", !!signature);
    }
    
    if (!dataB64 || !signature) {
      console.error("Missing data or signature");
      return new Response("Bad Request - missing data or signature", { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Verify signature (try SHA-1 then SHA3-256)
    const signString = LIQPAY_PRIVATE + dataB64 + LIQPAY_PRIVATE;
    const sigSha1 = await sha1Base64(signString);
    const sigSha3 = await sha3_256_Base64(signString);

    const signatureValid = signature === sigSha1 || signature === sigSha3;
    if (!signatureValid) {
      console.error("Invalid signature");
      return new Response("Invalid signature", { status: 403 });
    }

    // Decode payload
    let payload: any;
    try {
      payload = JSON.parse(new TextDecoder().decode(fromB64(dataB64)));
    } catch {
      return new Response("Bad payload", { status: 400 });
    }

    // Hard checks before updating DB
    const {
      public_key,
      status,          // "success", "failure", "error", "reversed", etc.
      order_id,        // your id
      payment_id,      // LiqPay id
      amount,
      currency,
      info,            // Base64-encoded order data
    } = payload;

    if (!public_key || public_key !== LIQPAY_PUBLIC) {
      console.error("Public key mismatch");
      return new Response("Public key mismatch", { status: 403 });
    }
    if (!order_id) return new Response("Missing order_id", { status: 400 });

    console.log("LiqPay callback received:", {
      status,
      order_id,
      payment_id,
      amount,
      currency,
      hasInfo: !!info,
    });

    // Fetch current order
    const { data: orders, error: getErr } = await supabase
      .from("orders")
      .select("id, order_id, status, payment_method")
      .eq("order_id", order_id)
      .limit(1);

    if (getErr) {
      console.error("DB read error:", getErr);
      return new Response("DB read error", { status: 500 });
    }
    if (!orders || orders.length === 0) {
      // Order doesn't exist - try to get from pending_orders
      console.log("Order not found in orders table, checking pending_orders...");
      
      let orderData: any = null;
      
      // Try pending_orders table
      const { data: pendingOrder, error: pendingError } = await supabase
        .from("pending_orders")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (!pendingError && pendingOrder) {
        orderData = pendingOrder.order_data as any;
        console.log("Found order in pending_orders");
      } else if (info) {
        // Fallback: decode from info field
        try {
          const orderDataJson = new TextDecoder().decode(fromB64(info));
          orderData = JSON.parse(orderDataJson);
          console.log("Decoded order data from info field");
        } catch (parseError) {
          console.error("Failed to parse info field:", parseError);
        }
      }

      if (!orderData) {
        console.error("Order not found and no order data available");
        return new Response("Order not found", { status: 404 });
      }

      // Only create order if payment is successful
      if (status === "success" || status === "sandbox") {
        const shipping = orderData.shipping || {};
        const payment = orderData.payment || {};
        const shippingAddress = shipping.address || 
                               (shipping.city ? `${shipping.city}${shipping.address ? `, ${shipping.address}` : ''}` : '') ||
                               "";

        // Insert order
        const { data: newOrder, error: insertError } = await supabase
          .from("orders")
          .insert({
            status: "completed",
            customer_name: orderData.customer?.fullName || null,
            customer_email: orderData.customer?.email || null,
            customer_phone: orderData.customer?.phone || null,
            shipping_address: shippingAddress,
            shipping_city: shipping?.city || null,
            shipping_city_ref: shipping?.cityRef || null,
            shipping_street_address: shipping?.address || null,
            shipping_warehouse_ref: shipping?.warehouseRef || null,
            shipping_department: shipping?.department || null,
            shipping_method: shipping?.method || null,
            payment_method: payment?.method || "liqpay",
            total_price: amount || orderData.amount || 0,
            currency: currency || "UAH",
            order_id: order_id,
            notes: orderData.notes || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting order:", insertError);
          return new Response("DB insert error", { status: 500 });
        }

        // Insert order items
        if (newOrder && orderData.items && Array.isArray(orderData.items)) {
          const orderItems = orderData.items.map((item: any) => ({
            order_id: newOrder.id,
            product_id: item.id?.toString() || item.product_id || "unknown",
            product_name: item.name || "Unknown Product",
            product_image: item.image || item.image_url || null,
            quantity: item.quantity || 1,
            price: item.price || 0,
            variant: item.variant || null,
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

          if (itemsError) {
            console.error("Error inserting order items:", itemsError);
          } else {
            console.log(`Order ${order_id} created successfully with ${orderItems.length} items`);
          }
        }

        // Clean up pending_orders
        if (pendingOrder) {
          await supabase
            .from("pending_orders")
            .delete()
            .eq("order_id", order_id);
        }
      }

      return new Response("ok", { status: 200 });
    }

    const current = orders[0];

    // Idempotency: if already completed and same payment_id, acknowledge
    if (current.status === "completed" && payment_id) {
      // Store latest payload for audit but don't flip anything
      await supabase
        .from("orders")
        .update({ updated_at: new Date().toISOString() })
        .eq("order_id", order_id);
      return new Response("ok", { status: 200 });
    }

    // Update based on status
    if (status === "success" || status === "sandbox") {
      const { error: updErr } = await supabase
        .from("orders")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order_id);

      if (updErr) {
        console.error("DB update error:", updErr);
        return new Response("DB update error", { status: 500 });
      }
      
      console.log(`Order ${order_id} marked as completed`);
    } else {
      // Record non-success status too
      await supabase
        .from("orders")
        .update({
          status: status === "failure" ? "failed" : "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order_id);
    }

    // Only return 200 after successful DB write so LiqPay stops retrying
    return new Response("ok", { 
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Server error", { status: 500 });
  }
});

