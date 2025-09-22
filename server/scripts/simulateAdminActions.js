const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const simulateAdminActions = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find a test user (the one who creates blog posts)
    const user = await User.findOne({ email: 'linshan2026@mca.ajce.in' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Found test user: ${user.name} (${user.email})`);

    // Create a test blog post
    console.log('\n📝 Creating test blog post...');
    const testBlogPost = new Blog({
      title: 'My Amazing Plant Care Journey 🌱',
      content: 'I have been taking care of plants for the past few months and I want to share my experience with the community. Here are some tips I learned...',
      excerpt: 'Sharing my plant care experience and tips',
      category: 'success_story',
      tags: ['plant-care', 'tips', 'experience'],
      author: user.name,
      authorEmail: user.email,
      authorId: user._id,
      status: 'pending_approval',
      approvalStatus: 'pending',
      featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
    });

    await testBlogPost.save();
    console.log('✅ Test blog post created:', testBlogPost.title);

    // Simulate admin approval
    console.log('\n✅ Simulating admin approval...');
    testBlogPost.approvalStatus = 'approved';
    testBlogPost.status = 'published';
    testBlogPost.approvedAt = new Date();
    await testBlogPost.save();

    // Send approval notification
    await notificationService.sendNotification(user._id, {
      userEmail: user.email,
      type: 'blog_approved',
      title: 'Blog Post Approved! 🎉',
      message: `Your blog post "${testBlogPost.title}" has been approved and is now live on the blog!`,
      relatedId: testBlogPost._id
    });
    console.log('✅ Approval notification sent');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create another test blog post
    console.log('\n📝 Creating another test blog post...');
    const testBlogPost2 = new Blog({
      title: 'Common Plant Problems and Solutions 🐛',
      content: 'Many beginners face common problems with their plants. Here are some solutions I found helpful...',
      excerpt: 'Solutions for common plant problems',
      category: 'question',
      tags: ['problems', 'solutions', 'troubleshooting'],
      author: user.name,
      authorEmail: user.email,
      authorId: user._id,
      status: 'pending_approval',
      approvalStatus: 'pending',
      featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
    });

    await testBlogPost2.save();
    console.log('✅ Second test blog post created:', testBlogPost2.title);

    // Simulate admin rejection
    console.log('\n❌ Simulating admin rejection...');
    testBlogPost2.approvalStatus = 'rejected';
    testBlogPost2.status = 'rejected';
    testBlogPost2.rejectionReason = 'Content needs more detail and better structure. Please add more specific examples and improve the formatting.';
    testBlogPost2.rejectedAt = new Date();
    await testBlogPost2.save();

    // Send rejection notification
    await notificationService.sendNotification(user._id, {
      userEmail: user.email,
      type: 'blog_rejected',
      title: 'Blog Post Feedback 📝',
      message: `Your blog post "${testBlogPost2.title}" needs some adjustments. Reason: ${testBlogPost2.rejectionReason}`,
      relatedId: testBlogPost2._id
    });
    console.log('✅ Rejection notification sent');

    // Check final notification count
    console.log('\n📊 Checking notification count...');
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false
    });
    console.log('✅ Total unread notifications:', unreadCount);

    // List all notifications for the user
    console.log('\n📋 All notifications for user:');
    const allNotifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    allNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title} (${notif.type}) - ${notif.isRead ? 'Read' : 'Unread'}`);
    });

    console.log('\n🎉 Admin action simulation completed!');
    console.log('\n📋 What happened:');
    console.log('  ✅ Created 2 test blog posts');
    console.log('  ✅ Admin approved 1st blog post → User gets approval notification');
    console.log('  ✅ Admin rejected 2nd blog post → User gets rejection notification');
    console.log('  ✅ User should see notifications in their dashboard');
    console.log('\n💡 To test real-time notifications:');
    console.log('  1. Start the server: cd server && npm start');
    console.log('  2. Start the client: cd client && npm run dev');
    console.log('  3. Login as the test user');
    console.log('  4. Check the notification bell in the navbar');
    console.log('  5. Run this script again to see real-time notifications');

  } catch (error) {
    console.error('❌ Error simulating admin actions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

simulateAdminActions();
