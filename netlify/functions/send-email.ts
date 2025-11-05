import type { Handler } from "@netlify/functions";

/**
 * Helper function to send emails via EmailJS REST API
 * This is called from other Netlify functions (server-side)
 * Uses private key for server-side REST API calls
 */
export async function sendEmailViaEmailJS(params: {
  serviceId: string;
  templateId: string;
  publicKey: string; // Keep for backward compatibility, but use privateKey if available
  privateKey?: string; // Optional private key for server-side REST API
  templateParams: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { serviceId, templateId, publicKey, privateKey, templateParams } = params;

    // Use private key for server-side REST API if available, otherwise fall back to public key
    const apiKey = privateKey || publicKey;
    const keyType = privateKey ? "PRIVATE" : "PUBLIC";

    console.log("=== EMAILJS DEBUG START ===");
    console.log("Service ID:", serviceId);
    console.log("Template ID:", templateId);
    console.log(`API Key type: ${keyType}`);
    console.log("API Key (first 4):", apiKey?.substring(0, 4) + "...");
    console.log("API Key length:", apiKey?.length);
    console.log("Template Params keys:", Object.keys(templateParams));
    console.log("To email:", templateParams.to_email);
    console.log("Order ID:", templateParams.order_id);

    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    const requestBody = {
      service_id: serviceId,
      template_id: templateId,
      user_id: apiKey, // Use private key for server-side if available
      template_params: templateParams,
    };

    console.log("Request URL:", emailjsUrl);
    console.log("Request body (sanitized):", {
      service_id: serviceId,
      template_id: templateId,
      user_id: apiKey?.substring(0, 4) + "...",
      template_params_keys: Object.keys(templateParams),
    });

    const response = await fetch(emailjsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response text:", responseText);

    if (!response.ok) {
      console.error("EmailJS API error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      return {
        success: false,
        error: `EmailJS API error: ${response.status} ${responseText}`,
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }
    console.log("Email sent successfully:", result);
    console.log("=== EMAILJS DEBUG END ===");
    return { success: true };
  } catch (error: any) {
    console.error("=== EMAILJS ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Full error:", error);
    console.error("=== EMAILJS ERROR END ===");
    return {
      success: false,
      error: error.message || "Unknown error sending email",
    };
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  orderDate: Date | string;
  orderTotal: number;
  orderItems: Array<{ 
    name: string; 
    quantity: number; 
    price: number; 
    image?: string | null;
    variant?: string | null;
  }>;
  shippingAddress: string;
  shippingMethod?: string;
  paymentMethod: string;
  orderNotes?: string | null;
  emailjsServiceId: string;
  emailjsTemplateIdCustomer: string;
  emailjsPublicKey: string;
  emailjsPrivateKey?: string; // Optional private key for server-side REST API
}): Promise<{ success: boolean; error?: string }> {
  const {
    customerEmail,
    customerName,
    customerPhone,
    orderId,
    orderDate,
    orderTotal,
    orderItems,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    orderNotes,
    emailjsServiceId,
    emailjsTemplateIdCustomer,
    emailjsPublicKey,
    emailjsPrivateKey,
  } = params;

  // Format order date (Ukrainian format: DD.MM.YYYY)
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Generate simple text for order items (no HTML, just plain text)
  const generateOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return 'Товари не знайдено';
    }

    return items.map((item) => {
      const itemName = item.name || 'Невідомий товар';
      const itemQuantity = item.quantity || 1;
      const itemPrice = item.price || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant ? ` (${item.variant})` : '';
      return `${itemName}${variantText} - ${itemQuantity} шт. × ${itemPrice.toFixed(2)} грн = ${itemTotal} грн`;
    }).join('\n');
  };

  // Format shipping method (handle both raw method codes and pre-formatted strings)
  const shippingMethodText = shippingMethod 
    ? (shippingMethod === 'nova_department' 
        ? 'Нова Пошта (на відділення)' 
        : shippingMethod === 'nova_postomat'
        ? 'Нова Пошта (на поштомат)'
        : shippingMethod === 'nova_courier'
        ? 'Нова Пошта (кур\'єром)'
        : shippingMethod === 'own_courier'
        ? 'Власна доставка (Київ)'
        : shippingMethod) // Use as-is if already formatted
    : 'Не вказано';

  // Format payment method (handle both raw codes and pre-formatted strings)
  const paymentMethodText =
    paymentMethod === "cash"
      ? "Оплата при отриманні"
      : paymentMethod === "liqpay"
      ? "Онлайн оплата (LiqPay)"
      : paymentMethod || "Онлайн оплата";

  const templateParams = {
    to_email: customerEmail,
    to_name: customerName,
    order_id: orderId,
    order_date: formatDate(orderDate),
    order_items_html: generateOrderItemsHTML(orderItems),
    customer_name: customerName,
    billing_address: shippingAddress, // For billing, we use shipping address (displayed as "Information")
    information: shippingAddress, // Alias for "Information" label
    customer_phone: customerPhone,
    customer_email: customerEmail,
    shipping_address: shippingAddress || 'Не вказано',
    order_notes: orderNotes || '', // Leave empty if no notes
    order_total: `₴${orderTotal.toFixed(2)}`,
    shipping_method: shippingMethodText,
    payment_method: paymentMethodText,
  };

  return sendEmailViaEmailJS({
    serviceId: emailjsServiceId,
    templateId: emailjsTemplateIdCustomer,
    publicKey: emailjsPublicKey,
    privateKey: emailjsPrivateKey, // Pass private key for server-side REST API
    templateParams,
  });
}

