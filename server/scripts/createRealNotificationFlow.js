const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');
const Blog = require('../models/Blog');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const createRealNotificationFlow = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find the user who creates blog posts
    const user = await User.findOne({ email: 'linshan2026@mca.ajce.in' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Create a new blog post for testing
    const newBlogPost = new Blog({
      title: 'My Urban Garden Journey 🌱',
      content: 'I started my urban gardening journey last month and I\'m excited to share my progress with the community. I\'ve been growing herbs and vegetables on my balcony.',
      excerpt: 'Sharing my urban gardening experience',
      category: 'success_story',
      tags: ['urban-gardening', 'herbs', 'vegetables', 'balcony-garden'],
      author: user.name,
      authorEmail: user.email,
      authorId: user._id,
      status: 'pending_approval',
      approvalStatus: 'pending',
      featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
    });

    await newBlogPost.save();
    console.log('✅ Created new blog post for testing');

    // Now simulate admin approval (this would normally happen through the admin panel)
    console.log('\n🎯 Simulating admin approval...');
    
    // Update the blog post as if admin approved it
    newBlogPost.approvalStatus = 'approved';
    newBlogPost.status = 'published';
    newBlogPost.approvedAt = new Date();
    await newBlogPost.save();

    // Create notification for the user (this is what happens in the admin controller)
    const approvalNotification = new Notification({
      userId: user._id,
      userEmail: user.email,
      type: 'blog_approved',
      title: 'Blog Post Approved! 🎉',
      message: `Your blog post "${newBlogPost.title}" has been approved and is now live on the blog!`,
      relatedId: newBlogPost._id,
      isRead: false
    });

    await approvalNotification.save();
    console.log('✅ Created approval notification for user');

    // Now let's create another blog post and reject it
    const rejectedBlogPost = new Blog({
      title: 'Question About Plant Care 🤔',
      content: 'I have a question about my plant that\'s not growing well. Can anyone help?',
      excerpt: 'Need help with plant care',
      category: 'question',
      tags: ['plant-care', 'help', 'question'],
      author: user.name,
      authorEmail: user.email,
      authorId: user._id,
      status: 'pending_approval',
      approvalStatus: 'pending',
      featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
    });

    await rejectedBlogPost.save();
    console.log('✅ Created second blog post for testing');

    // Simulate admin rejection
    console.log('\n🎯 Simulating admin rejection...');
    
    rejectedBlogPost.approvalStatus = 'rejected';
    rejectedBlogPost.status = 'rejected';
    rejectedBlogPost.rejectionReason = 'Please provide more specific details about your plant issue and include photos if possible.';
    rejectedBlogPost.rejectedAt = new Date();
    await rejectedBlogPost.save();

    // Create rejection notification
    const rejectionNotification = new Notification({
      userId: user._id,
      userEmail: user.email,
      type: 'blog_rejected',
      title: 'Blog Post Feedback 📝',
      message: `Your blog post "${rejectedBlogPost.title}" needs some adjustments. Reason: ${rejectedBlogPost.rejectionReason}`,
      relatedId: rejectedBlogPost._id,
      isRead: false
    });

    await rejectionNotification.save();
    console.log('✅ Created rejection notification for user');

    // Check final notification count
    const totalNotifications = await Notification.countDocuments({ userId: user._id });
    const unreadNotifications = await Notification.countDocuments({ userId: user._id, isRead: false });
    
    console.log(`\n📊 Final Notification Summary for ${user.name}:`);
    console.log(`   Total notifications: ${totalNotifications}`);
    console.log(`   Unread notifications: ${unreadNotifications}`);
    
    console.log('\n🎯 Real notification flow completed!');
    console.log('💡 The user should now see notifications for:');
    console.log('   ✅ Blog post approval');
    console.log('   ❌ Blog post rejection with feedback');
    console.log('\n🔔 To test: Login as the user and check the notification bell!');

  } catch (error) {
    console.error('❌ Error creating real notification flow:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createRealNotificationFlow();











