#!/bin/bash

echo "🌱 UrbanSprout - Update Email Password"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    exit 1
fi

echo "📧 Current email configuration:"
grep -E "EMAIL_USER|EMAIL_PASS" server/.env
echo ""

echo "🔐 To get your Gmail App Password:"
echo "1. Go to your Gmail account settings"
echo "2. Enable 2-Factor Authentication (if not already enabled)"
echo "3. Go to Security → 2-Step Verification → App passwords"
echo "4. Select 'Mail' as the app"
echo "5. Copy the 16-character password (like: abcd efgh ijkl mnop)"
echo ""

read -p "Enter your Gmail App Password (16 characters): " email_pass

# Remove spaces from app password
email_pass=$(echo "$email_pass" | tr -d ' ')

# Check if password is 16 characters
if [ ${#email_pass} -ne 16 ]; then
    echo "❌ Error: App password should be 16 characters long!"
    echo "You entered: ${#email_pass} characters"
    exit 1
fi

echo ""
echo "📝 Updating email password..."

# Update email password
sed -i.bak "s/EMAIL_PASS=.*/EMAIL_PASS=$email_pass/" server/.env

# Remove backup file
rm server/.env.bak

echo "✅ Email password updated!"
echo ""

echo "📧 Updated email configuration:"
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


