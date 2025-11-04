# PowerShell script to deploy Supabase Edge Function for LiqPay webhook
# Run this script after setting the required environment variables

Write-Host "Deploying Supabase Edge Function for LiqPay Webhook..." -ForegroundColor Cyan

# Check if Supabase CLI is available
try {
    $version = npx supabase --version 2>&1
    Write-Host "Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "Supabase CLI not found. Using npx..." -ForegroundColor Yellow
}

# Get access token (user needs to provide this)
$accessToken = $env:SUPABASE_ACCESS_TOKEN
if (-not $accessToken) {
    Write-Host ""
    Write-Host "SUPABASE_ACCESS_TOKEN not set!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your access token:" -ForegroundColor Cyan
    Write-Host "1. Go to https://supabase.com/dashboard/account/tokens" -ForegroundColor White
    Write-Host "2. Create a new access token" -ForegroundColor White
    Write-Host "3. Run: `$env:SUPABASE_ACCESS_TOKEN='your_token_here'" -ForegroundColor White
    Write-Host "4. Then run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Get LiqPay keys (check environment or Netlify env vars)
$liqpayPublic = $env:LIQPAY_PUBLIC_KEY
$liqpayPrivate = $env:LIQPAY_PRIVATE_KEY

if (-not $liqpayPublic -or -not $liqpayPrivate) {
    Write-Host "LiqPay keys not found in environment variables!" -ForegroundColor Yellow
    Write-Host "Set them with:" -ForegroundColor Cyan
    Write-Host "`$env:LIQPAY_PUBLIC_KEY='your_public_key'" -ForegroundColor White
    Write-Host "`$env:LIQPAY_PRIVATE_KEY='your_private_key'" -ForegroundColor White
    exit 1
}

# Get Supabase service role key
$serviceRole = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceRole) {
    Write-Host "SUPABASE_SERVICE_ROLE_KEY not found!" -ForegroundColor Yellow
    Write-Host "Get it from: Supabase Dashboard -> Project Settings -> API -> service_role key" -ForegroundColor Cyan
    Write-Host "Set it with: `$env:SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'" -ForegroundColor White
    exit 1
}

# Supabase project details
$projectRef = "umynzgzlqdphgrzixhsc"
$supabaseUrl = "https://$projectRef.supabase.co"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Project Ref: $projectRef" -ForegroundColor White
Write-Host "  Supabase URL: $supabaseUrl" -ForegroundColor White
if ($liqpayPublic) {
    $keyPreview = if ($liqpayPublic.Length -gt 10) { $liqpayPublic.Substring(0, 10) } else { $liqpayPublic }
    Write-Host "  LiqPay Public Key: $keyPreview..." -ForegroundColor White
}
Write-Host ""

# Link project
Write-Host "Linking Supabase project..." -ForegroundColor Cyan
npx supabase link --project-ref $projectRef 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to link project" -ForegroundColor Red
    exit 1
}
Write-Host "Project linked" -ForegroundColor Green

# Set secrets
Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Cyan
npx supabase secrets set LIQPAY_PUBLIC=$liqpayPublic 2>&1 | Out-Host
npx supabase secrets set LIQPAY_PRIVATE=$liqpayPrivate 2>&1 | Out-Host
npx supabase secrets set SUPABASE_URL=$supabaseUrl 2>&1 | Out-Host
npx supabase secrets set SUPABASE_SERVICE_ROLE=$serviceRole 2>&1 | Out-Host
Write-Host "Secrets set" -ForegroundColor Green

# Deploy function
Write-Host ""
Write-Host "Deploying Edge Function..." -ForegroundColor Cyan
npx supabase functions deploy liqpay-webhook 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Webhook URL: https://$projectRef.functions.supabase.co/liqpay-webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test with a real order" -ForegroundColor White
Write-Host "2. Check logs: npx supabase functions logs liqpay-webhook" -ForegroundColor White
Write-Host "3. Verify orders appear in admin panel after payment" -ForegroundColor White
