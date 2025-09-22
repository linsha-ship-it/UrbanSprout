# 📧 Email Setup Guide for UrbanSprout

## Overview
UrbanSprout includes a password reset system that can send reset links via email. This guide shows you how to configure email sending.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### Step 3: Update Environment Variables
Edit `/server/.env` and update these values:

```env
# Replace with your actual Gmail address
EMAIL_USER=your-gmail@gmail.com

# Replace with the 16-character app password from Step 2
EMAIL_PASS=your-app-password-here

# Your frontend URL (usually correct already)
FRONTEND_URL=http://localhost:5173
```

### Step 4: Restart Server
```bash
cd server
npm start
```

## Alternative Email Providers

### SendGrid (Recommended for Production)
```bash
npm install @sendgrid/mail
```

Update `/server/utils/emailService.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Use SendGrid instead of nodemailer
```

### AWS SES
```bash
npm install aws-sdk
```

### Mailgun
```bash
npm install mailgun-js
```

## Current Behavior

**Without Email Setup:**
- Password reset generates secure link
- Link displayed directly in the modal
- User can copy and use the link immediately

**With Email Setup:**
- Password reset email sent to user's inbox
- Professional HTML email template
- Secure 10-minute expiration
- Fallback to direct link if email fails

## Testing

Test the forgot password functionality:

1. Go to login page
2. Click "Forgot password?"
3. Enter email address
4. Check result:
   - **With email setup**: "Password reset link sent to your email"
   - **Without email setup**: Direct link displayed in modal

## Security Features

- ✅ Secure token generation (32 bytes)
- ✅ Token hashing in database
- ✅ 10-minute expiration
- ✅ One-time use tokens
- ✅ User verification before sending
- ✅ HTML email templates with security warnings

## Production Recommendations

1. **Use professional email service** (SendGrid, AWS SES, Mailgun)
2. **Set up proper domain** for email sending
3. **Configure SPF/DKIM** records for deliverability
4. **Monitor email delivery** rates
5. **Set up email templates** in your email service provider

---

**Note**: The current system works perfectly for development and testing. For production use, configure one of the email providers above.





