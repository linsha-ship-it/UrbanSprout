const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const createTestNotification = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find the admin user (lxiao0391@gmail.com)
    const adminUser = await User.findOne({ email: 'lxiao0391@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`👤 Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Create a test notification for the admin
    const testNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'general',
      title: 'Welcome to UrbanSprout! 🌱',
      message: 'Your admin account is set up and ready to manage the community. You can now approve blog posts, manage users, and oversee the platform.',
      isRead: false
    });

    await testNotification.save();
    console.log('✅ Test notification created successfully!');

    // Create another test notification
    const blogNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'blog_approved',
      title: 'Blog Post Approved! 🎉',
      message: 'Your blog post "Getting Started with Urban Gardening" has been approved and is now live on the community feed!',
      isRead: false
    });

    await blogNotification.save();
    console.log('✅ Blog notification created successfully!');

    // Check the notifications
    const notifications = await Notification.find({ userId: adminUser._id });
    console.log(`\n📬 Total notifications for admin: ${notifications.length}`);
    
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.isRead}`);
      console.log(`   Type: ${notif.type}`);
      console.log('');
    });

    console.log('🎯 Test notifications created! Check your notification bell in the UI.');

  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createTestNotification();











