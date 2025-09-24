# Email Setup - Almost Complete! 🚀

## Current Status
✅ **Email address configured**: `linshan2026@mca.ajce.in`
❌ **Email password needed**: Still using placeholder

## Final Step: Add Your Gmail App Password

### Option 1: Use the Setup Script (Recommended)
```bash
cd /Users/linsha/Downloads/UrbanSprout-main
./update-email-password.sh
```

### Option 2: Manual Setup
1. **Get your Gmail App Password**:
   - Go to your Gmail account settings
   - Enable 2-Factor Authentication (if not already enabled)
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

2. **Update the password**:
   Edit `/Users/linsha/Downloads/UrbanSprout-main/server/.env`:
   ```bash
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Restart the server**:
   ```bash
   cd /Users/linsha/Downloads/UrbanSprout-main/server
   pkill -f "node server.js" && npm start
   ```

## Test Email Functionality

### Test the configuration:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
node test-email-config.js
```

### Test from the admin panel:
1. Go to Admin → Orders
2. Click "Send Email" on any order
3. Enter a test message
4. Check if the recipient receives the email

## What's Already Working

### ✅ Configured:
- **Email address**: `linshan2026@mca.ajce.in`
- **SMTP settings**: Gmail configuration
- **Email templates**: HTML templates with UrbanSprout branding
- **Email functions**: Custom emails and status notifications

### 🔧 Need to Complete:
- **Gmail App Password**: 16-character password from Google

## Email Features Ready

### 📧 Custom Email Sending
- Send personalized emails to customers
- HTML templates with UrbanSprout branding
- Order details included

### 🔔 Status Update Notifications
- Automatic emails when order status changes
- Status-specific messaging
- Professional email templates

## Troubleshooting

### If you get "Invalid login" error:
1. **Check 2FA is enabled** on your Gmail account
2. **Use App Password** (not regular password)
3. **Remove spaces** from the app password
4. **Wait a few minutes** after generating the app password

### If emails still don't send:
1. **Check server logs** for error messages
2. **Verify email address** is correct
3. **Test with a simple email** first

## Quick Commands

### Check current config:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
grep -E "EMAIL_USER|EMAIL_PASS" .env
```

### Update password:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main
./update-email-password.sh
```

### Test email:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
node test-email-config.js
```

### Restart server:
```bash
cd /Users/linsha/Downloads/UrbanSprout-main/server
pkill -f "node server.js" && npm start
```

## After Setup

Once you add your Gmail App Password:
- ✅ Real emails will be sent to customers
- ✅ HTML templates with UrbanSprout branding
- ✅ Order details included
- ✅ Status-specific messaging
- ✅ Professional email system

**You're just one step away from having a fully functional email system!** 🎉