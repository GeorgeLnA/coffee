#!/bin/bash

# EmailJS Environment Variables Setup Script for Netlify
# This script automatically sets all required EmailJS environment variables

echo "========================================="
echo "EmailJS Environment Variables Setup"
echo "========================================="
echo ""

# Check if Netlify CLI is installed
echo "Checking for Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo "Failed to install Netlify CLI. Please install it manually:"
        echo "  npm install -g netlify-cli"
        exit 1
    fi
fi

# Check if logged in
echo ""
echo "Checking Netlify login status..."
if ! netlify status &> /dev/null || netlify status 2>&1 | grep -q "Not logged in"; then
    echo "You need to log in to Netlify first."
    echo "Running: netlify login"
    netlify login
    if [ $? -ne 0 ]; then
        echo "Failed to log in. Please try again."
        exit 1
    fi
fi

# Check if site is linked
echo ""
echo "Checking if site is linked..."
if ! netlify status 2>&1 | grep -q "Site id"; then
    echo "Site not linked. Please link your site:"
    echo "  netlify link"
    echo ""
    read -p "Do you want to link now? (y/n) " link
    if [ "$link" = "y" ] || [ "$link" = "Y" ]; then
        netlify link
        if [ $? -ne 0 ]; then
            echo "Failed to link site. Please run 'netlify link' manually."
            exit 1
        fi
    else
        echo "Please link your site first with 'netlify link', then run this script again."
        exit 1
    fi
fi

# EmailJS credentials
declare -A envVars=(
    ["EMAILJS_SERVICE_ID"]="service_kifgtn2"
    ["EMAILJS_TEMPLATE_ID_CUSTOMER"]="template_gjxblw6"
    ["EMAILJS_TEMPLATE_ID_ADMIN"]="template_4ft87b9"
    ["EMAILJS_PUBLIC_KEY"]="dK2FblsCDGEM8ZpPq"
    ["ADMIN_EMAILS"]="davidnuk877@gmail.com"
)

echo ""
echo "Setting environment variables..."
echo ""

successCount=0
failCount=0

for key in "${!envVars[@]}"; do
    echo -n "Setting $key... "
    if netlify env:set "$key" "${envVars[$key]}" --context production &> /dev/null; then
        echo "✓"
        ((successCount++))
    else
        echo "✗"
        ((failCount++))
    fi
done

# Also set for all contexts (deploy previews, branch deploys)
echo ""
echo "Setting for all contexts (deploy previews, branch deploys)..."
for key in "${!envVars[@]}"; do
    echo -n "Setting $key for all contexts... "
    if netlify env:set "$key" "${envVars[$key]}" --context all &> /dev/null; then
        echo "✓"
    else
        echo "✗"
    fi
done

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Successfully set: $successCount variables"
if [ $failCount -gt 0 ]; then
    echo "Failed: $failCount variables"
fi
echo ""
echo "Next steps:"
echo "1. Redeploy your site (or wait for next auto-deploy)"
echo "2. Upload email templates to EmailJS (see EMAILJS_TEMPLATE_SETUP.md)"
echo "3. Test by placing an order"
echo ""

