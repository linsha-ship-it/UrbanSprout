#!/bin/bash

# UrbanSprout Email Configuration Setup Script

echo "🌱 UrbanSprout Email Configuration Setup"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# UrbanSprout Environment Variables

# Database
MONGODB_URI=mongodb://localhost:27017/urbansprout

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5001

# CORS Origin
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail) - UPDATE THESE VALUES
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RH9Kx0Ibt9neI6
RAZORPAY_KEY_SECRET=CjIJyaqKbJzhUNR9J0zu4KjI

# Node Environment
NODE_ENV=development
EOF
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists"
fi

echo ""
echo "📧 EMAIL SETUP INSTRUCTIONS:"
echo "============================"
echo ""
echo "1. 🔐 Enable 2-Factor Authentication on your Gmail account:"
echo "   - Go to: https://myaccount.google.com/security"
echo "   - Enable '2-Step Verification'"
echo ""
echo "2. 🔑 Generate App Password:"
echo "   - Go to: https://myaccount.google.com/security"
echo "   - Click 'App passwords' (under 2-Step Verification)"
echo "   - Select 'Mail' as the app"
echo "   - Select 'Other' as device, enter 'UrbanSprout'"
echo "   - Copy the 16-character password"
echo ""
echo "3. ✏️  Update .env file:"
echo "   - Open .env file in your editor"
echo "   - Replace 'your-email@gmail.com' with your Gmail address"
echo "   - Replace 'your-16-character-app-password' with the generated password"
echo ""
echo "4. 🧪 Test email system:"
echo "   - Run: cd server && node scripts/testEmailSystem.js"
echo ""
echo "5. 🚀 Start the application:"
echo "   - Backend: cd server && npm start"
echo "   - Frontend: cd client && npm run dev"
echo ""
echo "📋 Example .env email configuration:"
echo "EMAIL_USER=john.doe@gmail.com"
echo "EMAIL_PASS=abcd efgh ijkl mnop"
echo ""
echo "🎉 Once configured, registration emails will be sent automatically!"




