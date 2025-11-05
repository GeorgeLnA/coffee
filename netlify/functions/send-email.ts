import type { Handler } from "@netlify/functions";

/**
 * Helper function to send emails via EmailJS REST API
 * This is called from other Netlify functions (server-side)
 */
export async function sendEmailViaEmailJS(params: {
  serviceId: string;
  templateId: string;
  publicKey: string;
  templateParams: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { serviceId, templateId, publicKey, templateParams } = params;

    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    const response = await fetch(emailjsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS API error:", errorText);
      return {
        success: false,
        error: `EmailJS API error: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
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
  } = params;

  // Format order date (Ukrainian format: DD.MM.YYYY)
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Generate HTML for order items (only use data we have)
  const generateOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return '<p style="color: #000000; font-size: 15px;">Товари не знайдено</p>';
    }

    return items.map((item) => {
      // Only use data that exists
      const itemName = item.name || 'Невідомий товар';
      const itemImage = item.image || 'https://coffeemanifest.com.ua/wp-content/uploads/2024/03/logo_manifest.png';
      const itemQuantity = item.quantity || 1;
      const itemPrice = item.price || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant ? ` - ${item.variant}` : '';
      
      // Escape HTML to prevent XSS
      const escapeHtml = (text: string): string => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };
      
      const safeName = escapeHtml(itemName);
      const safeImage = escapeHtml(itemImage);
      
      return `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" valign="middle" style="border: 0 hidden; border-collapse: collapse; font-size: 0; margin-bottom: 10px;">
          <tr>
            <td valign="middle" style="display: inline-block; overflow: hidden; width: 100px;" width="100">
              <table border="0" cellpadding="0" cellspacing="0" valign="middle" style="max-width: 100%; border-collapse: collapse; width: 100%;" width="100%">
                <tr>
                  <td valign="middle" style="max-width: 100%; overflow: hidden;">
                    <img width="100%" alt="${safeName}" src="${safeImage}" style="border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; background-color: transparent; max-width: 100%; vertical-align: middle; width: 100%;" border="0">
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle" style="display: inline-block; overflow: hidden; width: 268px;" width="268">
              <table border="0" cellpadding="0" cellspacing="0" valign="middle" style="max-width: 100%; width: 100%; border-collapse: collapse; line-height: 150%; font-size: 15px;" width="100%">
                <tr>
                  <td valign="middle" style="max-width: 100%; overflow: hidden; font-size: 0; padding: 0; width: 15px;" width="15"></td>
                  <td valign="middle" style="max-width: 100%; overflow: hidden;">
                    <span style="max-width: 100%; box-sizing: border-box; font-size: 16px; font-weight: 400; font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif; color: #000000; line-height: 25px;">${safeName}${variantText ? ` - ${escapeHtml(item.variant)}` : ''}</span>
                    <p style="max-width: 100%; box-sizing: border-box; display: block; margin: 0; font-size: 18px; font-weight: 600; font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif; color: #000000; line-height: 30px;">x ${itemQuantity}</p>
                    <p style="max-width: 100%; box-sizing: border-box; display: block; margin: 0; font-size: 22px; font-weight: 600; font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif; color: #000000; line-height: 30px;">
                      <span style="max-width: 100%; color: inherit; box-sizing: border-box;">${itemPrice.toFixed(2)}&nbsp;<span style="max-width: 100%; color: inherit; box-sizing: border-box;">грн</span></span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }).join('');
  };

  // Format shipping method
  const shippingMethodText = shippingMethod 
    ? (shippingMethod === 'nova_department' 
        ? 'Нова Пошта (на відділення)' 
        : shippingMethod === 'nova_postomat'
        ? 'Нова Пошта (на поштомат)'
        : shippingMethod === 'nova_courier'
        ? 'Нова Пошта (кур\'єром)'
        : shippingMethod === 'own_courier'
        ? 'Власна доставка'
        : shippingMethod)
    : 'Не вказано';

  // Format payment method
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
    billing_address: shippingAddress, // For billing, we use shipping address
    customer_phone: customerPhone,
    customer_email: customerEmail,
    shipping_address: shippingAddress || 'Не вказано',
    order_notes: orderNotes || '—',
    order_total: `₴${orderTotal.toFixed(2)}`,
    shipping_method: shippingMethodText,
    payment_method: paymentMethodText,
  };

  return sendEmailViaEmailJS({
    serviceId: emailjsServiceId,
    templateId: emailjsTemplateIdCustomer,
    publicKey: emailjsPublicKey,
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
  } = params;

  // Generate HTML for order items (admin email uses table format)
  const generateAdminOrderItemsHTML = (items: typeof orderItems): string => {
    if (!items || items.length === 0) {
      return '<tr><td colspan="3" style="color: #636363; padding: 8px 12px;">Товари не знайдено</td></tr>';
    }

    return items.map((item, index) => {
      const itemName = item.name || 'Невідомий товар';
      const itemImage = item.image || 'https://coffeemanifest.com.ua/wp-content/uploads/2024/03/logo_manifest.png';
      const itemQuantity = item.quantity || 1;
      const itemPrice = Number(item.price) || 0;
      const itemTotal = (itemPrice * itemQuantity).toFixed(2);
      const variantText = item.variant || '';
      // Determine variant display: "В зернах" or "Мелена"
      let variantDisplay = '';
      if (variantText) {
        const variantLower = variantText.toLowerCase();
        if (variantLower.includes('зернах') || variantLower.includes('beans') || variantLower === 'в зернах') {
          variantDisplay = 'В зернах';
        } else if (variantLower.includes('мелен') || variantLower.includes('молот') || variantLower.includes('grounded') || variantLower === 'мелена') {
          variantDisplay = 'Мелена';
        } else {
          variantDisplay = variantText; // Use as-is if unclear
        }
      }
      
      // Escape HTML
      const escapeHtml = (text: string): string => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };
      
      const safeName = escapeHtml(itemName);
      const safeImage = escapeHtml(itemImage);
      const isLast = index === items.length - 1;
      const borderBottom = isLast ? 'border-bottom: 1px solid rgba(0,0,0,.2); padding-bottom: 24px;' : 'border-bottom: 1px solid rgba(0,0,0,.2); padding-bottom: 24px;';
      
      return `
        <tr>
          <td style="color: #636363; border: 0; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; text-align: left; padding: 8px 12px; padding-left: 0; vertical-align: middle; word-wrap: break-word; ${borderBottom}" align="left">
            <table style="color: #3c3c3c; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;">
              <tr>
                <td style="vertical-align: middle; padding-left: 0; border-bottom: 1px solid rgba(0,0,0,.2); padding-bottom: 24px; border: 0; padding: 0;">
                  <img width="48" height="48" src="${safeImage}" alt="${safeName}" style="border: none; display: inline-block; font-size: 14px; font-weight: bold; height: auto; outline: none; text-decoration: none; text-transform: capitalize; vertical-align: middle; margin-right: 24px; max-width: 100%;" border="0">
                </td>
                <td style="vertical-align: middle; padding-right: 0; border-bottom: 1px solid rgba(0,0,0,.2); padding-bottom: 24px; border: 0; padding: 0;">
                  ${safeName}
                  ${variantText ? `<div style="color: #3c3c3c; font-size: 14px; line-height: 140%;"><span>Тип:</span> ${escapeHtml(variantDisplay)}</div>` : ''}
                </td>
              </tr>
            </table>
          </td>
          <td style="color: #636363; border: 0; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; text-align: right; padding: 8px 12px; vertical-align: middle; ${borderBottom}" align="right">
            ×${itemQuantity}
          </td>
          <td style="color: #636363; border: 0; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; text-align: right; padding: 8px 12px; padding-right: 0; vertical-align: middle; ${borderBottom}" align="right">
            <span>${itemTotal}&nbsp;<span>₴</span></span>
          </td>
        </tr>
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

  // Format shipping details
  let shippingDetails = shippingAddress;
  if (shippingCity) {
    shippingDetails = `${shippingCity}, ${shippingDetails}`;
  }
  if (shippingDepartment) {
    const departmentType =
      shippingMethod === "nova_postomat" ? "Поштомат" : "Відділення";
    shippingDetails += ` (${departmentType} №${shippingDepartment})`;
  }

  // Format payment method
  const paymentMethodText =
    paymentMethod === "cash"
      ? "Готівкою"
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

  // Send to all admin emails
  const results = await Promise.all(
    emailArray.map((adminEmail) =>
      sendEmailViaEmailJS({
        serviceId: emailjsServiceId,
        templateId: emailjsTemplateIdAdmin,
        publicKey: emailjsPublicKey,
        templateParams: {
          to_email: adminEmail,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          order_id: orderId,
          order_date: formatDate(orderId),
          order_items_html: generateAdminOrderItemsHTML(orderItems),
          order_items: itemsList, // Text version for simple templates
          billing_address: shippingDetails,
          shipping_address: shippingDetails,
          shipping_method: shippingMethod || 'Не вказано',
          shipping_cost: shippingMethod ? 'За тарифами перевізника' : '—',
          order_total: `₴${orderTotal.toFixed(2)}`,
          payment_method: paymentMethodText,
          notes: notes || "—",
        },
      })
    )
  );

  // Return success if at least one email was sent
  const success = results.some((r) => r.success);
  const errors = results.filter((r) => !r.success).map((r) => r.error);

  return {
    success,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

