const mongoose = require('mongoose');
const { sendBlogRejectionEmail, sendEmailNotification } = require('./utils/emailService');
const Blog = require('./models/Blog');
const User = require('./models/User');
const Order = require('./models/Order');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://urbansproutAdmin:helloUrbansproutAdmin%23123@urbansprout-cluster.cbjm4a6.mongodb.net/urbansprout?retryWrites=true&w=majority&appName=UrbanSprout-cluster');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test email functionality with real user data
const testRealUserEmails = async () => {
  console.log('🧪 Testing Email System with Real User Data...\n');

  try {
    // Test 1: Find a real blog post and send rejection email
    console.log('📝 Test 1: Blog Rejection Email to Real User');
    const blogPost = await Blog.findOne({}).populate('authorId', 'email name');
    
    if (blogPost && blogPost.authorEmail) {
      console.log(`📧 Found blog: "${blogPost.title}" by ${blogPost.authorEmail}`);
      
      const result = await sendBlogRejectionEmail(
        blogPost.authorEmail, 
        blogPost.author, 
        blogPost.title, 
        'This is a test rejection reason for demonstration purposes.'
      );
      
      if (result.success) {
        console.log(`✅ Blog rejection email sent to: ${blogPost.authorEmail}`);
      } else {
        console.log(`❌ Failed to send email to: ${blogPost.authorEmail}`);
      }
    } else {
      console.log('❌ No blog posts found in database');
    }

    // Test 2: Find a real user and send general notification
    console.log('\n👤 Test 2: General Email to Real User');
    const user = await User.findOne({ role: { $ne: 'admin' } });
    
    if (user && user.email) {
      console.log(`📧 Found user: ${user.name} (${user.email})`);
      
      const result = await sendEmailNotification(
        user.email,
        'Test Notification - UrbanSprout',
        `Hello ${user.name}!

This is a test email to verify that the email system is correctly sending emails to individual users rather than a hardcoded email address.

Your email: ${user.email}
Your role: ${user.role}

This confirms that the email system is working correctly!

Best regards,
UrbanSprout Team`,
        user.name
      );
      
      if (result.success) {
        console.log(`✅ General email sent to: ${user.email}`);
      } else {
        console.log(`❌ Failed to send email to: ${user.email}`);
      }
    } else {
      console.log('❌ No users found in database');
    }

    // Test 3: Find a real order and test order status email
    console.log('\n🛒 Test 3: Order Status Email to Real Customer');
    const order = await Order.findOne({}).populate('user', 'email name');
    
    if (order && order.user && order.user.email) {
      console.log(`📧 Found order: ${order.orderNumber} for ${order.user.email}`);
      
      const orderDetails = {
        orderId: order.orderNumber || order._id.toString().slice(-8),
        status: 'shipped',
        updatedAt: new Date(),
        trackingNumber: 'TRK-TEST-123',
        carrier: 'Test Carrier',
        estimatedDelivery: '3-5 business days'
      };

      const result = await sendEmailNotification(
        order.user.email,
        'Order Status Update - Test',
        `Hello ${order.user.name}!

This is a test order status update email.

Order: ${orderDetails.orderId}
Status: ${orderDetails.status}
Tracking: ${orderDetails.trackingNumber}

This confirms that order emails are sent to the correct customer email address.

Best regards,
UrbanSprout Team`,
        order.user.name
      );
      
      if (result.success) {
        console.log(`✅ Order status email sent to: ${order.user.email}`);
      } else {
        console.log(`❌ Failed to send email to: ${order.user.email}`);
      }
    } else {
      console.log('❌ No orders found in database');
    }

    console.log('\n🎉 Real user email testing completed!');
    console.log('📧 Check the respective user inboxes for the test emails');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
connectDB().then(() => {
  testRealUserEmails();
});
