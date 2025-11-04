# Supabase Edge Function Setup for LiqPay Webhooks

This guide explains how to set up the Supabase Edge Function to handle LiqPay payment callbacks reliably.

## Why Supabase Edge Function?

- **Direct database access**: Edge Functions run on Supabase infrastructure with direct access to your database
- **More reliable**: Better uptime and fewer cold starts than Netlify functions
- **Proper signature verification**: Supports both SHA-1 and SHA3-256 algorithms
- **Idempotent**: Handles duplicate callbacks gracefully

## Prerequisites

1. Supabase project exists
2. Supabase CLI installed (`npm install -g supabase`)
3. LiqPay public and private keys

## Step 1: Deploy the Edge Function

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref umynzgzlqdphgrzixhsc
   ```

4. **Set secrets** (replace with your actual values):
   ```bash
   supabase secrets set LIQPAY_PUBLIC=your_public_key_here
   supabase secrets set LIQPAY_PRIVATE=your_private_key_here
   supabase secrets set SUPABASE_URL=https://umynzgzlqdphgrzixhsc.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE=your_service_role_key_here
   ```

   **To get your service role key:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the `service_role` key (⚠️ Keep this secret!)

5. **Deploy the function**:
   ```bash
   supabase functions deploy liqpay-webhook
   ```

## Step 2: Verify the Deployment

After deployment, you should see:
```
Function URL: https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook
```

## Step 3: Update Netlify Function

The `prepare-order.ts` Netlify function has been updated to automatically use the Supabase Edge Function URL. It extracts the project reference from your `SUPABASE_URL` environment variable.

If you need to manually set it, check `netlify/functions/prepare-order.ts` line ~337.

## Step 4: Test the Webhook

### Option 1: Test with curl (Local Testing)

Build a fake payload:
```bash
DATA_B64=$(echo -n '{"public_key":"your_public_key","status":"success","order_id":"TEST123","payment_id":"LP_999","amount":10,"currency":"UAH"}' | base64 -w0)

# Make signature (SHA-1)
SIG_SHA1=$(echo -n "your_private_key${DATA_B64}your_private_key" | openssl sha1 -binary | base64)

# Post to webhook
curl -X POST https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "data=$DATA_B64" \
  --data-urlencode "signature=$SIG_SHA1"
```

### Option 2: Test with Real Payment

1. Make a test order on your site
2. Complete payment in LiqPay sandbox
3. Check Supabase logs:
   ```bash
   supabase functions logs liqpay-webhook
   ```
4. Verify order appears in admin panel

## How It Works

1. **Order Creation**: When a customer places an order:
   - Order data is saved to `pending_orders` table
   - LiqPay payment is prepared with `server_url` pointing to Supabase Edge Function
   - Customer is redirected to LiqPay

2. **Payment Confirmation**: When payment succeeds:
   - LiqPay calls the Supabase Edge Function webhook
   - Function verifies signature (SHA-1 or SHA3-256)
   - Function retrieves order data from `pending_orders` or `info` field
   - Order is saved to `orders` table with status "completed"
   - Order items are saved to `order_items` table
   - `pending_orders` entry is cleaned up

3. **Idempotency**: If LiqPay sends duplicate callbacks:
   - Function checks if order already exists
   - If order is already completed, it acknowledges without duplicate processing

## Troubleshooting

### Webhook not receiving callbacks

1. **Check LiqPay dashboard**:
   - Go to LiqPay Merchant → Settings → API
   - Verify `server_url` is set correctly in payment requests
   - Check callback logs in LiqPay dashboard

2. **Check Supabase logs**:
   ```bash
   supabase functions logs liqpay-webhook --follow
   ```

3. **Verify secrets are set**:
   ```bash
   supabase secrets list
   ```

### Orders not appearing after payment

1. **Check Supabase Edge Function logs** for errors
2. **Verify `pending_orders` table exists** (run `create_pending_orders_table.sql` if needed)
3. **Check order_id format** matches between `prepare-order` and webhook
4. **Verify signature algorithm** matches your LiqPay account settings

### Signature verification fails

The function tries both SHA-1 and SHA3-256. If both fail:
1. Check your `LIQPAY_PRIVATE` secret is correct
2. Verify signature generation in `prepare-order.ts` matches your LiqPay account settings
3. Check LiqPay account settings for signature algorithm preference

## Security Notes

- ✅ **Service Role Key**: Only used server-side in Edge Function (never exposed to client)
- ✅ **Signature Verification**: All callbacks are verified before processing
- ✅ **Public Key Check**: Ensures callback is from your LiqPay account
- ✅ **Idempotency**: Prevents duplicate order processing

## Environment Variables Reference

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `LIQPAY_PUBLIC` | LiqPay public key | Supabase secrets |
| `LIQPAY_PRIVATE` | LiqPay private key | Supabase secrets |
| `SUPABASE_URL` | Your Supabase project URL | Supabase secrets |
| `SUPABASE_SERVICE_ROLE` | Service role key | Supabase secrets |

## Next Steps

After setup:
1. Test with a real sandbox payment
2. Monitor logs for any errors
3. Verify orders appear in admin panel
4. Test idempotency by checking duplicate callbacks are handled

For production:
1. Remove sandbox mode (`sandbox: 1` in payment params)
2. Use production LiqPay keys
3. Monitor Edge Function logs regularly

