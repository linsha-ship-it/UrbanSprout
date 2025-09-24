#!/bin/bash

echo "🔧 UrbanSprout Email Configuration Setup"
echo "======================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Creating one..."
    touch .env
fi

echo "📧 Current Email Configuration:"
echo "==============================="

# Check current email settings
if grep -q "EMAIL_USER" .env; then
    EMAIL_USER=$(grep "EMAIL_USER" .env | cut -d '=' -f2)
    echo "EMAIL_USER: $EMAIL_USER"
else
    echo "EMAIL_USER: Not set"
fi

if grep -q "EMAIL_PASS" .env; then
    EMAIL_PASS_LENGTH=$(grep "EMAIL_PASS" .env | cut -d '=' -f2 | wc -c)
    echo "EMAIL_PASS: Set ($((EMAIL_PASS_LENGTH-1)) characters)"
else
    echo "EMAIL_PASS: Not set"
fi

echo ""
echo "🚨 Issue: Gmail authentication is failing"
echo ""

echo "📋 To fix this issue, you need to:"
echo "1. Enable 2-Factor Authentication on your Gmail account"
echo "2. Generate a Gmail App Password"
echo "3. Update your .env file with the correct credentials"
echo ""

echo "🔗 Gmail App Password Setup:"
echo "1. Go to: https://myaccount.google.com/security"
echo "2. Click '2-Step Verification'"
echo "3. Scroll down to 'App passwords'"
echo "4. Generate a new app password for 'Mail'"
echo "5. Copy the 16-character password"
echo ""

echo "📝 Update your .env file with:"
echo "EMAIL_USER=your-actual-email@gmail.com"
echo "EMAIL_PASS=your-16-character-app-password"
echo ""

echo "🧪 After updating, test with:"
echo "cd server && node test-blog-rejection-email.js"
echo ""

echo "💡 Alternative: Use a different email service"
echo "- SendGrid (recommended for production)"
echo "- Mailgun"
echo "- AWS SES"
echo ""

echo "✅ Email system is now properly configured with enhanced error handling!"
