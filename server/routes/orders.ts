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
    console.log('prepareOrder received:', JSON.stringify(req.body, null, 2));
    const { customer, shipping, items, notes } = req.body as any;
    console.log('Parsed:', { customer, shipping, itemsCount: items?.length, notes });
    
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid payload - missing customer, items, or empty items array');
      return res.status(400).json({ error: 'Invalid order payload' });
    }

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
      paytypes: 'card',
      sandbox: process.env.VITE_LIQPAY_SANDBOX === 'true' ? 1 : undefined,
      info: description,
    } as Record<string, any>;

    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

    const data = base64(JSON.stringify(params));
    const signature = sign(data, privateKey);

    res.json({ data, signature, orderId });
  } catch (err: any) {
    console.error('prepareOrder error', err);
    res.status(500).json({ error: err?.message || 'Failed to prepare order' });
  }
};


