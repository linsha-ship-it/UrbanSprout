const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Blog = require('../models/Blog');
const {
  sendRegistrationEmail,
  sendBlogApprovalEmail,
  sendBlogRejectionEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail
} = require('../utils/emailService');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const testEmailSystem = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Test email address (change this to your email for testing)
    const testEmail = 'linshan2026@mca.ajce.in';
    const testUserName = 'Test User';
    const testBlogTitle = 'My Amazing Plant Care Journey';

    console.log('\n📧 Testing Email System...\n');

    // Test 1: Registration Email
    console.log('1️⃣ Testing Registration Email...');
    try {
      const regResult = await sendRegistrationEmail(testEmail, testUserName, 'beginner');
      if (regResult.success) {
        console.log('✅ Registration email sent successfully!');
      } else {
        console.log('❌ Registration email failed:', regResult.error);
      }
    } catch (error) {
      console.log('❌ Registration email error:', error.message);
    }

    // Test 2: Blog Approval Email
    console.log('\n2️⃣ Testing Blog Approval Email...');
    try {
      const approvalResult = await sendBlogApprovalEmail(testEmail, testUserName, testBlogTitle);
      if (approvalResult.success) {
        console.log('✅ Blog approval email sent successfully!');
      } else {
        console.log('❌ Blog approval email failed:', approvalResult.error);
      }
    } catch (error) {
      console.log('❌ Blog approval email error:', error.message);
    }

    // Test 3: Blog Rejection Email
    console.log('\n3️⃣ Testing Blog Rejection Email...');
    try {
      const rejectionReason = 'The content needs more detailed care instructions and better formatting. Please add more specific watering schedules and light requirements.';
      const rejectionResult = await sendBlogRejectionEmail(testEmail, testUserName, testBlogTitle, rejectionReason);
      if (rejectionResult.success) {
        console.log('✅ Blog rejection email sent successfully!');
      } else {
        console.log('❌ Blog rejection email failed:', rejectionResult.error);
      }
    } catch (error) {
      console.log('❌ Blog rejection email error:', error.message);
    }

    // Test 4: Order Confirmation Email
    console.log('\n4️⃣ Testing Order Confirmation Email...');
    try {
      const orderDetails = {
        orderId: 'ORD123456',
        orderDate: new Date(),
        totalAmount: 89.99,
        items: [
          { name: 'Snake Plant', quantity: 1, price: 29.99 },
          { name: 'Succulent Mix', quantity: 2, price: 19.99 },
          { name: 'Plant Pot Set', quantity: 1, price: 19.99 }
        ],
        shippingAddress: '123 Garden Street, Plant City, PC 12345, India',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
      const orderResult = await sendOrderConfirmationEmail(testEmail, testUserName, orderDetails);
      if (orderResult.success) {
        console.log('✅ Order confirmation email sent successfully!');
      } else {
        console.log('❌ Order confirmation email failed:', orderResult.error);
      }
    } catch (error) {
      console.log('❌ Order confirmation email error:', error.message);
    }

    // Test 5: Payment Confirmation Email
    console.log('\n5️⃣ Testing Payment Confirmation Email...');
    try {
      const paymentDetails = {
        transactionId: 'TXN789012345',
        paymentDate: new Date(),
        paymentMethod: 'UPI',
        amount: 89.99,
        orderId: 'ORD123456'
      };
      const paymentResult = await sendPaymentConfirmationEmail(testEmail, testUserName, paymentDetails);
      if (paymentResult.success) {
        console.log('✅ Payment confirmation email sent successfully!');
      } else {
        console.log('❌ Payment confirmation email failed:', paymentResult.error);
      }
    } catch (error) {
      console.log('❌ Payment confirmation email error:', error.message);
    }

    console.log('\n🎉 Email system testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Check your email inbox for all test emails');
    console.log('- Verify that all email types are working correctly');
    console.log('- Check console logs for any error messages');
    console.log('\n💡 Note: If emails are not received, check:');
    console.log('1. Gmail app password setup');
    console.log('2. EMAIL_USER and EMAIL_PASS in .env file');
    console.log('3. Spam/junk folder');
    console.log('4. Gmail security settings');

  } catch (error) {
    console.error('❌ Error testing email system:', error);
  } finally {
    console.log('\n🔌 Disconnecting from database...');
    await mongoose.disconnect();
  }
};

// Run the test
testEmailSystem();




