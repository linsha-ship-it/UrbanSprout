const { 
  sendOrderConfirmationEmail, 
  sendPaymentConfirmationEmail, 
  sendOrderStatusUpdateEmail, 
  sendAdminVerificationEmail,
  sendEmailNotification 
} = require('./utils/emailService');

// Test email functionality
const testEmailFunctionality = async () => {
  console.log('🧪 Testing Email Functionality...\n');

  const testEmail = 'lxiao0391@gmail.com'; // Your email for testing
  const testUserName = 'Test User';

  try {
    // Test 1: Order Confirmation Email
    console.log('📧 Testing Order Confirmation Email...');
    const orderDetails = {
      orderId: 'ORD-123456',
      orderDate: new Date(),
      totalAmount: 99.99,
      items: [
        { name: 'Snake Plant', quantity: 1, price: 29.99 },
        { name: 'Pothos', quantity: 2, price: 19.99 }
      ],
      shippingAddress: '123 Test Street, Test City, Test State 12345',
      estimatedDelivery: '2025-01-31'
    };

    const orderResult = await sendOrderConfirmationEmail(testEmail, testUserName, orderDetails);
    console.log('✅ Order Confirmation Email:', orderResult.success ? 'Sent' : 'Failed');
    if (!orderResult.success) console.log('   Error:', orderResult.error);

    // Test 2: Payment Confirmation Email
    console.log('\n💳 Testing Payment Confirmation Email...');
    const paymentDetails = {
      transactionId: 'TXN-789012',
      paymentDate: new Date(),
      paymentMethod: 'Credit Card',
      amount: 99.99,
      orderId: 'ORD-123456'
    };

    const paymentResult = await sendPaymentConfirmationEmail(testEmail, testUserName, paymentDetails);
    console.log('✅ Payment Confirmation Email:', paymentResult.success ? 'Sent' : 'Failed');
    if (!paymentResult.success) console.log('   Error:', paymentResult.error);

    // Test 3: Order Status Update Email
    console.log('\n📦 Testing Order Status Update Email...');
    const statusDetails = {
      orderId: 'ORD-123456',
      status: 'shipped',
      updatedAt: new Date(),
      trackingNumber: 'TRK-345678',
      carrier: 'FedEx',
      estimatedDelivery: '2025-01-31'
    };

    const statusResult = await sendOrderStatusUpdateEmail(testEmail, testUserName, statusDetails);
    console.log('✅ Order Status Update Email:', statusResult.success ? 'Sent' : 'Failed');
    if (!statusResult.success) console.log('   Error:', statusResult.error);

    // Test 4: Admin Verification Email
    console.log('\n✅ Testing Admin Verification Email...');
    const verificationResult = await sendAdminVerificationEmail(testEmail, testUserName, 'vendor', 'Your vendor account has been approved');
    console.log('✅ Admin Verification Email:', verificationResult.success ? 'Sent' : 'Failed');
    if (!verificationResult.success) console.log('   Error:', verificationResult.error);

    // Test 5: General Email Notification
    console.log('\n📬 Testing General Email Notification...');
    const notificationResult = await sendEmailNotification(
      testEmail, 
      'Test Notification', 
      'This is a test notification from UrbanSprout. Your email system is working correctly!',
      testUserName
    );
    console.log('✅ General Email Notification:', notificationResult.success ? 'Sent' : 'Failed');
    if (!notificationResult.success) console.log('   Error:', notificationResult.error);

    console.log('\n🎉 Email functionality test completed!');
    console.log('📧 Check your inbox at:', testEmail);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testEmailFunctionality();
