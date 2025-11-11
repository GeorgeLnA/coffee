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

    const DEFAULT_IMAGE =
      "https://coffeemanifest.com.ua/wp-content/uploads/2024/03/logo_manifest.png";

    const body = (req.body && typeof req.body === "object") ? req.body : {};

    const customerEmail =
      typeof body.customerEmail === "string" && body.customerEmail.trim()
        ? body.customerEmail.trim()
        : "test@example.com";
    const customerName =
      typeof body.customerName === "string" && body.customerName.trim()
        ? body.customerName.trim()
        : "Тестовий Користувач";
    const customerPhone =
      typeof body.customerPhone === "string" && body.customerPhone.trim()
        ? body.customerPhone.trim()
        : "+380501234567";
    const orderId =
      typeof body.orderId === "string" && body.orderId.trim()
        ? body.orderId.trim()
        : "TEST-" + Date.now();
    const orderDate =
      body.orderDate ||
      new Date().toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const normalizeItem = (item: any, index: number) => {
      const quantity = Number(item?.quantity) || 1;
      const price = Number(item?.price) || 0;
      return {
        name:
          typeof item?.name === "string" && item.name.trim()
            ? item.name.trim()
            : `Тестовий товар ${index + 1}`,
        quantity,
        price,
        image:
          typeof item?.image === "string" && item.image.trim()
            ? item.image.trim()
            : DEFAULT_IMAGE,
        variant:
          typeof item?.variant === "string" ? item.variant : "",
      };
    };

    const emailItems =
      rawItems.length > 0
        ? rawItems.map((item, index) => normalizeItem(item, index))
        : [
            normalizeItem(
              {
                name: "Кава Ефіопія Гуджі",
                quantity: 2,
                price: 250,
                variant: "250g В зернах",
              },
              0,
            ),
          ];

    const orderTotalNumber = emailItems.reduce(
      (sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );

    const shippingMethod =
      typeof body.shippingMethod === "string" && body.shippingMethod.trim()
        ? body.shippingMethod.trim()
        : "Нова Пошта";
    const paymentMethod =
      typeof body.paymentMethod === "string" && body.paymentMethod.trim()
        ? body.paymentMethod.trim()
        : "Онлайн (LiqPay)";
    const shippingAddress =
      typeof body.shippingAddress === "string" && body.shippingAddress.trim()
        ? body.shippingAddress.trim()
        : "вул. Тестова, 1, м. Київ, Відділення №1";
    const billingAddress =
      typeof body.billingAddress === "string" && body.billingAddress.trim()
        ? body.billingAddress.trim()
        : shippingAddress;
    const orderNotes =
      typeof body.orderNotes === "string" && body.orderNotes.trim()
        ? body.orderNotes.trim()
        : "Це тестове замовлення";

    const shippingMethodKey = (shippingMethod || '').toLowerCase();
    let shippingPriceNumber: number | null = null;
    if (typeof body.shippingPrice === 'number') {
      shippingPriceNumber = body.shippingPrice;
    } else if (typeof body.shippingPrice === 'string' && body.shippingPrice.trim() !== '') {
      const parsed = Number(body.shippingPrice);
      if (!Number.isNaN(parsed)) {
        shippingPriceNumber = parsed;
      }
    }
    const shippingFreeFlag = Boolean(body.shippingFree);
    const shippingCarrierRatesFlag =
      typeof body.shippingCarrierRates === 'boolean'
        ? Boolean(body.shippingCarrierRates)
        : ['nova_department', 'nova_postomat', 'nova_courier'].includes(shippingMethodKey);

    const testData = {
      orderId,
      orderDate,
      customerName,
      customerEmail,
      customerPhone,
      orderTotal: orderTotalNumber,
      shippingMethod,
      shippingPrice: shippingPriceNumber,
      shippingFree: shippingFreeFlag,
      shippingCarrierRates: shippingCarrierRatesFlag,
      paymentMethod,
      billingAddress,
      shippingAddress,
      orderNotes,
      emailItems,
    };

    const results: {
      customer: { success: boolean; error?: string } | null;
      admin: { success: boolean; error?: string } | null;
    } = {
      customer: null,
      admin: null,
    };

    // Test customer email
    try {
      const customerResult = await sendOrderConfirmationEmail({
        customerEmail: testData.customerEmail,
        customerName: testData.customerName,
        customerPhone: testData.customerPhone,
        orderId: testData.orderId,
        orderDate: testData.orderDate,
        orderTotal: testData.orderTotal || 0,
        orderItems: testData.emailItems,
        shippingAddress: testData.shippingAddress,
        shippingMethod: testData.shippingMethod,
        shippingCost: testData.shippingPrice,
        shippingCostIsFree: testData.shippingFree,
        shippingCarrierRates: testData.shippingCarrierRates,
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
        orderTotal: testData.orderTotal || 0,
        orderItems: testData.emailItems,
        shippingAddress: testData.shippingAddress,
        shippingMethod: testData.shippingMethod,
        shippingCost: testData.shippingPrice,
        shippingCostIsFree: testData.shippingFree,
        shippingCarrierRates: testData.shippingCarrierRates,
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

    const customerSuccess = !!results.customer?.success;
    const adminSuccess = !!results.admin?.success;
    const overallSuccess = customerSuccess && adminSuccess;

    const responseBody = {
      success: overallSuccess,
      message: overallSuccess
        ? "Test emails sent"
        : "One or more emails failed to send",
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
        orderTotal: testData.orderTotal,
        itemsCount: testData.emailItems.length,
      },
      results,
    };

    if (overallSuccess) {
      res.json(responseBody);
    } else {
      res.status(500).json(responseBody);
    }
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({
      error: "Failed to send test emails",
      message: error.message,
    });
  }
};

