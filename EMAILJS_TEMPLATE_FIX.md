# EmailJS Template Configuration Fix

## The Problem
Error: "The recipients address is empty" (422)

This means your EmailJS template's "To Email" field is not configured to use the `{{to_email}}` variable.

## Solution

### Step 1: Fix Customer Template (`template_gjxblw6`)

1. Go to https://www.emailjs.com/
2. Log in to your account
3. Go to **Email Templates**
4. Open template `template_gjxblw6` (Customer Order Confirmation)
5. Look for the **"To Email"** field (usually at the top of the template editor)
6. **IMPORTANT**: Make sure it says: `{{to_email}}` (not a static email address)
7. If it's blank or has a static email, change it to: `{{to_email}}`
8. Click **Save**

### Step 2: Fix Admin Template (`template_4ft87b9`)

1. Open template `template_4ft87b9` (Admin Order Notification)
2. In the **"To Email"** field, set it to: `{{to_email}}`
3. Click **Save**

### Step 3: Verify Template Variables

Make sure both templates have these variables available:
- `{{to_email}}` - Recipient email (REQUIRED)
- `{{to_name}}` - Recipient name
- `{{order_id}}` - Order number
- `{{order_date}}` - Order date
- `{{order_items_html}}` - HTML for order items
- `{{customer_name}}` - Customer name
- `{{customer_email}}` - Customer email
- `{{customer_phone}}` - Customer phone
- `{{shipping_address}}` - Shipping address
- `{{order_total}}` - Total price
- `{{payment_method}}` - Payment method
- `{{shipping_method}}` - Shipping method
- `{{order_notes}}` - Order notes

### Step 4: Test Again

After fixing the templates:
1. Restart your dev server
2. Go to Checkout page
3. Click "🧪 Auto-fill (TEST)"
4. Click "Надіслати тестовий лист (EmailJS)"
5. It should work now!

## Quick Check

If you're not sure where the "To Email" field is:
- In EmailJS template editor, look for a field labeled "To Email" or "Recipient"
- It should be at the top of the template settings
- It might be in a "Settings" or "Configuration" tab

## Alternative: Use Static Email (Not Recommended)

If you want to use static emails instead of dynamic ones:
- Set "To Email" to a fixed address like `godavid@gmail.com`
- But this means all emails will go to the same address (not dynamic)

The dynamic approach with `{{to_email}}` is better for production.

