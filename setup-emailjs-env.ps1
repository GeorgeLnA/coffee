# EmailJS Environment Variables Setup Script for Netlify
# This script automatically sets all required EmailJS environment variables

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "EmailJS Environment Variables Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
Write-Host "Checking for Netlify CLI..." -ForegroundColor Yellow
$netlifyCmd = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyCmd) {
    Write-Host "Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Netlify CLI. Please install it manually:" -ForegroundColor Red
        Write-Host "  npm install -g netlify-cli" -ForegroundColor Yellow
        exit 1
    }
}

# Check if logged in
Write-Host ""
Write-Host "Checking Netlify login status..." -ForegroundColor Yellow
$loginStatus = netlify status 2>&1
if ($LASTEXITCODE -ne 0 -or $loginStatus -match "Not logged in") {
    Write-Host "You need to log in to Netlify first." -ForegroundColor Yellow
    Write-Host "Running: netlify login" -ForegroundColor Yellow
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to log in. Please try again." -ForegroundColor Red
        exit 1
    }
}

# Check if site is linked
Write-Host ""
Write-Host "Checking if site is linked..." -ForegroundColor Yellow
$siteInfo = netlify status 2>&1 | Select-String "Site id"
if (-not $siteInfo) {
    Write-Host "Site not linked. Please link your site:" -ForegroundColor Yellow
    Write-Host "  netlify link" -ForegroundColor Cyan
    Write-Host ""
    $link = Read-Host "Do you want to link now? (y/n)"
    if ($link -eq "y" -or $link -eq "Y") {
        netlify link
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to link site. Please run 'netlify link' manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Please link your site first with 'netlify link', then run this script again." -ForegroundColor Red
        exit 1
    }
}

# EmailJS credentials
$envVars = @{
    "EMAILJS_SERVICE_ID" = "service_kifgtn2"
    "EMAILJS_TEMPLATE_ID_CUSTOMER" = "template_gjxblw6"
    "EMAILJS_TEMPLATE_ID_ADMIN" = "template_4ft87b9"
    "EMAILJS_PUBLIC_KEY" = "dK2FblsCDGEM8ZpPq"
    "ADMIN_EMAILS" = "davidnuk877@gmil.com"
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Yellow -NoNewline
    $result = netlify env:set $key $envVars[$key] --context production 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
        $failCount++
    }
}

# Also set for all contexts (deploy previews, branch deploys)
Write-Host ""
Write-Host "Setting for all contexts (deploy previews, branch deploys)..." -ForegroundColor Yellow
foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key for all contexts..." -ForegroundColor Yellow -NoNewline
    $result = netlify env:set $key $envVars[$key] --context all 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓" -ForegroundColor Green
    } else {
        Write-Host " ✗" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Successfully set: $successCount variables" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "Failed: $failCount variables" -ForegroundColor Red
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Redeploy your site (or wait for next auto-deploy)" -ForegroundColor White
Write-Host "2. Upload email templates to EmailJS (see EMAILJS_TEMPLATE_SETUP.md)" -ForegroundColor White
Write-Host "3. Test by placing an order" -ForegroundColor White
Write-Host ""

