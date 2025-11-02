import { RequestHandler } from "express";
import crypto from "crypto";

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
    
    // For cash payments, we don't need LiqPay - just create order and return success
    if (paymentMethod === 'cash') {
      // TODO: Save order to database here
      // For now, just return success response
      const orderId = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

    const orderId = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const description = items.map((it: any) => `${it.name}${it.variant ? ` (${it.variant})` : ''} x${it.quantity}`).join(', ');
    const amount = Number((items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0) + (shipping?.price || 0)).toFixed(2));

    // Determine paytypes based on payment method
    let paytypes = 'card';
    if (paymentMethod === 'apple_pay') {
      paytypes = 'applepay';
    } else if (paymentMethod === 'google_pay') {
      paytypes = 'googlepay';
    }

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
      info: description,
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


