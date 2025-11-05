# Netlify Environment Variables - EmailJS Configuration

## ✅ Your EmailJS Credentials

- **Service ID**: `service_kifgtn2`
- **Customer Template ID**: `template_gjxblw6`
- **Admin Template ID**: `template_4ft87b9`
- **Public Key (User ID)**: `dK2FblsCDGEM8ZpPq`

## Required Environment Variables

Add these to your Netlify site settings:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

### EmailJS Configuration
- **Variable**: `EMAILJS_SERVICE_ID`
  - **Value**: `service_kifgtn2`
  - **Scopes**: All scopes (Production, Deploy previews, Branch deploys)

- **Variable**: `EMAILJS_TEMPLATE_ID_CUSTOMER`
  - **Value**: `template_gjxblw6`
  - **Scopes**: All scopes

- **Variable**: `EMAILJS_TEMPLATE_ID_ADMIN`
  - **Value**: `template_4ft87b9`
  - **Scopes**: All scopes

- **Variable**: `EMAILJS_PUBLIC_KEY`
  - **Value**: `dK2FblsCDGEM8ZpPq`
  - **Scopes**: All scopes

- **Variable**: `ADMIN_EMAILS`
  - **Value**: `davidnuk877@gmil.com` (or comma-separated: `email1@example.com,email2@example.com`)
  - **Scopes**: All scopes

## How to Add in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each variable above with its corresponding value
6. Make sure **Scopes** is set to **All scopes** for all variables

## Testing

After adding the environment variables:
1. Redeploy your site (or trigger a new deployment)
2. Place a test order
3. Check that:
   - Customer receives confirmation email
   - Admin receives notification email

## Troubleshooting

- If emails don't send, check Netlify function logs for errors
- Verify all environment variables are set correctly
- Make sure EmailJS templates are published and active
- Check that EmailJS service is connected and active

