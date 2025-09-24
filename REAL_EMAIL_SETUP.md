# Real Email Setup Guide - UrbanSprout

## Current Status
❌ **Email is in simulation mode** - emails are logged to console but not actually sent
✅ **Email functionality is working** - just needs real credentials

## Quick Fix: Enable Real Email Sending

### Step 1: Get Gmail App Password
1. **Go to your Gmail account**
2. **Enable 2-Factor Authentication** (if not already enabled)
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Follow the setup process

3. **Generate App Password**
   - In Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 2: Update Email Configuration
Edit the file: `/Users/linsha/Downloads/UrbanSprout-main/server/.env`

**Replace these lines:**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**With your real credentials:**
```bash
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Example:**
```bash
EMAIL_USER=linshan2026@mca.ajce.in
EMAIL_PASS=abcd efgh ijkl mnop
```

### Step 3: Restart Server
After updating the .env file:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
pkill -f "node server.js"
npm start
```

### Step 4: Test Email
1. Go to Admin → Orders
2. Click "Send Email" on any order
3. Enter a test message
4. Check if the recipient receives the email

## Alternative: Use a Different Email Service

### Option 1: Outlook/Hotmail
```bash
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Option 2: Yahoo Mail
```bash
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## Troubleshooting

### If you get "Invalid login" error:
1. **Check 2FA is enabled** on your Gmail account
2. **Use App Password** (not your regular password)
3. **Remove spaces** from the app password
4. **Wait a few minutes** after generating the app password

### If emails still don't send:
1. **Check server logs** for error messages
2. **Verify email address** is correct
3. **Test with a simple email** first

## Current Email Features

### ✅ What's Working:
- **Custom Email Sending**: Send personalized emails to customers
- **Status Update Notifications**: Automatic emails when order status changes
- **HTML Email Templates**: Beautiful, branded email templates
- **Error Handling**: Graceful fallback when email fails

### 📧 Email Types:
1. **Custom Emails**: Admin can send any message to customers
2. **Status Notifications**: Automatic emails for order updates

### 🎨 Email Template Features:
- UrbanSprout branding
- Responsive HTML design
- Order details included
- Professional styling

## Test Email Functionality

### Before Setup (Simulation Mode):
- ✅ Emails are logged to console
- ❌ No actual emails are sent
- ✅ Perfect for development

### After Setup (Real Mode):
- ✅ Real emails are sent to customers
- ✅ HTML templates with UrbanSprout branding
- ✅ Order details included
- ✅ Status-specific messaging

## Quick Commands

### Check current email config:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
grep -E "EMAIL_USER|EMAIL_PASS" .env
```

### Restart server:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
pkill -f "node server.js" && npm start
```

### Test email endpoint:
```bash
curl -X POST "http://localhost:5001/api/admin/orders/[ORDER_ID]/send-email" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test email", "subject": "Test"}'
```

## Need Help?

If you're still having issues:
1. **Check server logs** for error messages
2. **Verify Gmail settings** (2FA + App Password)
3. **Test with a simple email** first
4. **Check spam folder** of recipient

The email system is fully functional - it just needs real credentials to send actual emails! 🚀


