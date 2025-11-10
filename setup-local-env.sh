#!/bin/bash
# Bash script to create .env.local file for local development
# Run this script to set up your local environment variables

ENV_FILE=".env.local"

# Check if file already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. File not modified."
        exit 0
    fi
fi

# Create the .env.local file
cat > "$ENV_FILE" << 'EOF'
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
EOF

echo "✅ Created .env.local successfully!"
echo "📝 File location: $(pwd)/$ENV_FILE"
echo ""
echo "Next steps:"
echo "1. Restart your dev server if it's running"
echo "2. Test email sending with: npm run dev (or your dev command)"
echo "3. Check email config at: http://localhost:PORT/api/env-check"

