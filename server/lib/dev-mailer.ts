import nodemailer from "nodemailer";

export type DevOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  variant?: string | null;
};

export async function sendDevOrderEmails(params: {
  adminEmails: string[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  orderId: string;
  orderTotal: number;
  orderItems: DevOrderItem[];
  shippingAddress: string;
  shippingMethod?: string | null;
  paymentMethod: string;
  notes?: string | null;
}): Promise<{
  transport: "ethereal";
  customer: { success: boolean; previewUrl?: string; error?: string };
  admin: { success: boolean; previewUrls: string[]; errors: string[] };
}> {
  const {
    adminEmails,
    customerEmail,
    customerName,
    customerPhone,
    orderId,
    orderTotal,
    orderItems,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    notes,
  } = params;

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const itemsHtml = orderItems
    .map((item) => {
      const total = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
      const variant = item.variant ? ` (${item.variant})` : "";
      return `<li>${escapeHtml(item.name)}${variant} ×${item.quantity} — ₴${total}</li>`;
    })
    .join("");

  const commonHtml = `
    <p><strong>Замовлення:</strong> #${escapeHtml(orderId)}</p>
    <p><strong>Сума:</strong> ₴${orderTotal.toFixed(2)}</p>
    <p><strong>Клієнт:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})${customerPhone ? `, ${escapeHtml(customerPhone)}` : ""}</p>
    <p><strong>Доставка:</strong> ${escapeHtml(shippingAddress || "Не вказано")} ${shippingMethod ? `— ${escapeHtml(shippingMethod)}` : ""}</p>
    <p><strong>Оплата:</strong> ${escapeHtml(paymentMethod)}</p>
    ${notes ? `<p><strong>Коментар:</strong> ${escapeHtml(notes)}</p>` : ""}
    <p><strong>Товари:</strong></p>
    <ul>${itemsHtml}</ul>
  `;

  // Customer email
  let customerPreviewUrl: string | undefined;
  let customerError: string | undefined;
  try {
    const info = await transporter.sendMail({
      from: 'THE COFFEE MANIFEST <no-reply@manifest.test>',
      to: customerEmail,
      subject: `Підтвердження замовлення #${orderId}`,
      html: `
        <h2>Дякуємо за замовлення!</h2>
        ${commonHtml}
      `,
    });
    customerPreviewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  } catch (err: any) {
    customerError = err?.message || String(err);
  }

  // Admin emails
  const adminPreviewUrls: string[] = [];
  const adminErrors: string[] = [];
  for (const adminEmail of adminEmails) {
    if (!adminEmail) continue;
    try {
      const info = await transporter.sendMail({
        from: 'Store Bot <no-reply@manifest.test>',
        to: adminEmail,
        subject: `Нове замовлення #${orderId}`,
        html: `
          <h2>Нове замовлення</h2>
          ${commonHtml}
        `,
      });
      const url = nodemailer.getTestMessageUrl(info);
      if (url) adminPreviewUrls.push(url);
    } catch (err: any) {
      adminErrors.push(err?.message || String(err));
    }
  }

  return {
    transport: "ethereal",
    customer: { success: !customerError, previewUrl: customerPreviewUrl, error: customerError },
    admin: { success: adminErrors.length === 0, previewUrls: adminPreviewUrls, errors: adminErrors },
  };
}

function escapeHtml(text: string): string {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[ch]!));
}


