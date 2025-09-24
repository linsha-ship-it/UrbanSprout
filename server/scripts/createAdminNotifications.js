const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const createAdminNotifications = async () => {
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

    // Create various types of notifications for the admin
    const notifications = [
      {
        type: 'general',
        title: 'Welcome to UrbanSprout Admin! 🌱',
        message: 'Your admin account is set up and ready to manage the community. You can now approve blog posts, manage users, and oversee the platform.'
      },
      {
        type: 'general',
        title: 'New User Registration 📝',
        message: 'A new user "Maria Rodriguez" has registered and is waiting for account verification.'
      },
      {
        type: 'general',
        title: 'Blog Post Pending Review ⏳',
        message: 'A new blog post "My First Garden" by James Chen is waiting for your approval.'
      },
      {
        type: 'general',
        title: 'System Update Available 🔄',
        message: 'A new system update is available. Please review the changelog and schedule maintenance if needed.'
      },
      {
        type: 'general',
        title: 'Weekly Report Ready 📊',
        message: 'Your weekly community activity report is ready. 15 new posts, 8 new users, and 3 pending approvals this week.'
      }
    ];

    console.log('📬 Creating admin notifications...');
    
    for (const notifData of notifications) {
      const notification = new Notification({
        userId: adminUser._id,
        userEmail: adminUser.email,
        type: notifData.type,
        title: notifData.title,
        message: notifData.message,
        isRead: false
      });

      await notification.save();
      console.log(`✅ Created: ${notifData.title}`);
    }

    // Check the notifications
    const allNotifications = await Notification.find({ userId: adminUser._id });
    console.log(`\n📬 Total notifications for admin: ${allNotifications.length}`);
    
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.isRead}`);
      console.log(`   Type: ${notif.type}`);
      console.log('');
    });

    console.log('🎯 Admin notifications created! Check your notification bell in the UI.');
    console.log('💡 You should now see 5 notifications in your notification dropdown.');

  } catch (error) {
    console.error('❌ Error creating admin notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createAdminNotifications();











