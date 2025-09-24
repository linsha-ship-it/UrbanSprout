const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const debugNotifications = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Get all users
    console.log('\n👥 All Users:');
    const users = await User.find({}, 'name email _id');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    // Get all notifications
    console.log('\n🔔 All Notifications:');
    const notifications = await Notification.find({}).populate('userId', 'name email');
    if (notifications.length === 0) {
      console.log('  No notifications found');
    } else {
      notifications.forEach(notif => {
        console.log(`  - ${notif.title} | User: ${notif.userId?.name || 'Unknown'} (${notif.userId?.email || notif.userEmail}) | Read: ${notif.isRead} | Type: ${notif.type}`);
      });
    }

    // Check unread counts for each user
    console.log('\n📊 Unread Counts by User:');
    for (const user of users) {
      const unreadCount = await Notification.countDocuments({ 
        userId: user._id, 
        isRead: false 
      });
      console.log(`  - ${user.name} (${user.email}): ${unreadCount} unread notifications`);
    }

    // Check if there are orphaned notifications (notifications without valid userId)
    console.log('\n🔍 Checking for orphaned notifications...');
    const orphanedNotifications = await Notification.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });
    
    if (orphanedNotifications.length > 0) {
      console.log(`Found ${orphanedNotifications.length} orphaned notifications:`);
      orphanedNotifications.forEach(notif => {
        console.log(`  - ${notif.title} | Email: ${notif.userEmail} | Read: ${notif.isRead}`);
      });
    } else {
      console.log('No orphaned notifications found');
    }

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

debugNotifications();











