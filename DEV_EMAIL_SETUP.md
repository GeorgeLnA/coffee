# Dev Email Setup Guide

## Quick Setup for Development

To send emails in **dev environment** (when running `pnpm dev`), add these variables to `.env.local`:

```bash
# EmailJS Configuration (for dev)
EMAILJS_SERVICE_ID=service_kifgtn2
EMAILJS_TEMPLATE_ID_CUSTOMER=template_gjxblw6
EMAILJS_TEMPLATE_ID_ADMIN=template_4ft87b9
EMAILJS_PUBLIC_KEY=dK2FblsCDGEM8ZpPq
EMAILJS_PRIVATE_KEY=fsRkVV2V-5QgUXiKztym5
ADMIN_EMAILS=davidnuk877@gmail.com
```

## How It Works

1. **With EmailJS configured**: When you place a cash order, emails will be sent via EmailJS (same as production)
2. **Without EmailJS**: The server falls back to Ethereal (dev mailer) which shows preview URLs in your terminal

## Testing

1. Add the variables above to `.env.local`
2. Restart your dev server (`pnpm dev`)
3. Place a test cash order
4. Check your terminal for:
   - `✓ Customer confirmation email sent` - EmailJS worked
   - OR preview URLs if using Ethereal fallback
5. Check your browser console for `emailStatus` in the order response

## Troubleshooting

- **Server logs show "EMAILJS not configured"**: Check `.env.local` has all variables
- **Server logs show "EMAILJS configured" but no emails**: Check EmailJS template has `{{to_email}}` in "To Email" field
- **403 error**: Make sure `EMAILJS_PRIVATE_KEY` is set (required for server-side API calls)

## Production vs Dev

- **Dev** (`pnpm dev`): Uses Express server at `server/routes/orders.ts` → reads from `.env.local`
- **Production** (Netlify): Uses Netlify functions → reads from Netlify environment variables

Both use the same EmailJS sending logic, just different env var sources!

