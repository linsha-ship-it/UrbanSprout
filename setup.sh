#!/bin/bash

# UrbanSprout Project Setup Script
echo "🌱 Setting up UrbanSprout Project..."

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://urbansprout:urbansprout123@cluster0.mongodb.net/urbansprout?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

# JWT Configuration
JWT_SECRET=urbansprout_jwt_secret_key_2024

# Email Configuration (optional - for notifications)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@urbansprout.com

# Razorpay Configuration (optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EOF

echo "✅ .env file created successfully!"

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "🎉 Setup complete! You can now run:"
echo "  Client: cd client && npm run dev"
echo "  Server: cd server && npm run dev"


