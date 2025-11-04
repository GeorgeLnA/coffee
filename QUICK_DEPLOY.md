# Quick Deploy Guide - Supabase Edge Function

I've created automated deployment scripts for you! Just follow these steps:

## Step 1: Get Your Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Copy the token

## Step 2: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/umynzgzlqdphgrzixhsc/settings/api
2. Find the `service_role` key (under "Project API keys")
3. Copy it (⚠️ Keep this secret!)

## Step 3: Get Your LiqPay Keys

Check your Netlify environment variables or `.env` file:
- `LIQPAY_PUBLIC_KEY`
- `LIQPAY_PRIVATE_KEY`

## Step 4: Run the Deployment Script

### On Windows (PowerShell):

```powershell
# Set your tokens (replace with actual values)
$env:SUPABASE_ACCESS_TOKEN='your_access_token_here'
$env:LIQPAY_PUBLIC_KEY='your_liqpay_public_key'
$env:LIQPAY_PRIVATE_KEY='your_liqpay_private_key'
$env:SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'

# Run the script
.\deploy-supabase-webhook.ps1
```

### On Mac/Linux (Bash):

```bash
# Set your tokens (replace with actual values)
export SUPABASE_ACCESS_TOKEN='your_access_token_here'
export LIQPAY_PUBLIC_KEY='your_liqpay_public_key'
export LIQPAY_PRIVATE_KEY='your_liqpay_private_key'
export SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'

# Make script executable
chmod +x deploy-supabase-webhook.sh

# Run the script
./deploy-supabase-webhook.sh
```

## What the Script Does

1. ✅ Links your Supabase project
2. ✅ Sets all required secrets
3. ✅ Deploys the Edge Function
4. ✅ Shows you the webhook URL

## After Deployment

The webhook URL will be:
```
https://umynzgzlqdphgrzixhsc.functions.supabase.co/liqpay-webhook
```

This URL is automatically used by your `prepare-order.ts` function - no manual configuration needed!

## Testing

1. Make a test order on your site
2. Complete payment in LiqPay
3. Check if order appears in admin panel
4. View logs: `npx supabase functions logs liqpay-webhook`

## Troubleshooting

If you get errors:
- Make sure all environment variables are set correctly
- Verify your access token is valid
- Check that service role key is correct
- Ensure LiqPay keys match your LiqPay account

That's it! The script handles everything for you. 🚀

