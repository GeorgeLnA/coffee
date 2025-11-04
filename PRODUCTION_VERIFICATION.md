# Production Verification ✅

## Yes, it works in production!

The Supabase Edge Function webhook URL is **the same in both dev and production** because it's based on your Supabase project, not your deployment environment.

## How It Works

### 1. Webhook URL is Environment-Agnostic

The webhook URL is built dynamically:
```typescript
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
const supabaseProjectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "umynzgzlqdphgrzixhsc";
const supabaseWebhookUrl = `https://${supabaseProjectRef}.functions.supabase.co/liqpay-webhook`;
```

**Result**: `https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook`

This URL is **the same** whether you're:
- Testing locally (`localhost`)
- Running on Netlify dev
- Running on Netlify production

### 2. Environment Variables

Make sure these are set in **Netlify Production**:

| Variable | Where to Set | Required For |
|----------|--------------|--------------|
| `VITE_SUPABASE_URL` | Netlify → Site Settings → Environment Variables | Auto-detection |
| `SUPABASE_URL` | Netlify → Site Settings → Environment Variables | Fallback |
| `LIQPAY_PUBLIC_KEY` | Netlify → Site Settings → Environment Variables | Payment preparation |
| `LIQPAY_PRIVATE_KEY` | Netlify → Site Settings → Environment Variables | Payment preparation |

### 3. Supabase Edge Function (One-Time Setup)

The Edge Function is deployed **once** to Supabase and works for:
- ✅ Local development
- ✅ Netlify dev previews
- ✅ Netlify production

**No need to redeploy** the Edge Function when you deploy to production!

## Production Checklist

Before going live:

- [ ] Deploy Supabase Edge Function (run `deploy-supabase-webhook.ps1` or `.sh`)
- [ ] Set all environment variables in Netlify **Production** context
- [ ] Verify `VITE_SUPABASE_URL` is set in Netlify
- [ ] Test with a real payment (use sandbox mode first)
- [ ] Verify order appears in admin panel after payment
- [ ] Check Supabase Edge Function logs: `npx supabase functions logs liqpay-webhook`

## Testing in Production

1. **Make a test order** on your live site
2. **Complete payment** in LiqPay (use sandbox mode if testing)
3. **Check admin panel** - order should appear automatically
4. **Check logs** if order doesn't appear:
   ```bash
   npx supabase functions logs liqpay-webhook --follow
   ```

## Why This Works in Production

✅ **Supabase Edge Functions** are hosted on Supabase's infrastructure (not Netlify)
✅ **Same URL** for all environments (dev, staging, production)
✅ **No environment-specific configuration** needed
✅ **Automatic detection** of Supabase project from environment variables

## Troubleshooting

If orders don't appear in production:

1. **Check Netlify environment variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Make sure `VITE_SUPABASE_URL` is set for **Production** context
   - Verify `LIQPAY_PUBLIC_KEY` and `LIQPAY_PRIVATE_KEY` are set

2. **Check Supabase Edge Function logs**:
   ```bash
   npx supabase functions logs liqpay-webhook --follow
   ```

3. **Verify webhook URL in payment request**:
   - Check Netlify Function logs for `prepare-order`
   - Look for: `server_url: https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook`

4. **Test webhook manually** (see `SUPABASE_LIQPAY_SETUP.md` for curl command)

## Summary

🎉 **You only need to deploy the Edge Function once** - it works everywhere!
🎉 **No code changes needed** between dev and production
🎉 **Same webhook URL** in all environments

Just make sure your Netlify production environment variables are set correctly!

