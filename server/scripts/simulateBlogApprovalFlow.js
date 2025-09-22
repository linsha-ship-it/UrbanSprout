const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');
const User = require('../models/User');
const Blog = require('../models/Blog');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const simulateBlogApprovalFlow = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'lxiao0391@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Create a realistic blog post approval notification
    const blogApprovalNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'general',
      title: 'Blog Post Approved Successfully! ✅',
      message: 'You have successfully approved the blog post "Urban Gardening Tips for Beginners" by Sarah Johnson. The post is now live on the community feed.',
      isRead: false
    });

    await blogApprovalNotification.save();
    console.log('✅ Blog approval notification created!');

    // Create a blog post rejection notification
    const blogRejectionNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'general',
      title: 'Blog Post Rejected 📝',
      message: 'You have rejected the blog post "My Garden Journey" by Mike Wilson. Reason: Content needs improvement and better formatting.',
      isRead: false
    });

    await blogRejectionNotification.save();
    console.log('✅ Blog rejection notification created!');

    // Create a user management notification
    const userManagementNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'general',
      title: 'User Role Updated 👤',
      message: 'You have successfully updated the role of user "Emily Davis" from beginner to expert gardener.',
      isRead: false
    });

    await userManagementNotification.save();
    console.log('✅ User management notification created!');

    // Create a system notification
    const systemNotification = new Notification({
      userId: adminUser._id,
      userEmail: adminUser.email,
      type: 'general',
      title: 'System Maintenance Completed 🔧',
      message: 'Scheduled system maintenance has been completed successfully. All services are running normally.',
      isRead: false
    });

    await systemNotification.save();
    console.log('✅ System notification created!');

    // Check total notifications
    const totalNotifications = await Notification.countDocuments({ userId: adminUser._id });
    const unreadNotifications = await Notification.countDocuments({ userId: adminUser._id, isRead: false });
    
    console.log(`\n📊 Notification Summary:`);
    console.log(`   Total notifications: ${totalNotifications}`);
    console.log(`   Unread notifications: ${unreadNotifications}`);
    
    console.log('\n🎯 Realistic admin notifications created!');
    console.log('💡 You should now see multiple notifications in your notification dropdown.');
    console.log('🔔 These notifications simulate real admin activities like blog approvals, user management, and system updates.');

  } catch (error) {
    console.error('❌ Error creating realistic notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

simulateBlogApprovalFlow();




