const { sendBlogRejectionEmail } = require('./utils/emailService');

// Test blog rejection email functionality
const testBlogRejectionEmail = async () => {
  console.log('🧪 Testing Blog Rejection Email...\n');

  const testEmail = 'lxiao0391@gmail.com';
  const testUserName = 'Test Author';
  const testBlogTitle = 'How to Grow Perfect Tomatoes';
  const testRejectionReason = 'The content needs more detailed care instructions and better images. Please add step-by-step watering schedules and include photos of different growth stages.';

  try {
    const result = await sendBlogRejectionEmail(testEmail, testUserName, testBlogTitle, testRejectionReason);
    
    if (result.success) {
      console.log('✅ Blog Rejection Email: Sent Successfully');
      console.log('📧 Email sent to:', testEmail);
      console.log('📝 Blog Title:', testBlogTitle);
      console.log('❌ Rejection Reason:', testRejectionReason);
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Blog Rejection Email: Failed');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testBlogRejectionEmail();
