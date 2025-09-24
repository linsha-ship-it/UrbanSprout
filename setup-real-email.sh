#!/bin/bash

echo "🌱 UrbanSprout - Real Email Setup"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    echo "Please make sure you're in the UrbanSprout root directory."
    exit 1
fi

echo "📧 Current email configuration:"
grep -E "EMAIL_USER|EMAIL_PASS" server/.env
echo ""

echo "🔧 To enable real email sending:"
echo ""
echo "1. Go to your Gmail account settings"
echo "2. Enable 2-Factor Authentication"
echo "3. Generate an App Password:"
echo "   - Security → 2-Step Verification → App passwords"
echo "   - Select 'Mail' as the app"
echo "   - Copy the 16-character password"
echo ""

read -p "Enter your Gmail address: " email_user
read -p "Enter your Gmail App Password: " email_pass

# Remove spaces from app password
email_pass=$(echo "$email_pass" | tr -d ' ')

echo ""
echo "📝 Updating email configuration..."

# Backup original .env
cp server/.env server/.env.backup

# Update email configuration
sed -i.bak "s/EMAIL_USER=.*/EMAIL_USER=$email_user/" server/.env
sed -i.bak "s/EMAIL_PASS=.*/EMAIL_PASS=$email_pass/" server/.env

# Remove backup file
rm server/.env.bak

echo "✅ Email configuration updated!"
echo ""

echo "📧 New email configuration:"
grep -E "EMAIL_USER|EMAIL_PASS" server/.env
echo ""

echo "🔄 Restarting server..."
cd server
pkill -f "node server.js" 2>/dev/null
sleep 2
npm start &
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🧪 Test the email functionality:"
echo "1. Go to Admin → Orders"
echo "2. Click 'Send Email' on any order"
echo "3. Enter a test message"
echo "4. Check if the recipient receives the email"
echo ""
echo "📋 If you have issues:"
echo "- Check server logs for error messages"
echo "- Verify 2FA is enabled on Gmail"
echo "- Use App Password (not regular password)"
echo "- Check spam folder of recipient"
echo ""
echo "🚀 Email system is now ready for real email sending!"


