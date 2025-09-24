const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const Order = require('./models/Order');
const Blog = require('./models/Blog');
require('dotenv').config({ path: './.env' });

// Test notification system
const testNotifications = async () => {
  try {
    console.log('🧪 Testing Notification System...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get a test user
    const testUser = await User.findOne({ email: 'linshan2026@mca.ajce.in' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`📧 Test user: ${testUser.email}`);
    
    // Get a test order
    const testOrder = await Order.findOne({ user: testUser._id });
    if (!testOrder) {
      console.log('❌ Test order not found');
      return;
    }
    
    console.log(`📦 Test order: ${testOrder.orderNumber}`);
    
    // Get a test blog
    const testBlog = await Blog.findOne({ authorEmail: testUser.email });
    if (!testBlog) {
      console.log('❌ Test blog not found');
      return;
    }
    
    console.log(`📝 Test blog: ${testBlog.title}`);
    
    // Test 1: Order Status Update Notification
    console.log('\n🔔 Test 1: Order Status Update Notification');
    const orderNotification = new Notification({
      userId: testUser._id,
      userEmail: testUser.email,
      type: 'order_shipped',
      title: 'Order Shipped! 🚚',
      message: `Great news! Your order #${testOrder.orderNumber} has been shipped and is on its way to you.`,
      relatedId: testOrder._id,
      relatedModel: 'Order',
      isRead: false
    });
    
    await orderNotification.save();
    console.log('✅ Order notification created');
    
    // Test 2: Blog Approval Notification
    console.log('\n🔔 Test 2: Blog Approval Notification');
    const blogNotification = new Notification({
      userId: testUser._id,
      userEmail: testUser.email,
      type: 'blog_approved',
      title: 'Blog Post Approved! ✅',
      message: `Congratulations! Your blog post "${testBlog.title}" has been approved and is now live on UrbanSprout.`,
      relatedId: testBlog._id,
      relatedModel: 'Blog',
      isRead: false
    });
    
    await blogNotification.save();
    console.log('✅ Blog notification created');
    
    // Test 3: Check notification count
    console.log('\n📊 Test 3: Notification Count');
    const unreadCount = await Notification.countDocuments({
      userId: testUser._id,
      isRead: false
    });
    
    console.log(`📈 Unread notifications: ${unreadCount}`);
    
    // Test 4: Get recent notifications
    console.log('\n📋 Test 4: Recent Notifications');
    const recentNotifications = await Notification.find({
      userId: testUser._id
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('relatedId', 'title orderNumber');
    
    console.log('Recent notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
      console.log(`   ${notif.message}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
      console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log('🎉 Notification system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testNotifications();
