# Debugging LiqPay Webhook Issues

## Quick Checks

1. **Check if webhook is being called:**
   - Go to Supabase Dashboard → Edge Functions → liqpay-webhook → Logs
   - Look for "=== LIQPAY WEBHOOK CALLED ===" messages

2. **Check Netlify Function logs:**
   - Go to Netlify Dashboard → Functions → prepare-order
   - Look for "=== WEBHOOK URL DEBUG ===" to see what URL is being sent to LiqPay

3. **Verify webhook URL in LiqPay:**
   - The webhook URL should be: `https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook`
   - Check LiqPay dashboard to see if callbacks are being sent

## Common Issues

### Issue 1: Webhook not being called
**Symptoms:** No logs in Supabase Edge Function
**Solution:** 
- Check LiqPay dashboard for callback logs
- Verify `server_url` is set correctly in payment request
- Check Netlify Function logs for "WEBHOOK URL DEBUG"

### Issue 2: Signature verification failing
**Symptoms:** Logs show "Invalid signature"
**Solution:**
- Verify LIQPAY_PRIVATE secret matches your LiqPay account
- Check if your LiqPay account uses SHA-1 or SHA3-256 (code tries both)

### Issue 3: Order data not found
**Symptoms:** Logs show "Order not found"
**Solution:**
- Check if `pending_orders` table exists
- Verify order data is being saved to `pending_orders` before payment
- Check if `info` field contains order data

## Testing

1. Make a test order
2. Check Netlify logs for webhook URL
3. Check Supabase Edge Function logs for webhook call
4. Check admin panel for order

## Manual Test

You can test the webhook manually with curl (see SUPABASE_LIQPAY_SETUP.md)

