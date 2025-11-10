import type { Handler } from "@netlify/functions";

/**
 * Helper function to send emails via EmailJS REST API
 * This is called from other Netlify functions (server-side)
 * Uses private key for server-side REST API calls
 */
function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = String(email).trim();
  if (!trimmed) return null;
  return trimmed;
}

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = sanitizeEmail(email);
  if (!trimmed) return false;
  // Simple validation (same as many front-end checks)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export async function sendEmailViaEmailJS(params: {
  serviceId: string;
  templateId: string;
  publicKey: string; // Keep for backward compatibility, but use privateKey if available
  privateKey?: string; // Optional private key for server-side REST API
  templateParams: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { serviceId, templateId, publicKey, privateKey, templateParams } = params;
    const toEmailRaw = templateParams?.to_email;
    const toEmailSanitized = sanitizeEmail(toEmailRaw);
    if (!isValidEmail(toEmailSanitized)) {
      const errMsg = `Invalid recipient email: "${toEmailRaw ?? ""}"`;
      console.error(errMsg);
      return { success: false, error: errMsg };
    }
    templateParams.to_email = toEmailSanitized;

    // For server-side REST API, EmailJS expects public key in user_id and private key in accessToken
    const keyType = privateKey ? "PRIVATE+PUBLIC" : "PUBLIC_ONLY";

    console.log("=== EMAILJS DEBUG START ===");
    console.log("Service ID:", serviceId);
    console.log("Template ID:", templateId);
    console.log(`API Key type: ${keyType}`);
    console.log("Public Key (first 4):", publicKey?.substring(0, 4) + "...");
    console.log("Private Key present:", !!privateKey);
    console.log("Template Params keys:", Object.keys(templateParams));
    console.log("To email:", templateParams.to_email);
    console.log("Order ID:", templateParams.order_id);
    console.log("Full template params (sanitized):", {
      ...templateParams,
      order_items_html: templateParams.order_items_html ? '[HTML content]' : undefined,
      order_items: templateParams.order_items ? '[Text content]' : undefined,
    });

    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    const requestBody: Record<string, any> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey, // Always send public key here
      template_params: templateParams,
    };
    if (privateKey) {
      requestBody.accessToken = privateKey; // Server-side requires private key here
    }

    console.log("Request URL:", emailjsUrl);
    console.log("Request body (sanitized):", {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey?.substring(0, 4) + "...",
      accessToken_present: !!privateKey,
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
    console.log("Response text (first 500 chars):", responseText.substring(0, 500));
    console.log("Response text length:", responseText.length);

    if (!response.ok) {
      console.error("=== EMAILJS API ERROR ===");
      console.error("Status:", response.status);
      console.error("Status Text:", response.statusText);
      console.error("Response Body:", responseText);
      console.error("Full response headers:", Object.fromEntries(response.headers.entries()));
      console.error("=== END EMAILJS API ERROR ===");
      return {
        success: false,
        error: `EmailJS API error: ${response.status} ${responseText.substring(0, 200)}`,
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log("Parsed response:", JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.warn("Failed to parse response as JSON:", parseError);
      result = { raw: responseText.substring(0, 200) };
    }
    console.log("Email sent successfully:", JSON.stringify(result, null, 2));
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

const WEIGHT_IMAGE_SOURCES: Record<number, string[]> = {
  250: [
    'https://umynzgzlqdphgrzixhsc.supabase.co/storage/v1/object/public/media/coffee/1761665796405-250gr.png',
    'https://manifestcoffee.com.ua/1761665796405-250gr.png',
    'https://manifestcoffee.com.ua/manifest-site-logo.png',
  ],
  500: [
    'https://umynzgzlqdphgrzixhsc.supabase.co/storage/v1/object/public/media/coffee/sizes/1761665813027-500gr.png',
    'https://manifestcoffee.com.ua/1761665813027-500gr.png',
    'https://manifestcoffee.com.ua/manifest-site-logo.png',
  ],
  1000: [
    'https://umynzgzlqdphgrzixhsc.supabase.co/storage/v1/object/public/media/coffee/sizes/1761665827913-1000gr.png',
    'https://manifestcoffee.com.ua/1761665827913-1000gr.png',
    'https://manifestcoffee.com.ua/manifest-site-logo.png',
  ],
};

const DEFAULT_WEIGHT_GRAMS = 250;

function normalizeNumber(value: number): number {
  if (value <= 0 || Number.isNaN(value)) return DEFAULT_WEIGHT_GRAMS;
  if (value < 300) return 250;
  if (value < 800) return 500;
  return 1000;
}

function normalizeWeightToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[‐‑‒–—―]/g, '-') // normalize dashes
    .replace(/кг|к\.г\.?|кілограм(и|ів)?|килограмм(ы)?/g, 'kg')
    .replace(/грам(и|ів|мів|м|мів)?|гр\.?|г\b|г\./g, 'g')
    .replace(/,/g, '.')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseWeightFromText(source: string | null | undefined): number | null {
  if (!source) return null;
  const normalized = normalizeWeightToken(source);

  const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) {
    const kgValue = parseFloat(kgMatch[1]);
    if (!Number.isNaN(kgValue)) {
      return Math.round(kgValue * 1000);
    }
  }

  const gMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g\b/);
  if (gMatch) {
    const gValue = parseFloat(gMatch[1]);
    if (!Number.isNaN(gValue)) {
      return Math.round(gValue);
    }
  }

  const standaloneNumber = normalized.match(/(\d+(?:\.\d+)?)/);
  if (standaloneNumber) {
    const numericValue = parseFloat(standaloneNumber[1]);
    if (!Number.isNaN(numericValue)) {
      if (normalized.includes('kg')) {
        return Math.round(numericValue * 1000);
      }
      if (numericValue <= 5 && normalized.includes('0.') && normalized.includes('kg')) {
        return Math.round(numericValue * 1000);
      }
      if (numericValue > 10 && numericValue < 2000) {
        return Math.round(numericValue);
      }
      if (numericValue === 1 && normalized.includes('kg')) {
        return 1000;
      }
    }
  }

  return null;
}

function resolveWeightInGrams(item: { variant?: string | null; name?: string | null; product_name?: string | null; weight?: number | null; size?: string | null }): number {
  const directWeight = Number((item as any)?.weight);
  if (!Number.isNaN(directWeight) && directWeight > 0) {
    return normalizeNumber(directWeight);
  }

  const sources = [
    item.variant,
    item.name,
    (item as any)?.product_name,
    (item as any)?.option,
    (item as any)?.title,
    item.size,
  ];

  for (const source of sources) {
    const parsed = parseWeightFromText(source as string | undefined);
    if (parsed) {
      return normalizeNumber(parsed);
    }
  }

  return DEFAULT_WEIGHT_GRAMS;
}

function getWeightBasedImageUrl(item: { variant?: string | null; name?: string | null; product_name?: string | null; weight?: number | null; size?: string | null }): string {
  const weight = resolveWeightInGrams(item);
  const candidates = WEIGHT_IMAGE_SOURCES[weight] || [];
  const fallbackPool = WEIGHT_IMAGE_SOURCES[DEFAULT_WEIGHT_GRAMS] || [];
  const imageUrl = [...candidates, ...fallbackPool].find((url) => typeof url === 'string' && url.length > 0) 
    || 'https://manifestcoffee.com.ua/manifest-site-logo.png';
  console.log('Resolved weight image', {
    weight,
    variant: item.variant,
    name: item.name,
    product_name: (item as any)?.product_name,
    selectedImage: imageUrl,
  });
  return imageUrl;
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


  // Generate HTML for order items with images (table-based for email client compatibility)
  const generateOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return '<p style="color: #666; font-size: 15px;">Товари не знайдено</p>';
    }

    return items.map((item) => {
      const itemName = item.name || 'Невідомий товар';
      const itemQuantity = item.quantity || 1;
      const itemPrice = item.price || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant ? ` (${item.variant})` : '';
      
      const itemImage = getWeightBasedImageUrl(item);
      
      // Debug logging
      console.log('Email image generation:', {
        itemName,
        variant: item.variant,
        imageUrl: itemImage,
      });
      
      // Generate HTML for each item with image using table layout (email client compatible)
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0; border-bottom: 1px solid #e8e8e8;">
          <tr>
            <td style="padding: 15px 0; vertical-align: top;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="80" style="padding-right: 15px; vertical-align: top;">
                    <img src="${itemImage}" alt="${itemName}" width="80" height="80" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; display: block; border: 0;" />
                  </td>
                  <td style="vertical-align: top;">
                    <div style="font-size: 16px; font-weight: 600; color: #1f0a03; margin-bottom: 5px; line-height: 1.4;">${itemName}${variantText}</div>
                    <div style="font-size: 14px; color: #666666; margin-bottom: 5px; line-height: 1.4;">${itemQuantity} шт. × ${itemPrice.toFixed(2)} грн</div>
                    <div style="font-size: 16px; font-weight: 600; color: #361c0c; line-height: 1.4;">${itemTotal} грн</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }).join('');
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

  const sanitizedCustomerEmail = sanitizeEmail(customerEmail);
  const templateParams = {
    to_email: sanitizedCustomerEmail,
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
  adminEmails: string[] | string; // Can be multiple emails (comma-separated or array)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  orderTotal: number;
  orderItems: Array<{ name: string; quantity: number; price: number; variant?: string; image?: string | null }>;
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


  // Generate HTML for order items with images (admin email - same as customer)
  const generateAdminOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return '<p style="color: #666; font-size: 15px;">Товари не знайдено</p>';
    }

    return items.map((item) => {
      const itemName = item.name || 'Невідомий товар';
      const itemQuantity = item.quantity || 1;
      const itemPrice = Number(item.price) || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant ? ` (${item.variant})` : '';
      
      const itemImage = getWeightBasedImageUrl(item);
      
      // Debug logging
      console.log('Admin email image generation:', {
        itemName,
        variant: item.variant,
        imageUrl: itemImage,
      });
      
      // Generate HTML for each item with image using table layout (email client compatible)
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0; border-bottom: 1px solid #e8e8e8;">
          <tr>
            <td style="padding: 15px 0; vertical-align: top;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="80" style="padding-right: 15px; vertical-align: top;">
                    <img src="${itemImage}" alt="${itemName}" width="80" height="80" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; display: block; border: 0;" />
                  </td>
                  <td style="vertical-align: top;">
                    <div style="font-size: 16px; font-weight: 600; color: #1f0a03; margin-bottom: 5px; line-height: 1.4;">${itemName}${variantText}</div>
                    <div style="font-size: 14px; color: #666666; margin-bottom: 5px; line-height: 1.4;">${itemQuantity} шт. × ${itemPrice.toFixed(2)} грн</div>
                    <div style="font-size: 16px; font-weight: 600; color: #361c0c; line-height: 1.4;">${itemTotal} грн</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }).join('');
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
  const emailArray = (Array.isArray(adminEmails)
    ? adminEmails
    : adminEmails.split(","))
    .map((e) => sanitizeEmail(e))
    .filter((e): e is string => !!e && isValidEmail(e));

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
        to_email: sanitizeEmail(adminEmail),
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

