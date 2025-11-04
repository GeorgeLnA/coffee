import { RequestHandler } from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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

      console.log('✓ Cash order saved:', {
        orderId: orderData.id,
        shipping_department: orderData.shipping_department,
        payment_method: orderData.payment_method,
      });

      // Save order items with variant
      if (orderData) {
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

        const { data: insertedItems, error: itemsError } = await supabase
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
          console.log(`✓ Saved ${orderItems.length} order items with variants`);
          console.log("Inserted items:", insertedItems?.map((it: any) => ({ variant: it.variant })));
        }
      }

      // For cash payments, return success immediately
      return res.json({ 
        success: true, 
        orderId,
        paymentMethod: 'cash',
        message: 'Order created successfully. Payment will be collected upon delivery.'
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


