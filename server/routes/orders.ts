import { RequestHandler } from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "../../netlify/functions/send-email";
import { sendDevOrderEmails } from "../lib/dev-mailer";
import { resolveEmailJSConfig, maskForLogs } from "../../shared/emailjs-config";

function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTQsImV4cCI6MjA3NjE3NDYxNH0.UXuBlmkHgZCgoe95nTZ_PrAZU9TeoBHt9FjMw0sAFDo";
  return createClient(supabaseUrl, supabaseKey);
}

function base64(str: string) {
  return Buffer.from(str).toString('base64');
}

function sign(data: string, privateKey: string) {
  return crypto.createHash('sha1').update(privateKey + data + privateKey).digest('base64');
}

export const prepareOrder: RequestHandler = async (req, res) => {
  try {
    const { customer, shipping, payment, items, notes } = req.body as any;
    
    // Debug logging
    console.log('prepareOrder received:', {
      hasCustomer: !!customer,
      hasItems: !!items,
      itemsIsArray: Array.isArray(items),
      itemsLength: items?.length,
      customerKeys: customer ? Object.keys(customer) : [],
      itemsPreview: items?.map((it: any) => ({ name: it.name, quantity: it.quantity }))
    });
    
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed:', { customer: !!customer, items: !!items, isArray: Array.isArray(items), length: items?.length });
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const paymentMethod = payment?.method || 'liqpay';
    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const amount = Number((items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0) + (shipping?.price || 0)).toFixed(2));

    // Build shipping address string
    let shippingAddress = "";
    if (shipping?.address) {
      // For courier options, just use address (no city)
      shippingAddress = shipping.address;
    } else if (shipping?.city && shipping?.warehouseRef) {
      // For Nova Poshta (postomat/department), use city + warehouse
      const shippingMethod = shipping.method || "nova_department";
      shippingAddress = `${shipping.city} (${shippingMethod === 'nova_department' ? 'Відділення' : 'Поштомат'})`;
    }

    // For cash payments, save order immediately (no payment gateway callback)
    if (paymentMethod === 'cash') {
      console.log("=== CASH PAYMENT DETECTED ===");
      console.log("Customer:", customer?.fullName, customer?.email);
      console.log("Order ID:", orderId);
      console.log("Amount:", amount);
      
      const supabase = getSupabaseClient();
      const orderToInsert = {
        status: 'pending',
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress, // Keep for backward compatibility
        shipping_city: shipping?.city || null,
        shipping_city_ref: shipping?.cityRef || null,
        shipping_street_address: shipping?.address || null,
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
      });

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) {
        console.error("✗ ERROR saving order to Supabase:", orderError);
        console.error("Error details:", {
          code: orderError.code,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
        });
        return res.status(500).json({ error: 'Failed to save order', details: orderError.message });
      }

      console.log('✓ Cash order saved to Supabase:', {
        orderId: orderData.id,
        order_id: orderData.order_id,
        shipping_department: orderData.shipping_department,
        payment_method: orderData.payment_method,
        customer_email: orderData.customer_email,
      });

      // Save order items with variant
      // Declare insertedItems in outer scope so it's accessible for emailStatus
      let insertedItems: any[] | null = null;
      
      if (orderData) {
        console.log("=== SAVING ORDER ITEMS ===");
        const orderItems = items.map((item: any) => ({
          order_id: orderData.id,
          product_id: item.id?.toString() || item.product_id || "unknown",
          product_name: item.name || "Unknown Product",
          product_image: item.image || item.image_url || null,
          quantity: item.quantity || 1,
          price: item.price || 0,
          variant: item.variant || null, // Store grind type, size, etc.
        }));

        console.log('Saving order items with variants:', orderItems.map((it: any) => ({
          name: it.product_name,
          variant: it.variant,
        })));

        const { data: insertedItemsData, error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems)
          .select();

        if (itemsError) {
          console.error("✗ ERROR saving order items:", itemsError);
          console.error("Error details:", {
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
          });
        } else {
          insertedItems = insertedItemsData;
          console.log(`✓ Saved ${orderItems.length} order items with variants`);
          console.log("Inserted items:", insertedItems?.map((it: any) => ({ variant: it.variant })));
          console.log("=== CHECKING FOR EMAIL SENDING ===");
          console.log("insertedItems exists:", !!insertedItems);
          console.log("insertedItems length:", insertedItems?.length);
          console.log("customer exists:", !!customer);
          console.log("customer.email:", customer?.email);

          // Send confirmation emails for cash orders (only if we have required data)
          console.log("=== CHECKING EMAIL CONDITIONS (EXPRESS ROUTE) ===");
          console.log("insertedItems exists:", !!insertedItems);
          console.log("insertedItems length:", insertedItems?.length);
          console.log("customer exists:", !!customer);
          console.log("customer.email:", customer?.email);
          
          if (insertedItems && insertedItems.length > 0 && customer?.email) {
            console.log("✓ Conditions met, attempting to send emails...");
            try {
              console.log("=== EMAIL SENDING DEBUG (CASH ORDER - EXPRESS ROUTE) ===");
              const emailConfig = resolveEmailJSConfig();
              const emailjsServiceId = emailConfig.serviceId;
              const emailjsTemplateIdCustomer = emailConfig.templateIdCustomer;
              const emailjsTemplateIdAdmin = emailConfig.templateIdAdmin;
              const emailjsPublicKey = emailConfig.publicKey;
              const emailjsPrivateKey = emailConfig.privateKey; // Private key for server-side REST API
              const adminEmails = emailConfig.adminEmails || "dovedem2014@gmail.com,manifestcava@gmail.com";

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

              // Only send via EmailJS if configured; otherwise use dev mailer (Ethereal)
              // Check if we have private key too (required for server-side)
              const hasEmailJSConfig = emailConfig.configured;
              if (hasEmailJSConfig) {
                console.log("EmailJS configured, proceeding to send emails...");
                if (!emailjsPrivateKey) {
                  console.warn("⚠ WARNING: EMAILJS_PRIVATE_KEY not set! Server-side emails may fail. Add it to .env.local");
                }
                // Prepare order items for email (only use data we have)
                const emailItems = insertedItems.map((item: any) => ({
                  name: item.product_name || "Невідомий товар",
                  quantity: item.quantity || 1,
                  price: Number(item.price) || 0,
                  image: item.product_image || null,
                  variant: item.variant || null,
                }));

                // Build shipping address based on shipping method
                let emailShippingAddress = "";
                if (shipping?.method === 'nova_department' || shipping?.method === 'nova_postomat') {
                  // Nova Poshta: city + department/postomat
                  if (shipping.city) {
                    emailShippingAddress = shipping.city;
                  }
                  if (shipping.department) {
                    const deptType = shipping.method === 'nova_postomat' ? 'Поштомат' : 'Відділення';
                    emailShippingAddress += emailShippingAddress ? `, ${deptType} №${shipping.department}` : `${deptType} №${shipping.department}`;
                  } else if (shipping.warehouseRef) {
                    // Fallback to warehouse ref if no department number
                    const deptType = shipping.method === 'nova_postomat' ? 'Поштомат' : 'Відділення';
                    emailShippingAddress += emailShippingAddress ? `, ${deptType} (${shipping.warehouseRef.substring(0, 8)}...)` : `${deptType} (${shipping.warehouseRef.substring(0, 8)}...)`;
                  }
                  if (!emailShippingAddress) {
                    emailShippingAddress = shippingAddress || 'Не вказано';
                  }
                } else if (shipping?.method === 'nova_courier' || shipping?.method === 'own_courier') {
                  // Courier: just address (no city)
                  emailShippingAddress = shipping.address || shippingAddress || 'Не вказано';
                } else {
                  // Fallback
                  emailShippingAddress = shippingAddress || shipping?.address || 'Не вказано';
                }

                // Format shipping method
                const shippingMethodText = shipping?.method 
                  ? (shipping.method === 'nova_department' 
                      ? 'Нова Пошта (на відділення)' 
                      : shipping.method === 'nova_postomat'
                      ? 'Нова Пошта (на поштомат)'
                      : shipping.method === 'nova_courier'
                      ? 'Нова Пошта (кур\'єром)'
                      : shipping.method === 'own_courier'
                      ? 'Власна доставка (Київ)'
                      : shipping.method)
                  : 'Не вказано';

                // Format payment method
                const paymentMethodText = "Оплата при отриманні";

                console.log("Preparing customer email...");
                console.log("Customer email data:", {
                  email: customer.email,
                  name: customer.fullName,
                  phone: customer.phone,
                  orderId: orderId,
                  itemsCount: emailItems.length,
                });

                // Send customer confirmation email
                const customerEmailResult = await sendOrderConfirmationEmail({
                  customerEmail: customer.email,
                  customerName: customer.fullName,
                  customerPhone: customer.phone,
                  orderId: orderId,
                  orderDate: new Date(),
                  orderTotal: amount,
                  orderItems: emailItems,
                  shippingAddress: emailShippingAddress || "Не вказано",
                  shippingMethod: shippingMethodText,
                  paymentMethod: paymentMethodText,
                  orderNotes: notes || null,
                  emailjsServiceId,
                  emailjsTemplateIdCustomer,
                  emailjsPublicKey,
                  emailjsPrivateKey, // Pass private key for server-side REST API
                });

                console.log("Customer email result:", JSON.stringify(customerEmailResult, null, 2));
                if (customerEmailResult.success) {
                  console.log("✓ Customer confirmation email sent (cash order)");
                } else {
                  console.error("✗ Failed to send customer email:", customerEmailResult.error);
                  console.error("Full error:", JSON.stringify(customerEmailResult, null, 2));
                }

                console.log("Preparing admin email...");
                console.log("Admin email data:", {
                  adminEmails: adminEmails.split(",").map((e: string) => e.trim()),
                  customerName: customer.fullName,
                  orderId: orderId,
                });

                // Send admin notification email
                const orderNotes = notes || null;
                console.log("=== ADMIN EMAIL NOTES DEBUG (EXPRESS) ===");
                console.log("notes (from request):", notes);
                console.log("Final orderNotes:", orderNotes);
                
                const adminEmailResult = await sendOrderNotificationEmail({
                  adminEmails: adminEmails.split(",").map((e: string) => e.trim()),
                  customerName: customer.fullName,
                  customerEmail: customer.email,
                  customerPhone: customer.phone,
                  orderId: orderId,
                  orderTotal: amount,
                  orderItems: emailItems,
                  shippingAddress: emailShippingAddress || "Не вказано",
                  shippingCity: shipping?.city || null,
                  shippingDepartment: shipping?.department || null,
                  shippingMethod: shipping?.method || null,
                  paymentMethod: paymentMethodText,
                  notes: orderNotes || '', // Pass notes as empty string if null
                  emailjsServiceId,
                  emailjsTemplateIdAdmin,
                  emailjsPublicKey,
                  emailjsPrivateKey, // Pass private key for server-side REST API
                });

                console.log("Admin email result:", JSON.stringify(adminEmailResult, null, 2));
                if (adminEmailResult.success) {
                  console.log("✓ Admin notification email sent (cash order)");
                } else {
                  console.error("✗ Failed to send admin email:", adminEmailResult.error);
                  console.error("Full error:", JSON.stringify(adminEmailResult, null, 2));
                }
                console.log("=== EMAIL SENDING DEBUG END ===");
              } else {
                console.log("=== EMAILJS NOT CONFIGURED -> USING DEV MAILER (ETHEREAL) ===");
                const devResult = await sendDevOrderEmails({
                  adminEmails: (adminEmails || "").split(",").map((e: string) => e.trim()).filter(Boolean),
                  customerEmail: customer.email,
                  customerName: customer.fullName,
                  customerPhone: customer.phone,
                  orderId: orderId,
                  orderTotal: amount,
                  orderItems: emailItems,
                  shippingAddress: emailShippingAddress || "Не вказано",
                  shippingMethod: shippingMethodText,
                  paymentMethod: paymentMethodText,
                  notes: notes || null,
                });
                console.log("Dev mailer result:", devResult);
                console.log("Customer preview URL:", devResult.customer.previewUrl);
                console.log("Admin preview URLs:", devResult.admin.previewUrls);
                console.log("=== EMAIL SENDING DEBUG END ===");
              }
            } catch (emailError: any) {
              console.error("✗ Error sending emails:", emailError);
              console.error("Email error message:", emailError?.message);
              console.error("Email error stack:", emailError?.stack);
              // Don't fail the order if email fails
            }
          } else {
            console.log("⚠ Email sending skipped - conditions not met:", {
              hasInsertedItems: !!insertedItems,
              insertedItemsLength: insertedItems?.length,
              hasCustomerEmail: !!customer?.email,
            });
          }
        }
      }

      // For cash payments, return success immediately
      // Include email status in response for debugging
      const emailStatus = insertedItems && insertedItems.length > 0 && customer?.email
        ? {
            attempted: true,
            configured: resolveEmailJSConfig().configured,
          }
        : {
            attempted: false,
            reason: !insertedItems || insertedItems.length === 0 ? "insertedItems missing or empty" : !customer?.email ? "customer.email missing" : "unknown",
          };

      return res.json({ 
        success: true, 
        orderId,
        paymentMethod: 'cash',
        message: 'Order created successfully. Payment will be collected upon delivery.',
        emailStatus, // Include email status for debugging
      });
    }

    // For online payments, prepare LiqPay payment
    const publicKey = process.env.LIQPAY_PUBLIC_KEY || process.env.VITE_LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    
    // Debug logging
    console.log('LiqPay Keys Check:', {
      hasPublicKey: !!publicKey,
      hasPrivateKey: !!privateKey,
      publicKeyLength: publicKey?.length,
      privateKeyLength: privateKey?.length
    });
    
    if (!publicKey || !privateKey) {
      return res.status(500).json({ error: 'LiqPay keys are not configured' });
    }

    const description = items.map((it: any) => `${it.name}${it.variant ? ` (${it.variant})` : ''} x${it.quantity}`).join(', ');

    // Determine paytypes based on payment method
    let paytypes = 'card';
    if (paymentMethod === 'apple_pay') {
      paytypes = 'applepay';
    } else if (paymentMethod === 'google_pay') {
      paytypes = 'googlepay';
    }

    // Store order data temporarily in Supabase pending_orders table
    // This allows us to retrieve it when payment is confirmed
    const orderData = {
      orderId,
      customer,
      shipping: {
        ...shipping,
        address: shippingAddress,
      },
      items,
      notes,
      amount,
    };

    // Save to pending_orders table temporarily
    const supabase = getSupabaseClient();
    const { error: pendingError } = await supabase
      .from("pending_orders")
      .insert({
        order_id: orderId,
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        total_price: amount,
        currency: "UAH",
        notes: notes || null,
        order_data: orderData,
      });

    if (pendingError) {
      console.error("Error saving to pending_orders:", pendingError);
    } else {
      console.log(`Order ${orderId} saved to pending_orders temporarily`);
    }

    // Also store in info field as backup
    const orderDataJson = JSON.stringify(orderData);
    const orderDataBase64 = base64(orderDataJson);

    const params = {
      version: 3,
      public_key: publicKey,
      action: 'pay',
      amount,
      currency: 'UAH',
      description: `Замовлення ${orderId} — THE COFFEE MANIFEST`,
      order_id: orderId,
      result_url: `${req.protocol}://${req.get('host')}/basket?payment=return`,
      language: 'uk',
      paytypes,
      sandbox: process.env.VITE_LIQPAY_SANDBOX === 'true' ? 1 : undefined,
      info: orderDataBase64, // Store full order data for callback
    } as Record<string, any>;

    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

    const data = base64(JSON.stringify(params));
    const signature = sign(data, privateKey);

    res.json({ data, signature, orderId, paymentMethod });
  } catch (err: any) {
    console.error('prepareOrder error', err);
    res.status(500).json({ error: err?.message || 'Failed to prepare order' });
  }
};


