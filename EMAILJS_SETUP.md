# EmailJS Setup Guide

## Environment Variables Required

Add these to your Netlify environment variables:

1. **EMAILJS_SERVICE_ID** - `service_kifgtn2`
2. **EMAILJS_TEMPLATE_ID_CUSTOMER** - `template_gjxblw6` (customer confirmation)
3. **EMAILJS_TEMPLATE_ID_ADMIN** - `template_4ft87b9` (admin notification)
4. **EMAILJS_PUBLIC_KEY** - `dK2FblsCDGEM8ZpPq` (User ID)
5. **ADMIN_EMAILS** - Comma-separated list of admin emails (e.g., "davidnuk877@gmil.com,other@example.com")

## EmailJS Template Variables

### Customer Confirmation Template Variables:
- `{{to_email}}` - Customer email address
- `{{to_name}}` - Customer name
- `{{order_id}}` - Order number
- `{{order_date}}` - Order date (DD.MM.YYYY format)
- `{{order_items_html}}` - HTML for all order items (generated automatically)
- `{{customer_name}}` - Customer name
- `{{billing_address}}` - Billing/shipping address
- `{{customer_phone}}` - Customer phone
- `{{customer_email}}` - Customer email
- `{{shipping_address}}` - Shipping address
- `{{order_notes}}` - Order notes/comments
- `{{order_total}}` - Total price (₴XXX.XX)
- `{{shipping_method}}` - Delivery method
- `{{payment_method}}` - Payment method

### Admin Notification Template Variables:
- `{{to_email}}` - Admin email address
- `{{customer_name}}` - Customer name
- `{{customer_email}}` - Customer email
- `{{customer_phone}}` - Customer phone
- `{{order_id}}` - Order number
- `{{order_total}}` - Total price (₴XXX.XX)
- `{{order_items}}` - Text list of order items
- `{{shipping_address}}` - Full shipping address with details
- `{{payment_method}}` - Payment method
- `{{notes}}` - Order notes/comments

## How It Works

1. **Order Confirmation**: When an order is confirmed (payment successful or cash order saved), emails are automatically sent:
   - Customer receives confirmation email
   - Admin(s) receive notification email

2. **Data Safety**: The system only uses data that exists:
   - Missing fields have fallbacks
   - HTML is escaped to prevent XSS
   - Email failures don't break order processing

3. **Email Sending**:
   - For online payments: Sent after LiqPay confirms payment
   - For cash payments: Sent immediately after order is saved
   - Uses EmailJS REST API (server-side)

## Setup Steps

1. Create EmailJS account at https://www.emailjs.com/
2. Create an email service (Gmail, Outlook, etc.)
3. Create two email templates (customer and admin)
4. Copy the template HTML from `email-templates/customer-order-confirmation.html` to EmailJS
5. Add template variables using `{{variable_name}}` syntax
6. Add environment variables to Netlify
7. Test by placing an order

## Notes

- Emails are sent asynchronously - order processing doesn't wait for email success
- Email failures are logged but don't affect order saving
- All data is pulled from the database to ensure accuracy
- HTML for order items is generated dynamically with proper escaping