/**
 * Send order notification email to admin
 */
export async function sendOrderNotificationEmail(params: {
  adminEmails: string[]; // Can be multiple emails (comma-separated or array)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  orderTotal: number;
  orderItems: Array<{ name: string; quantity: number; price: number; variant?: string }>;
  shippingAddress: string;
  shippingCity?: string;
  shippingDepartment?: string;
  shippingMethod?: string;
  paymentMethod: string;
  notes?: string;
  emailjsServiceId: string;
  emailjsTemplateIdAdmin: string;
  emailjsPublicKey: string;
  emailjsPrivateKey?: string; // Optional private key for server-side REST API
}): Promise<{ success: boolean; error?: string }> {
  const {
    adminEmails,
    customerName,
    customerEmail,
    customerPhone,
    orderId,
    orderTotal,
    orderItems,
    shippingAddress,
    shippingCity,
    shippingDepartment,
    shippingMethod,
    paymentMethod,
    notes,
    emailjsServiceId,
    emailjsTemplateIdAdmin,
    emailjsPublicKey,
    emailjsPrivateKey,
  } = params;

  // Generate simple text for order items (admin email - same as customer, just plain text)
  const generateAdminOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return 'Товари не знайдено';
    }

    return items.map((item) => {
      const itemName = item.name || 'Невідомий товар';
      const itemQuantity = item.quantity || 1;
      const itemPrice = Number(item.price) || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant ? ` (${item.variant})` : '';
      return `${itemName}${variantText} - ${itemQuantity} шт. × ${itemPrice.toFixed(2)} грн = ${itemTotal} грн`;
    }).join('\n');
  };

  // Format order items for email (text version for simple templates)
  const itemsList = orderItems
    .map((item) => {
      const variantText = item.variant ? ` (${item.variant})` : "";
      return `${item.name}${variantText} x${item.quantity} - ₴${(item.price * item.quantity).toFixed(2)}`;
    })
    .join("\n");

  // Use shipping address directly (already formatted by caller)
  // Only rebuild if shippingAddress is empty but we have city/department
  let shippingDetails = shippingAddress || 'Не вказано';
  if (!shippingAddress && (shippingCity || shippingDepartment)) {
    // Fallback: rebuild only if shippingAddress wasn't provided
    shippingDetails = shippingCity || '';
    if (shippingDepartment) {
      const departmentType =
        shippingMethod === "nova_postomat" ? "Поштомат" : "Відділення";
      shippingDetails += shippingDetails ? `, ${departmentType} №${shippingDepartment}` : `${departmentType} №${shippingDepartment}`;
    }
    if (!shippingDetails) {
      shippingDetails = 'Не вказано';
    }
  }

  // Format shipping method (handle both raw method codes and pre-formatted strings)
  const shippingMethodText = shippingMethod 
    ? (shippingMethod === 'nova_department' 
        ? 'Нова Пошта (на відділення)' 
        : shippingMethod === 'nova_postomat'
        ? 'Нова Пошта (на поштомат)'
        : shippingMethod === 'nova_courier'
        ? 'Нова Пошта (кур\'єром)'
        : shippingMethod === 'own_courier'
        ? 'Власна доставка (Київ)'
        : shippingMethod) // Use as-is if already formatted
    : 'Не вказано';

  // Format payment method (handle both raw codes and pre-formatted strings)
  const paymentMethodText =
    paymentMethod === "cash"
      ? "Оплата при отриманні"
      : paymentMethod === "liqpay"
      ? "Онлайн оплата (LiqPay)"
      : paymentMethod || "Онлайн оплата";

  // Format order date (Ukrainian format: DD.MM.YYYY)
  const formatDate = (orderId: string): string => {
    // Try to extract date from orderId (timestamp) or use current date
    try {
      const timestamp = parseInt(orderId.substring(0, 13));
      if (!isNaN(timestamp)) {
        const d = new Date(timestamp);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const months = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня', 'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];
        return `${day} ${months[d.getMonth()]}, ${year}`;
      }
    } catch {}
    // Fallback to current date
    const d = new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const months = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня', 'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];
    return `${day} ${months[d.getMonth()]}, ${year}`;
  };

  // Handle multiple admin emails (comma-separated string or array)
  const emailArray = Array.isArray(adminEmails)
    ? adminEmails
    : adminEmails.split(",").map((e) => e.trim()).filter(Boolean);

  // Debug logging for notes
  console.log("=== ADMIN EMAIL NOTES DEBUG (sendOrderNotificationEmail) ===");
  console.log("notes parameter:", notes);
  console.log("notes type:", typeof notes);
  console.log("notes length:", notes?.length || 0);
  console.log("notes truthy:", !!notes);

  // Send to all admin emails
  const results = await Promise.all(
    emailArray.map((adminEmail) => {
      const templateParams = {
        to_email: adminEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        order_id: orderId,
        order_date: formatDate(orderId),
        order_items_html: generateAdminOrderItemsHTML(orderItems),
        order_items: itemsList, // Text version for simple templates
        billing_address: shippingDetails,
        information: shippingDetails, // Alias for "Information" label
        shipping_address: shippingDetails,
        shipping_method: shippingMethod || 'Не вказано',
        shipping_cost: shippingMethod ? 'За тарифами перевізника' : '—',
        order_total: `₴${orderTotal.toFixed(2)}`,
        payment_method: paymentMethodText,
        notes: notes || '', // Leave empty if no notes
        order_notes: notes || '', // Also include as order_notes for compatibility
      };
      
      console.log(`[Admin Email ${adminEmail}] Template params notes:`, templateParams.notes);
      console.log(`[Admin Email ${adminEmail}] Template params order_notes:`, templateParams.order_notes);
      
      return sendEmailViaEmailJS({
        serviceId: emailjsServiceId,
        templateId: emailjsTemplateIdAdmin,
        publicKey: emailjsPublicKey,
        privateKey: emailjsPrivateKey, // Pass private key for server-side REST API
        templateParams,
      });
    })
  );

  // Return success if at least one email was sent
  const success = results.some((r) => r.success);
  const errors = results.filter((r) => !r.success).map((r) => r.error);

  return {
    success,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

