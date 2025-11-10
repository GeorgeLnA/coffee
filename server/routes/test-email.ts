import { RequestHandler } from "express";
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "../../netlify/functions/send-email";
import { resolveEmailJSConfig, maskForLogs } from "../../shared/emailjs-config";

export const testEmail: RequestHandler = async (req, res) => {
  try {
    // Check if EmailJS is configured
    const emailConfig = resolveEmailJSConfig();
    const emailjsServiceId = emailConfig.serviceId;
    const emailjsTemplateIdCustomer = emailConfig.templateIdCustomer;
    const emailjsTemplateIdAdmin = emailConfig.templateIdAdmin;
    const emailjsPublicKey = emailConfig.publicKey;
    const adminEmails = emailConfig.adminEmails || "dovedem2014@gmail.com,manifestcava@gmail.com";

    if (!emailjsServiceId || !emailjsTemplateIdCustomer || !emailjsTemplateIdAdmin || !emailjsPublicKey) {
      return res.status(400).json({
        error: "EmailJS not configured",
        missing: {
          EMAILJS_SERVICE_ID: !emailjsServiceId,
          EMAILJS_TEMPLATE_ID_CUSTOMER: !emailjsTemplateIdCustomer,
          EMAILJS_TEMPLATE_ID_ADMIN: !emailjsTemplateIdAdmin,
          EMAILJS_PUBLIC_KEY: !emailjsPublicKey,
        },
        env: {
          EMAILJS_SERVICE_ID: maskForLogs(emailjsServiceId),
          EMAILJS_TEMPLATE_ID_CUSTOMER: maskForLogs(emailjsTemplateIdCustomer),
          EMAILJS_TEMPLATE_ID_ADMIN: maskForLogs(emailjsTemplateIdAdmin),
          EMAILJS_PUBLIC_KEY: maskForLogs(emailjsPublicKey),
          ADMIN_EMAILS: adminEmails,
          SOURCES: emailConfig.sources,
        },
      });
    }

    // Test data
    const testData = {
      orderId: "TEST-" + Date.now(),
      orderDate: new Date().toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      customerName: "Тестовий Користувач",
      customerEmail: req.body.customerEmail || "test@example.com",
      customerPhone: "+380501234567",
      orderTotal: "₴500.00",
      shippingMethod: "Нова Пошта",
      paymentMethod: "Онлайн (LiqPay)",
      billingAddress: "вул. Тестова, 1, м. Київ",
      shippingAddress: "вул. Тестова, 1, м. Київ, Відділення №1",
      orderNotes: "Це тестове замовлення",
      emailItems: [
        {
          name: "Кава Ефіопія Гуджі",
          quantity: 2,
          price: 250,
          image: "https://coffeemanifest.com.ua/wp-content/uploads/2024/03/logo_manifest.png",
          variant: "250g В зернах",
        },
      ],
    };

    const results = {
      customer: null as any,
      admin: null as any,
    };

    // Test customer email
    try {
      const customerResult = await sendOrderConfirmationEmail({
        customerEmail: testData.customerEmail,
        customerName: testData.customerName,
        customerPhone: testData.customerPhone,
        orderId: testData.orderId,
        orderDate: testData.orderDate,
        orderTotal: 500,
        orderItems: testData.emailItems,
        shippingAddress: testData.shippingAddress,
        shippingMethod: testData.shippingMethod,
        paymentMethod: testData.paymentMethod,
        orderNotes: testData.orderNotes,
        emailjsServiceId: emailjsServiceId,
        emailjsTemplateIdCustomer: emailjsTemplateIdCustomer,
        emailjsPublicKey: emailjsPublicKey,
        emailjsPrivateKey: emailConfig.privateKey,
      });
      results.customer = customerResult;
    } catch (error: any) {
      results.customer = { success: false, error: error.message };
    }

    // Test admin email
    try {
      const adminResult = await sendOrderNotificationEmail({
        adminEmails: adminEmails.split(",").map((e) => e.trim()),
        customerName: testData.customerName,
        customerEmail: testData.customerEmail,
        customerPhone: testData.customerPhone,
        orderId: testData.orderId,
        orderTotal: 500,
        orderItems: testData.emailItems,
        shippingAddress: testData.shippingAddress,
        shippingMethod: testData.shippingMethod,
        paymentMethod: testData.paymentMethod,
        notes: testData.orderNotes,
        emailjsServiceId: emailjsServiceId,
        emailjsTemplateIdAdmin: emailjsTemplateIdAdmin,
        emailjsPublicKey: emailjsPublicKey,
        emailjsPrivateKey: emailConfig.privateKey,
      });
      results.admin = adminResult;
    } catch (error: any) {
      results.admin = { success: false, error: error.message };
    }

    res.json({
      success: true,
      message: "Test emails sent",
      config: {
        serviceId: emailjsServiceId,
        customerTemplate: emailjsTemplateIdCustomer,
        adminTemplate: emailjsTemplateIdAdmin,
        publicKey: maskForLogs(emailjsPublicKey),
        adminEmails: adminEmails,
        sources: emailConfig.sources,
      },
      testData: {
        orderId: testData.orderId,
        customerEmail: testData.customerEmail,
      },
      results,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({
      error: "Failed to send test emails",
      message: error.message,
    });
  }
};

