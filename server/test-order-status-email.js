const { sendOrderStatusUpdateEmail } = require('./utils/emailService');

// Test order status update email functionality
const testOrderStatusUpdateEmail = async () => {
  console.log('🧪 Testing Order Status Update Email...\n');

  const testEmail = 'lxiao0391@gmail.com';
  const testUserName = 'Test Customer';
  
  const testOrderDetails = {
    orderId: 'ORD-123456',
    status: 'shipped',
    updatedAt: new Date(),
    trackingNumber: 'TRK-789012',
    carrier: 'FedEx',
    estimatedDelivery: '2025-01-31'
  };

  try {
    const result = await sendOrderStatusUpdateEmail(testEmail, testUserName, testOrderDetails);
    
    if (result.success) {
      console.log('✅ Order Status Update Email: Sent Successfully');
      console.log('📧 Email sent to:', testEmail);
      console.log('📦 Order ID:', testOrderDetails.orderId);
      console.log('📊 Status:', testOrderDetails.status.toUpperCase());
      console.log('🚚 Tracking:', testOrderDetails.trackingNumber);
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Order Status Update Email: Failed');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testOrderStatusUpdateEmail();
