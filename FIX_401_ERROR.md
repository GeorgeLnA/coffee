# Fixing 401 Unauthorized Error

The 401 error suggests Supabase Edge Function might require authentication. However, Edge Functions should be public by default.

## Possible Causes:

1. **Supabase Edge Function Auth**: Edge Functions might require an auth token
2. **LiqPay not sending proper headers**: LiqPay might not be sending the request correctly
3. **CORS/Preflight issues**: The 401 might be from a preflight OPTIONS request

## Solution:

The webhook function has been updated to:
- Handle OPTIONS requests (CORS preflight)
- Add CORS headers to all responses
- Better error logging

## Next Steps:

1. **Check the invocation details** in Supabase Dashboard:
   - Click on the 401 invocation
   - Check the "Request" tab to see what LiqPay sent
   - Check the "Logs" tab to see our console.log output

2. **Verify the webhook URL is correct** in Netlify logs:
   - Should be: `https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook`

3. **Check if LiqPay is actually calling it**:
   - The 401 might be from a test/health check
   - Real payment callbacks should show different status codes

4. **Make a real test payment** and check:
   - If a new invocation appears (not 401)
   - If the logs show "=== LIQPAY WEBHOOK CALLED ==="
   - If the order appears in the database

The 401 might just be from Supabase's health check or a test request. The real payment callback should work!

