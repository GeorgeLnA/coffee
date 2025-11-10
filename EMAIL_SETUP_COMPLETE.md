# Email Setup Complete ✅

## What Was Fixed

1. **Unified EmailJS Configuration**: Created `shared/emailjs-config.ts` that automatically resolves environment variables from both:
   - Server-side variables: `EMAILJS_*` (for Netlify functions and Express server)
   - Client-side variables: `VITE_EMAILJS_*` (for browser/client code)

2. **Updated All Email Sending Points**:
   - ✅ `netlify/functions/prepare-order.ts` - Cash payment emails
   - ✅ `netlify/functions/liqpay-callback.ts` - LiqPay payment confirmation emails
   - ✅ `server/routes/orders.ts` - Express server cash payment emails
   - ✅ `server/routes/test-email.ts` - Test email endpoint

3. **Environment Variables**: Your production credentials are configured. For local development, ensure `.env.local` contains:

```env
# Admin emails
ADMIN_EMAILS=dovedem2014@gmail.com,manifestcava@gmail.com

# EmailJS (Server-side)
EMAILJS_PRIVATE_KEY=fsRkVV2V-5QgUXiKztym5
EMAILJS_PUBLIC_KEY=dK2FblsCDGEM8ZpPq
EMAILJS_SERVICE_ID=service_kifgtn2
EMAILJS_TEMPLATE_ID_ADMIN=template_4ft87b9
EMAILJS_TEMPLATE_ID_CUSTOMER=template_gjxblw6

# EmailJS (Client-side - VITE_ prefix)
VITE_EMAILJS_SERVICE_ID=service_kifgtn2
VITE_EMAILJS_TEMPLATE_ID_CUSTOMER=template_gjxblw6
VITE_EMAILJS_TEMPLATE_ID_ADMIN=template_4ft87b9
VITE_EMAILJS_PUBLIC_KEY=dK2FblsCDGEM8ZpPq
VITE_ADMIN_EMAILS=dovedem2014@gmail.com,manifestcava@gmail.com
```

## How It Works Now

### Cash Payments
1. Customer submits order with cash payment
2. Order saved to Supabase
3. **Server automatically sends**:
   - Customer confirmation email
   - Admin notification email(s)

### LiqPay Payments
1. Customer submits order with LiqPay payment
2. Order saved to `pending_orders` table
3. Customer redirected to LiqPay payment page
4. After successful payment, LiqPay calls webhook: `/.netlify/functions/liqpay-callback`
5. **Webhook automatically sends**:
   - Customer confirmation email
   - Admin notification email(s)

## Testing

### Local Development
1. Make sure `.env.local` exists with all variables (run `setup-local-env.ps1` if needed)
2. Restart your dev server: `npm run dev`
3. Test email endpoint: `POST http://localhost:PORT/api/test-email`
   ```json
   { "customerEmail": "your-email@example.com" }
   ```

### Production (Netlify)
- All environment variables are already set in Netlify dashboard
- Emails will send automatically after:
  - Cash payment orders are created
  - LiqPay payments are confirmed

## Debugging

### Check Email Configuration
- Local: `http://localhost:PORT/api/env-check`
- Production: `https://your-domain/.netlify/functions/env-check`

### Check Deployment Config
- Production: `https://your-domain/.netlify/functions/compare-deployments`

### Logs
All email sending attempts are logged with:
- Environment variable sources
- EmailJS API responses
- Success/failure status

## Important Notes

1. **Private Key**: `EMAILJS_PRIVATE_KEY` is required for server-side REST API calls. Make sure it's set in both local `.env.local` and Netlify environment variables.

2. **Fallback**: If server-side email sending fails, the client-side fallback in `Checkout.tsx` will attempt to send emails using the browser SDK (public key only).

3. **Environment Priority**: The config resolver checks `EMAILJS_*` variables first, then falls back to `VITE_EMAILJS_*` if needed.

## Files Modified

- `shared/emailjs-config.ts` - New unified config resolver
- `netlify/functions/prepare-order.ts` - Uses shared config
- `netlify/functions/liqpay-callback.ts` - Uses shared config
- `server/routes/orders.ts` - Uses shared config
- `server/routes/test-email.ts` - Uses shared config
- `server/index.ts` - Uses shared config for startup logging
- `netlify/functions/compare-deployments.ts` - Uses shared config for diagnostics

## Next Steps

1. ✅ Code is updated to use unified config
2. ✅ Production credentials are set in Netlify
3. ⏳ Create `.env.local` for local development (run `setup-local-env.ps1`)
4. ⏳ Test with a real order (cash and LiqPay)

