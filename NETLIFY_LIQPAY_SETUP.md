# LiqPay Integration Setup for Netlify

This guide explains how to configure LiqPay payment integration on Netlify using serverless functions.

## Overview

The LiqPay integration uses Netlify serverless functions to securely handle payment processing. All sensitive operations (signature generation, payment preparation, callbacks) are handled server-side to keep your private keys secure.

## Serverless Functions

The following serverless functions have been created in `netlify/functions/`:

1. **`liqpay-signature.ts`** - Generates LiqPay payment signatures
   - Endpoint: `/api/liqpay-signature`
   - Method: POST
   - Body: `{ data: string }` (base64-encoded payment data)
   - Returns: `{ signature: string }`

2. **`prepare-order.ts`** - Prepares orders with LiqPay payment data
   - Endpoint: `/api/orders/prepare`
   - Method: POST
   - Body: `{ customer, shipping, payment, items, notes }`
   - Returns: `{ data, signature, orderId, paymentMethod }`

3. **`liqpay-callback.ts`** - Handles LiqPay payment callbacks/webhooks
   - Endpoint: `/.netlify/functions/liqpay-callback`
   - Method: POST (called by LiqPay)
   - This function is automatically called by LiqPay when payment status changes

## Environment Variables Setup

### Step 1: Get Your LiqPay Keys

1. Log in to your [LiqPay Merchant account](https://www.liqpay.ua/)
2. Navigate to Settings → API
3. Copy your **Public Key** and **Private Key**

### Step 2: Configure Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site settings** → **Environment variables** → **Add a variable**

Add the following environment variables:

#### Required Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `LIQPAY_PUBLIC_KEY` | Your LiqPay public key (publishable) | `i12345678901` |
| `LIQPAY_PRIVATE_KEY` | Your LiqPay private key (secret) | `your_secret_key_here` |

#### Optional Variables

| Variable Name | Description | Default |
|--------------|-------------|---------|
| `VITE_LIQPAY_PUBLIC_KEY` | Public key for client-side (optional, if different) | Uses `LIQPAY_PUBLIC_KEY` |
| `VITE_LIQPAY_SANDBOX` | Enable sandbox mode for testing (`"true"` or `"false"`) | `"false"` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for displaying interactive maps | Required for map functionality |
| `NOVA_POSHTA_API_KEY` | Nova Poshta API key for shipping integration | Required for Nova Poshta shipping options |

### Google Maps API Key Setup

To enable the interactive map on your site:

1. **Get your Google Maps API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API key)
   - (Optional) Restrict the API key to your domain for security

2. **Add to Netlify:**
   - In Netlify dashboard: **Site settings** → **Environment variables** → **Add a variable**
   - Variable name: `VITE_GOOGLE_MAPS_API_KEY`
   - Variable value: Your Google Maps API key
   - Set for: **All contexts** (or as needed)

3. **Redeploy** your site after adding the variable

### Nova Poshta API Key Setup

To enable Nova Poshta shipping integration (postomat and department options):

1. **Get your Nova Poshta API key:**
   - Go to [Nova Poshta API](https://developers.novaposhta.ua/)
   - Register for an API key
   - Copy your API key

2. **Add to Netlify:**
   - In Netlify dashboard: **Site settings** → **Environment variables** → **Add a variable**
   - Variable name: `NOVA_POSHTA_API_KEY`
   - Variable value: Your Nova Poshta API key
   - Set for: **All contexts** (or as needed)

3. **Important:** 
   - The API key must be set as `NOVA_POSHTA_API_KEY` (NOT `VITE_NOVA_POSHTA_API_KEY`)
   - The key is used server-side only (in Express routes wrapped by Netlify functions)
   - After adding the variable, **redeploy** your site

4. **Verify the setup:**
   - Check Netlify Function logs when using Nova Poshta shipping options
   - Look for debug logs showing API key status (key length, etc.)
   - If issues persist, verify the environment variable is set in the correct context (Production/Deploy previews)

### Step 3: Set Environment Variables for Different Contexts

In Netlify, you can set environment variables for:
- **All contexts** (Production, Deploy previews, Branch deploys)
- **Production** only
- **Deploy previews** only
- **Branch deploys** only

For security:
- Set `LIQPAY_PRIVATE_KEY` for **Production** only or **All contexts** (as needed)
- Set `LIQPAY_PUBLIC_KEY` for **All contexts** (it's safe to expose)
- Set `VITE_LIQPAY_SANDBOX` to `"true"` for testing environments

### Step 4: Redeploy

After adding environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger an automatic deploy

## Testing

### Sandbox Mode

To test payments in sandbox mode:

1. Set `VITE_LIQPAY_SANDBOX` to `"true"` in Netlify environment variables
2. Use LiqPay test credentials (provided by LiqPay)
3. Redeploy your site

### Testing Callbacks

The callback URL is automatically set to:
```
https://your-site.netlify.app/.netlify/functions/liqpay-callback
```

Make sure this URL is accessible (Netlify functions are public by default).

## Security Best Practices

✅ **DO:**
- Store `LIQPAY_PRIVATE_KEY` as an environment variable (never in code)
- Use different keys for production and sandbox
- Regularly rotate your keys
- Monitor callback logs for suspicious activity

❌ **DON'T:**
- Commit private keys to version control
- Expose private keys in client-side code
- Share your private key with unauthorized parties
- Use production keys in development/sandbox mode

## Callback URL Configuration

The callback URL (`server_url`) is automatically set in the `prepare-order.ts` function based on your Netlify site URL. The format is:

```
https://your-site.netlify.app/.netlify/functions/liqpay-callback
```

No manual configuration is needed - it's derived from the incoming request headers.

## Troubleshooting

### Issue: "Payment gateway not configured"
- **Solution**: Ensure `LIQPAY_PRIVATE_KEY` is set in Netlify environment variables and redeploy

### Issue: "Invalid signature" errors
- **Solution**: Verify your `LIQPAY_PRIVATE_KEY` matches the one in your LiqPay account settings

### Issue: Callbacks not working
- **Solution**: 
  1. Check that `liqpay-callback.ts` function is deployed
  2. Verify the callback URL is correct in your LiqPay merchant settings
  3. Check Netlify function logs for errors

### Issue: Functions return 404
- **Solution**: 
  1. Verify redirects in `netlify.toml` are correct
  2. Ensure functions are in `netlify/functions/` directory
  3. Redeploy after making changes

## Monitoring

To monitor your LiqPay integration:

1. **Netlify Function Logs**: Go to **Functions** tab in Netlify dashboard to view logs
2. **LiqPay Dashboard**: Check transaction status in your LiqPay merchant account
3. **Application Logs**: Check your application's order processing logic

## Support

- [LiqPay Documentation](https://www.liqpay.ua/en/documentation)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

