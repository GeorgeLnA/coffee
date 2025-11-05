# EmailJS Template Setup Instructions

## Quick Setup

Your EmailJS credentials are already configured in the code. You just need to:

1. **Add environment variables to Netlify** (see `NETLIFY_EMAILJS_SETUP.md`)
2. **Upload templates to EmailJS** (see below)
3. **Test** by placing an order

## Template Files

1. **Customer Confirmation**: `email-templates/customer-order-confirmation.html`
2. **Admin Notification**: `email-templates/admin-order-notification.html`

## Uploading Templates to EmailJS

### Step 1: Create Templates in EmailJS

1. Go to https://www.emailjs.com/
2. Log in to your account
3. Go to **Email Templates**

### Step 2: Create Customer Confirmation Template

1. Click **Create New Template**
2. **Template Name**: "Customer Order Confirmation"
3. **Service**: Select your service (`service_kifgtn2`)
4. **Subject**: `Підтвердження замовлення #{{order_id}}`
5. **Content**: Copy the entire HTML from `email-templates/customer-order-confirmation.html`
6. **Template ID**: Should be `template_gjxblw6` (or update Netlify env var if different)
7. Click **Save**

### Step 3: Create Admin Notification Template

1. Click **Create New Template**
2. **Template Name**: "Admin Order Notification"
3. **Service**: Select your service (`service_kifgtn2`)
4. **Subject**: `Нове замовлення: #{{order_id}}`
5. **Content**: Copy the entire HTML from `email-templates/admin-order-notification.html`
6. **Template ID**: Should be `template_4ft87b9` (or update Netlify env var if different)
7. Click **Save**

## Template Variables Reference

### Customer Template Variables
All variables are automatically filled by the system:
- `{{to_email}}` - Customer email
- `{{to_name}}` - Customer name
- `{{order_id}}` - Order number
- `{{order_date}}` - Order date (DD.MM.YYYY)
- `{{order_items_html}}` - **HTML for all order items** (auto-generated)
- `{{customer_name}}` - Customer name
- `{{billing_address}}` - Billing address
- `{{customer_phone}}` - Customer phone
- `{{customer_email}}` - Customer email
- `{{shipping_address}}` - Shipping address
- `{{order_notes}}` - Order notes
- `{{order_total}}` - Total (₴XXX.XX)
- `{{shipping_method}}` - Delivery method
- `{{payment_method}}` - Payment method

### Admin Template Variables
All variables are automatically filled by the system:
- `{{to_email}}` - Admin email
- `{{customer_name}}` - Customer name
- `{{customer_email}}` - Customer email
- `{{customer_phone}}` - Customer phone
- `{{order_id}}` - Order number
- `{{order_date}}` - Order date (e.g., "15 Жовтня, 2025")
- `{{order_items_html}}` - **HTML table for all order items** (auto-generated)
- `{{order_items}}` - Text version (backup)
- `{{billing_address}}` - Billing address
- `{{shipping_address}}` - Shipping address
- `{{shipping_method}}` - Delivery method
- `{{shipping_cost}}` - Shipping cost
- `{{order_total}}` - Total (₴XXX.XX)
- `{{payment_method}}` - Payment method
- `{{notes}}` - Order notes

## Important Notes

1. **Order Items HTML**: The `{{order_items_html}}` variable contains fully formatted HTML with images, names, quantities, and prices. Just paste it into your template where you want the items to appear.

2. **Template IDs**: Make sure the template IDs in EmailJS match the environment variables in Netlify.

3. **Testing**: After setting up, test by placing an order. Check Netlify function logs if emails don't send.

4. **Publishing**: Make sure templates are **published** in EmailJS (not just saved as drafts).

