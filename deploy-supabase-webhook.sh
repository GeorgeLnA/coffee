#!/bin/bash
# Bash script to deploy Supabase Edge Function for LiqPay webhook
# Run this script after setting the required environment variables

echo "🚀 Deploying Supabase Edge Function for LiqPay Webhook..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Using npx..."
    SUPABASE_CMD="npx supabase"
else
    SUPABASE_CMD="supabase"
fi

# Get access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo ""
    echo "⚠️  SUPABASE_ACCESS_TOKEN not set!"
    echo ""
    echo "To get your access token:"
    echo "1. Go to https://supabase.com/dashboard/account/tokens"
    echo "2. Create a new access token"
    echo "3. Run: export SUPABASE_ACCESS_TOKEN='your_token_here'"
    echo "4. Then run this script again"
    echo ""
    exit 1
fi

# Get LiqPay keys
if [ -z "$LIQPAY_PUBLIC_KEY" ] || [ -z "$LIQPAY_PRIVATE_KEY" ]; then
    echo "⚠️  LiqPay keys not found in environment variables!"
    echo "Set them with:"
    echo "export LIQPAY_PUBLIC_KEY='your_public_key'"
    echo "export LIQPAY_PRIVATE_KEY='your_private_key'"
    exit 1
fi

# Get Supabase service role key
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found!"
    echo "Get it from: Supabase Dashboard → Project Settings → API → service_role key"
    echo "Set it with: export SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'"
    exit 1
fi

# Supabase project details
PROJECT_REF="umynzgzlqdphgrzixhsc"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo ""
echo "📋 Configuration:"
echo "  Project Ref: $PROJECT_REF"
echo "  Supabase URL: $SUPABASE_URL"
echo "  LiqPay Public Key: ${LIQPAY_PUBLIC_KEY:0:10}..."
echo ""

# Link project
echo "🔗 Linking Supabase project..."
$SUPABASE_CMD link --project-ref $PROJECT_REF || exit 1
echo "✓ Project linked"

# Set secrets
echo ""
echo "🔐 Setting secrets..."
$SUPABASE_CMD secrets set LIQPAY_PUBLIC=$LIQPAY_PUBLIC_KEY || exit 1
$SUPABASE_CMD secrets set LIQPAY_PRIVATE=$LIQPAY_PRIVATE_KEY || exit 1
$SUPABASE_CMD secrets set SUPABASE_URL=$SUPABASE_URL || exit 1
$SUPABASE_CMD secrets set SUPABASE_SERVICE_ROLE=$SUPABASE_SERVICE_ROLE_KEY || exit 1
echo "✓ Secrets set"

# Deploy function
echo ""
echo "🚀 Deploying Edge Function..."
$SUPABASE_CMD functions deploy liqpay-webhook || exit 1

echo ""
echo "✅ Deployment successful!"
echo ""
echo "Webhook URL: https://${PROJECT_REF}.functions.supabase.co/liqpay-webhook"
echo ""
echo "Next steps:"
echo "1. Test with a real order"
echo "2. Check logs: $SUPABASE_CMD functions logs liqpay-webhook"
echo "3. Verify orders appear in admin panel after payment"

