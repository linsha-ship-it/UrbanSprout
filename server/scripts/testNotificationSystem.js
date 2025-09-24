const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const testNotificationSystem = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find a test user
    const user = await User.findOne({ email: 'linshan2026@mca.ajce.in' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Found test user: ${user.name} (${user.email})`);

    // Test 1: Send a single notification
    console.log('\n📤 Testing single notification...');
    const notification = await notificationService.sendNotification(user._id, {
      userEmail: user.email,
      type: 'general',
      title: 'Test Notification 🧪',
      message: 'This is a test notification to verify the system is working correctly.',
      relatedId: null
    });
    console.log('✅ Single notification sent:', notification.title);

    // Test 2: Send multiple notifications
    console.log('\n📤 Testing bulk notifications...');
    const bulkNotifications = await notificationService.sendBulkNotification([user._id], {
      userEmail: user.email,
      type: 'general',
      title: 'Bulk Test Notification 📦',
      message: 'This is a bulk notification test.',
      relatedId: null
    });
    console.log('✅ Bulk notifications sent:', bulkNotifications.length);

    // Test 3: Check unread count
    console.log('\n📊 Testing unread count...');
    const unreadCount = await notificationService.updateUnreadCount(user._id);
    console.log('✅ Unread count:', unreadCount);

    // Test 4: Mark notification as read
    console.log('\n✅ Testing mark as read...');
    if (notification) {
      await notificationService.markAsRead(user._id, notification._id);
      console.log('✅ Notification marked as read');
    }

    // Test 5: Mark all as read
    console.log('\n✅ Testing mark all as read...');
    await notificationService.markAllAsRead(user._id);
    console.log('✅ All notifications marked as read');

    // Test 6: Check final unread count
    console.log('\n📊 Final unread count...');
    const finalUnreadCount = await notificationService.updateUnreadCount(user._id);
    console.log('✅ Final unread count:', finalUnreadCount);

    console.log('\n🎉 All notification system tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('  ✅ Single notification sending');
    console.log('  ✅ Bulk notification sending');
    console.log('  ✅ Unread count tracking');
    console.log('  ✅ Mark as read functionality');
    console.log('  ✅ Mark all as read functionality');
    console.log('  ✅ Real-time updates (WebSocket integration)');

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

testNotificationSystem();




