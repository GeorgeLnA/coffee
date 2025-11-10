import type { Handler } from "@netlify/functions";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "./send-email";
import { resolveEmailJSConfig, maskForLogs } from "../../shared/emailjs-config";

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
 * Create Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTQsImV4cCI6MjA3NjE3NDYxNH0.UXuBlmkHgZCgoe95nTZ_PrAZU9TeoBHt9FjMw0sAFDo";
  return createClient(supabaseUrl, supabaseKey);
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
  // Debug: Log the incoming request method
  console.log("=== PREPARE ORDER FUNCTION DEBUG ===");
  console.log("HTTP Method:", event.httpMethod);
  console.log("Path:", event.path);
  console.log("Raw URL:", event.rawUrl);
  console.log("Headers:", JSON.stringify(event.headers, null, 2));
  console.log("================================");

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
    console.error("Method not allowed - received:", event.httpMethod, "expected: POST");
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Method not allowed",
        received: event.httpMethod,
        expected: "POST"
      }),
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
      itemsWithVariants: items?.map((it: any) => ({ 
        name: it.name, 
        variant: it.variant, 
        hasVariant: !!it.variant 
      })),
      shipping: {
        method: shipping?.method,
        city: shipping?.city,
        department: shipping?.department,
        warehouseRef: shipping?.warehouseRef,
      },
      paymentMethod: payment?.method,
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
    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const amount = Number(
      (
        items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0) +
        (shipping?.price || 0)
      ).toFixed(2)
    );

    // Build shipping address string (for backward compatibility)
    let shippingAddress = "";
    if (shipping?.address) {
      shippingAddress = shipping.address;
      if (shipping.city) {
        shippingAddress = `${shipping.city}, ${shippingAddress}`;
      }
    } else if (shipping?.city && shipping?.warehouseRef) {
      const shippingMethod = shipping.method || "nova_department";
      const departmentText = shipping.department ? `, №${shipping.department}` : '';
      shippingAddress = `${shipping.city} (${shippingMethod === 'nova_department' ? 'Відділення' : 'Поштомат'}${departmentText})`;
    }
    

    // For cash payments, save order immediately (no payment gateway callback)
    if (paymentMethod === "cash") {
      const supabase = getSupabaseClient();
      // Track email send results for returning to client
      let emailResults: { customer?: { success: boolean; error?: string }; admin?: { success: boolean; error?: string } } = {};
      const orderToInsert = {
        status: "pending",
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress, // Keep for backward compatibility
        shipping_city: shipping?.city || null,
        shipping_city_ref: shipping?.cityRef || null,
        shipping_street_address: shipping?.address || null, // Detailed street address
        shipping_warehouse_ref: shipping?.warehouseRef || null,
        shipping_department: shipping?.department || null,
        shipping_method: shipping?.method || null,
        payment_method: paymentMethod || null,
        total_price: amount,
        currency: "UAH",
        order_id: orderId,
        notes: notes || null,
      };
      
      console.log('Saving cash order with:', {
        shipping_department: orderToInsert.shipping_department,
        shipping_method: orderToInsert.shipping_method,
        payment_method: orderToInsert.payment_method,
        order_id: orderToInsert.order_id,
      });

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) {
        console.error("Error saving order to Supabase:", orderError);
        return {
          statusCode: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Failed to save order" }),
        };
      }

      // Save order items with all details including variant
      if (orderData) {
        const orderItems = items.map((item: any) => {
          const itemToSave = {
            order_id: orderData.id,
            product_id: item.id?.toString() || item.product_id || "unknown",
            product_name: item.name || "Unknown Product",
            product_image: item.image || item.image_url || null,
            quantity: item.quantity || 1,
            price: item.price || 0,
            variant: item.variant || null, // Store grind type, size, etc.
          };
          console.log('Saving order item:', {
            name: itemToSave.product_name,
            variant: itemToSave.variant,
            hasVariant: !!itemToSave.variant,
          });
          return itemToSave;
        });

        console.log('Inserting order items:', orderItems.map((it: any) => ({ 
          name: it.product_name,
          variant: it.variant,
          hasVariant: !!it.variant,
          variantType: typeof it.variant,
        })));
        
        const { data: insertedItems, error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems)
          .select();

        if (itemsError) {
          console.error("✗ ERROR saving order items to Supabase:", itemsError);
          console.error("Error details:", {
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
          });
          console.error("Attempted to insert:", JSON.stringify(orderItems, null, 2));
        } else {
          console.log(`✓ Successfully saved ${orderItems.length} order items`);
          console.log("Inserted items:", insertedItems?.map((it: any) => ({ id: it.id, variant: it.variant })));

          // Send confirmation emails for cash orders (only if we have required data)
          console.log("=== CHECKING EMAIL CONDITIONS ===");
          console.log("orderData exists:", !!orderData);
          console.log("orderData.customer_email:", orderData?.customer_email);
          console.log("insertedItems exists:", !!insertedItems);
          console.log("insertedItems length:", insertedItems?.length);
          
          if (orderData && orderData.customer_email) {
            try {
              console.log("=== EMAIL SENDING DEBUG (CASH ORDER) ===");
              const emailConfig = resolveEmailJSConfig();
              const emailjsServiceId = emailConfig.serviceId;
              const emailjsTemplateIdCustomer = emailConfig.templateIdCustomer;
              const emailjsTemplateIdAdmin = emailConfig.templateIdAdmin;
              const emailjsPublicKey = emailConfig.publicKey;
              const emailjsPrivateKey = emailConfig.privateKey; // Private key for server-side REST API
              const adminEmails = emailConfig.adminEmails || "davidnuk877@gmail.com";

              console.log("Environment check:", {
                hasServiceId: !!emailjsServiceId,
                hasCustomerTemplate: !!emailjsTemplateIdCustomer,
                hasAdminTemplate: !!emailjsTemplateIdAdmin,
                hasPublicKey: !!emailjsPublicKey,
                serviceId: maskForLogs(emailjsServiceId),
                customerTemplate: maskForLogs(emailjsTemplateIdCustomer),
                adminTemplate: maskForLogs(emailjsTemplateIdAdmin),
                publicKey: maskForLogs(emailjsPublicKey),
                privateKeySource: emailConfig.sources.privateKey || "NOT SET",
                adminEmails: adminEmails,
                adminEmailsSource: emailConfig.sources.adminEmails || "NOT SET",
              });

              // Only send if EmailJS is configured
              if (emailjsServiceId && emailjsTemplateIdCustomer && emailjsTemplateIdAdmin && emailjsPublicKey) {
                console.log("EmailJS configured, proceeding to send emails...");
                // Prepare order items for email (only use data we have)
                const sourceItems = (insertedItems && insertedItems.length > 0)
                  ? insertedItems
                  : (Array.isArray(orderData.items) ? orderData.items : (Array.isArray(items) ? items : []));
                const emailItems = sourceItems.map((item: any) => ({
                  name: item.product_name || item.name || "Невідомий товар",
                  quantity: Number(item.quantity) || 1,
                  price: Number(item.price) || 0,
                  image: item.product_image || item.image || item.image_url || null,
                  variant: item.variant || null,
                }));

                // Build shipping address based on shipping method
                let shippingAddress = "";
                if (orderData.shipping_method === 'nova_department' || orderData.shipping_method === 'nova_postomat') {
                  // Nova Poshta: city + department/postomat
                  if (orderData.shipping_city) {
                    shippingAddress = orderData.shipping_city;
                  }
                  if (orderData.shipping_department) {
                    const deptType = orderData.shipping_method === 'nova_postomat' ? 'Поштомат' : 'Відділення';
                    shippingAddress += shippingAddress ? `, ${deptType} №${orderData.shipping_department}` : `${deptType} №${orderData.shipping_department}`;
                  } else if (orderData.shipping_warehouse_ref) {
                    // Fallback to warehouse ref if no department number
                    const deptType = orderData.shipping_method === 'nova_postomat' ? 'Поштомат' : 'Відділення';
                    shippingAddress += shippingAddress ? `, ${deptType} (${orderData.shipping_warehouse_ref.substring(0, 8)}...)` : `${deptType} (${orderData.shipping_warehouse_ref.substring(0, 8)}...)`;
                  }
                  if (!shippingAddress) {
                    shippingAddress = orderData.shipping_address || orderData.shipping_street_address || 'Не вказано';
                  }
                } else if (orderData.shipping_method === 'nova_courier' || orderData.shipping_method === 'own_courier') {
                  // Courier: just address (no city)
                  shippingAddress = orderData.shipping_street_address || orderData.shipping_address || 'Не вказано';
                } else {
                  // Fallback
                  shippingAddress = orderData.shipping_address || orderData.shipping_street_address || 'Не вказано';
                }

                // Format shipping method display name
                const shippingMethodText = (orderData.shipping_method || shipping?.method)
                  ? (orderData.shipping_method === 'nova_department' || shipping?.method === 'nova_department'
                      ? 'Нова Пошта (на відділення)' 
                      : orderData.shipping_method === 'nova_postomat' || shipping?.method === 'nova_postomat'
                      ? 'Нова Пошта (на поштомат)'
                      : orderData.shipping_method === 'nova_courier' || shipping?.method === 'nova_courier'
                      ? 'Нова Пошта (кур\'єром)'
                      : orderData.shipping_method === 'own_courier' || shipping?.method === 'own_courier'
                      ? 'Власна доставка (Київ)'
                      : orderData.shipping_method || shipping?.method)
                  : 'Не вказано';

                // Format payment method
                const paymentMethodText = (orderData.payment_method || "cash") === 'cash'
                  ? 'Оплата при отриманні'
                  : 'Онлайн оплата (LiqPay)';

                console.log("Preparing customer email...");
                console.log("Customer email data:", {
                  email: orderData.customer_email,
                  name: orderData.customer_name,
                  phone: orderData.customer_phone,
                  orderId: orderData.order_id || orderId,
                  itemsCount: emailItems.length,
                });

                // Send customer confirmation email
                const customerEmailResult = await sendOrderConfirmationEmail({
                  customerEmail: orderData.customer_email,
                  customerName: orderData.customer_name || "Клієнт",
                  customerPhone: orderData.customer_phone || "",
                  orderId: orderData.order_id || orderId,
                  orderDate: orderData.created_at || new Date(),
                  orderTotal: Number(orderData.total_price) || amount,
                  orderItems: emailItems,
                  shippingAddress: shippingAddress || "Не вказано",
                  shippingMethod: shippingMethodText,
                  paymentMethod: paymentMethodText,
                  orderNotes: orderData.notes || notes || null,
                  emailjsServiceId,
                  emailjsTemplateIdCustomer,
                  emailjsPublicKey,
                  emailjsPrivateKey, // Pass private key for server-side REST API
                });

                console.log("Customer email result:", JSON.stringify(customerEmailResult, null, 2));
                emailResults.customer = { success: !!customerEmailResult.success, error: customerEmailResult.error };
                if (customerEmailResult.success) {
                  console.log("✓ Customer confirmation email sent (cash order)");
                } else {
                  console.error("✗ Failed to send customer email:", customerEmailResult.error);
                  console.error("Full customer email error:", JSON.stringify(customerEmailResult, null, 2));
                }

                console.log("Preparing admin email...");
                console.log("Admin email data:", {
                  adminEmails: adminEmails.split(",").map((e: string) => e.trim()),
                  customerName: orderData.customer_name,
                  orderId: orderData.order_id || orderId,
                });

                // Send admin notification email
                const orderNotes = orderData.notes || notes || null;
                console.log("=== ADMIN EMAIL NOTES DEBUG ===");
                console.log("orderData.notes:", orderData.notes);
                console.log("notes (from request):", notes);
                console.log("Final orderNotes:", orderNotes);
                
                const adminEmailResult = await sendOrderNotificationEmail({
                  adminEmails: adminEmails.split(",").map((e: string) => e.trim()),
                  customerName: orderData.customer_name || "Клієнт",
                  customerEmail: orderData.customer_email,
                  customerPhone: orderData.customer_phone || "",
                  orderId: orderData.order_id || orderId,
                  orderTotal: Number(orderData.total_price) || amount,
                  orderItems: emailItems,
                  shippingAddress: shippingAddress || "Не вказано",
                  shippingCity: orderData.shipping_city || shipping?.city || null,
                  shippingDepartment: orderData.shipping_department || shipping?.department || null,
                  shippingMethod: shippingMethodText,
                  paymentMethod: paymentMethodText,
                  notes: orderNotes || '', // Pass notes as empty string if null
                  emailjsServiceId,
                  emailjsTemplateIdAdmin,
                  emailjsPublicKey,
                  emailjsPrivateKey, // Pass private key for server-side REST API
                });

                console.log("Admin email result:", JSON.stringify(adminEmailResult, null, 2));
                emailResults.admin = { success: !!adminEmailResult.success, error: adminEmailResult.error };
                if (adminEmailResult.success) {
                  console.log("✓ Admin notification email sent (cash order)");
                } else {
                  console.error("✗ Failed to send admin email:", adminEmailResult.error);
                  console.error("Full admin email error:", JSON.stringify(adminEmailResult, null, 2));
                }
                console.log("=== EMAIL SENDING DEBUG END ===");
              } else {
                console.warn("⚠ EmailJS not configured - skipping email sending");
                console.warn("Missing variables:", {
                  serviceId: !emailjsServiceId,
                  customerTemplate: !emailjsTemplateIdCustomer,
                  adminTemplate: !emailjsTemplateIdAdmin,
                  publicKey: !emailjsPublicKey,
                });
              }
            } catch (emailError: any) {
              console.error("✗ Error sending emails:", emailError);
              console.error("Email error details:", {
                message: emailError?.message,
                stack: emailError?.stack,
                name: emailError?.name,
              });
              // Don't fail the order if email fails
            }
          } else {
            console.warn("⚠ Email sending skipped - conditions not met:", {
              hasOrderData: !!orderData,
              hasCustomerEmail: !!orderData?.customer_email,
              customerEmail: orderData?.customer_email,
              hasInsertedItems: !!insertedItems,
              insertedItemsLength: insertedItems?.length,
            });
          }
        }
      }

      // For cash payments, return success immediately
      // Include email status in response for debugging (check if we have the data needed)
      let emailStatus: any = { attempted: false, reason: "orderData or items not saved" };
      if (orderData && orderData.customer_email) {
        // Check if EmailJS is configured and if email sending was attempted
        const emailConfig = resolveEmailJSConfig();
        const emailjsServiceId = emailConfig.serviceId;
        const emailjsTemplateIdCustomer = emailConfig.templateIdCustomer;
        const emailjsTemplateIdAdmin = emailConfig.templateIdAdmin;
        const emailjsPublicKey = emailConfig.publicKey;
        const isConfigured = emailConfig.configured;
        
        emailStatus = {
          attempted: true,
          configured: isConfigured,
          // Include which variables are missing for debugging
          missingVars: {
            serviceId: emailConfig.missing.serviceId,
            customerTemplate: emailConfig.missing.templateIdCustomer,
            adminTemplate: emailConfig.missing.templateIdAdmin,
            publicKey: emailConfig.missing.publicKey,
          },
          details: emailResults,
        };
      } else {
        emailStatus = {
          attempted: false,
          reason: !orderData ? "orderData missing" : !orderData.customer_email ? "customer_email missing" : "unknown",
        };
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        } as Record<string, string>,
        body: JSON.stringify({
          success: true,
          orderId,
          paymentMethod: "cash",
          message: "Order created successfully. Payment will be collected upon delivery.",
          emailStatus, // Include email status for debugging
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

    const description = items
      .map(
        (it: any) =>
          `${it.name}${it.variant ? ` (${it.variant})` : ""} x${it.quantity}`
      )
      .join(", ");

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

    // Get Supabase project reference for Edge Function URL
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
    const supabaseProjectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "umynzgzlqdphgrzixhsc";
    const supabaseWebhookUrl = `https://${supabaseProjectRef}.functions.supabase.co/liqpay-webhook`;
    
    console.log("=== WEBHOOK URL DEBUG ===");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Project Ref:", supabaseProjectRef);
    console.log("Webhook URL:", supabaseWebhookUrl);
    console.log("=========================");

    // Store order data temporarily in Supabase pending_orders table
    // This allows us to retrieve it when payment is confirmed
    const orderData = {
      orderId,
      customer,
      shipping: {
        ...shipping,
        address: shippingAddress, // Keep for backward compatibility
        department: shipping?.department || null,
      },
      payment: {
        method: paymentMethod,
      },
      items: items.map((item: any) => ({
        ...item,
        variant: item.variant || null, // Ensure variant is included
      })),
      notes,
      amount,
    };

    // Save to pending_orders table temporarily
    // This allows callback to retrieve order data when payment is confirmed
    const supabase = getSupabaseClient();
    const { error: pendingError } = await supabase
      .from("pending_orders")
        .insert({
          order_id: orderId,
          customer_name: customer.fullName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          shipping_address: shippingAddress, // Keep for backward compatibility
          total_price: amount,
          currency: "UAH",
          notes: notes || null,
          order_data: orderData, // Store full order data as JSON
        });

    if (pendingError) {
      console.error("Error saving to pending_orders:", pendingError);
      console.error("Pending orders error details:", {
        code: pendingError.code,
        message: pendingError.message,
        details: pendingError.details,
        hint: pendingError.hint,
      });
      // Continue anyway - we'll try to get data from info field as fallback
      console.warn("⚠ Will rely on info field fallback for order data");
    } else {
      console.log(`✓ Order ${orderId} saved to pending_orders temporarily`);
    }

    // Also store in info field as backup
    const orderDataJson = JSON.stringify(orderData);
    const orderDataBase64 = base64(orderDataJson);

    const params = {
      version: 3,
      public_key: publicKey,
      action: "pay",
      amount,
      currency: "UAH",
      description: `Замовлення ${orderId} — THE COFFEE MANIFEST`,
      order_id: orderId,
      result_url: `${baseUrl}/basket?payment=return`,
      // Use Netlify function instead - it's more reliable
      server_url: `${baseUrl}/.netlify/functions/liqpay-callback`,
      language: "uk",
      paytypes,
      sandbox: process.env.VITE_LIQPAY_SANDBOX === "true" ? 1 : undefined,
      info: orderDataBase64, // Store full order data for callback
    } as Record<string, any>;

    // Remove undefined values
    Object.keys(params).forEach(
      (k) => params[k] === undefined && delete params[k]
    );

    const data = base64(JSON.stringify(params));
    const signature = sign(data, privateKey);

    // CRITICAL DEBUG: Log what we're sending to LiqPay
    console.log("=== LIQPAY PAYMENT DATA ===");
    console.log("Order ID:", orderId);
    console.log("Server URL (webhook):", supabaseWebhookUrl);
    console.log("Payment params include server_url:", !!params.server_url);
    console.log("Full params keys:", Object.keys(params));
    console.log("===========================");

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

