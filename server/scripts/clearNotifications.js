const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const clearAllNotifications = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Clear all notifications
    console.log('🗑️  Clearing all notifications...');
    const result = await Notification.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} notifications`);

    console.log('\n✅ All notifications cleared!');
    console.log('The notification count should now be 0 for all users.');

  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

clearAllNotifications();




