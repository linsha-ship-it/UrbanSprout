const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const testUserNotifications = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find the user who created blog posts
    const user = await User.findOne({ email: 'linshan2026@mca.ajce.in' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`🆔 User ID: ${user._id}`);

    // Check notifications for this user
    const notifications = await Notification.find({ userId: user._id });
    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
    
    console.log(`\n📬 Notifications for ${user.name}:`);
    console.log(`   Total notifications: ${notifications.length}`);
    console.log(`   Unread notifications: ${unreadCount}`);
    
    if (notifications.length > 0) {
      console.log('\n📋 Notification Details:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Read: ${notif.isRead}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log('');
      });
    } else {
      console.log('   No notifications found for this user');
    }

    // Test the API endpoints
    console.log('🧪 Testing API endpoints...');
    console.log('To test the notification system for this user:');
    console.log(`1. Login as: ${user.email}`);
    console.log(`2. Check notification bell - should show ${unreadCount} notifications`);
    console.log(`3. Click notification bell - should show ${notifications.length} notifications`);
    
    if (notifications.length > 0) {
      console.log('\n✅ Real notifications are working!');
      console.log('The user should see their blog post approval/rejection notifications.');
    } else {
      console.log('\n⚠️  No notifications found for this user.');
      console.log('This might mean the blog posts were approved/rejected before the notification system was implemented.');
    }

  } catch (error) {
    console.error('❌ Error testing user notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testUserNotifications();




