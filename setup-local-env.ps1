# PowerShell script to create .env.local file for local development
# Run this script to set up your local environment variables

$envContent = @"
# Local development environment variables
# These match production credentials for local testing

# Admin emails (comma-separated)
ADMIN_EMAILS=dovedem2014@gmail.com,manifestcava@gmail.com

# EmailJS Configuration (Server-side)
EMAILJS_PRIVATE_KEY=fsRkVV2V-5QgUXiKztym5
EMAILJS_PUBLIC_KEY=dK2FblsCDGEM8ZpPq
EMAILJS_SERVICE_ID=service_kifgtn2
EMAILJS_TEMPLATE_ID_ADMIN=template_4ft87b9
EMAILJS_TEMPLATE_ID_CUSTOMER=template_gjxblw6

# EmailJS Configuration (Client-side - VITE_ prefix for browser access)
VITE_EMAILJS_SERVICE_ID=service_kifgtn2
VITE_EMAILJS_TEMPLATE_ID_CUSTOMER=template_gjxblw6
VITE_EMAILJS_TEMPLATE_ID_ADMIN=template_4ft87b9
VITE_EMAILJS_PUBLIC_KEY=dK2FblsCDGEM8ZpPq
VITE_ADMIN_EMAILS=dovedem2014@gmail.com,manifestcava@gmail.com

# LiqPay Configuration
LIQPAY_PRIVATE_KEY=gwxU7Bt9xkQqtEzOFx5ONf9NNfPSjNVeRw6ia6vC
LIQPAY_PUBLIC_KEY=i86224349673
VITE_LIQPAY_PUBLIC_KEY=i86224349673

# Nova Poshta API
NOVA_POSHTA_API_KEY=1f792b1eed193f4ba386b22665acbacb

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCwh78UurHpW0STWeEqCsD00SJqhzvB05c
"@

$envFile = ".env.local"

# Check if file already exists
if (Test-Path $envFile) {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled. File not modified." -ForegroundColor Yellow
        exit 0
    }
}

# Write the file
try {
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
    Write-Host "SUCCESS: Created .env.local successfully!" -ForegroundColor Green
    Write-Host "File location: $(Resolve-Path $envFile)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your dev server if it is running" -ForegroundColor White
    Write-Host "2. Test email sending with: npm run dev (or your dev command)" -ForegroundColor White
    Write-Host "3. Check email config at: http://localhost:PORT/api/env-check" -ForegroundColor White
} catch {
    Write-Host "ERROR: Failed to create .env.local" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

