const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

async function clearAllOrders() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Get count of all orders
    const orderCount = await Order.countDocuments();
    console.log(`📊 Found ${orderCount} total orders`);

    if (orderCount > 0) {
      console.log('\n⚠️  This will permanently delete ALL orders from the database.');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Delete all orders
      const result = await Order.deleteMany({});
      
      console.log(`✅ Successfully removed ${result.deletedCount} orders`);
    } else {
      console.log('✅ No orders found to remove');
    }

    // Show final count
    const remainingOrders = await Order.countDocuments();
    console.log(`📊 Remaining orders: ${remainingOrders}`);

  } catch (error) {
    console.error('❌ Error clearing orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
clearAllOrders();


