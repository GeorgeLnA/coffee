# Email Templates for THE COFFEE MANIFEST

## Customer Order Confirmation Email

### File: `customer-order-confirmation.html`

This is a modern, responsive email template for customer order confirmations.

### Features

- ✅ Modern design with website colors (#361c0c brown, #fcf4e4 cream)
- ✅ Responsive layout (mobile-friendly)
- ✅ Logo integration
- ✅ All template variables preserved
- ✅ Clean, professional layout

### Colors Used

- **Primary Brown**: `#361c0c` (main brand color)
- **Cream/Beige**: `#fcf4e4` (accent color)
- **Dark Brown**: `#1f0a03` (text color)
- **Gold Accent**: `#d59e53` (notes section accent)
- **Gray**: `#878787` (footer text)

### Template Variables

All variables are preserved from the original template:

- `{{customer_name}}` - Customer's full name
- `{{order_id}}` - Order ID
- `{{order_date}}` - Order date (formatted)
- `{{order_items_html}}` - Order items (formatted text)
- `{{order_total}}` - Total amount (e.g., "₴550.00")
- `{{shipping_address}}` - Shipping address
- `{{shipping_method}}` - Shipping method
- `{{payment_method}}` - Payment method
- `{{customer_phone}}` - Customer phone number
- `{{customer_email}}` - Customer email
- `{{order_notes}}` - Order notes (optional, can be empty)

### How to Use in EmailJS

1. **Open EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com
   - Navigate to Email Templates

2. **Create/Edit Template**
   - Create a new template or edit the existing customer order confirmation template
   - Set the template name (e.g., "Customer Order Confirmation")

3. **Copy HTML Content**
   - Open `customer-order-confirmation.html`
   - Copy the entire HTML content
   - Paste it into the EmailJS template editor

4. **Update Logo URL**
   - The template uses: `https://manifestcoffee.com.ua/manifest-site-logo.png`
   - Make sure this URL is accessible and the logo file exists
   - Or update the URL to your actual logo location

5. **Test the Template**
   - Use EmailJS's test feature to send a test email
   - Verify all variables are displaying correctly
   - Check on both desktop and mobile email clients

### Notes

- The template uses modern CSS which works in most email clients (Gmail, Outlook, Apple Mail, etc.)
- For maximum compatibility, you may need to convert to table-based layout (if issues arise)
- The notes section will show even if empty (EmailJS doesn't support conditionals)
- All styling is inline or in `<style>` tag for better email client support

### Logo

Make sure the logo is accessible at:
- `https://manifestcoffee.com.ua/manifest-site-logo.png`

Or update the logo URL in the template to match your actual logo location.

### Customization

To customize colors:
- Search and replace `#361c0c` with your desired brown color
- Search and replace `#fcf4e4` with your desired cream color
- Search and replace `#d59e53` with your desired accent color

### Support

If you encounter issues:
1. Check that all template variables are correctly named
2. Verify the logo URL is accessible
3. Test in multiple email clients
4. Check EmailJS logs for any errors

