const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
require('dotenv').config();

async function removeDummyOrders() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Get all orders
    const allOrders = await Order.find({}).populate('user', 'email name');
    console.log(`📊 Found ${allOrders.length} total orders`);

    // Identify dummy orders based on common patterns
    const dummyPatterns = [
      // Test emails
      /test.*@.*\.com/i,
      /dummy.*@.*\.com/i,
      /sample.*@.*\.com/i,
      /example.*@.*\.com/i,
      /admin.*@.*\.com/i,
      /user.*@.*\.com/i,
      
      // Test names
      /test.*user/i,
      /dummy.*user/i,
      /sample.*user/i,
      /example.*user/i,
      
      // Test order numbers
      /test.*order/i,
      /dummy.*order/i,
      /sample.*order/i
    ];

    const dummyOrders = [];
    const realOrders = [];

    for (const order of allOrders) {
      let isDummy = false;
      
      // Check user email
      if (order.user && order.user.email) {
        for (const pattern of dummyPatterns) {
          if (pattern.test(order.user.email)) {
            isDummy = true;
            break;
          }
        }
      }
      
      // Check user name
      if (order.user && order.user.name) {
        for (const pattern of dummyPatterns) {
          if (pattern.test(order.user.name)) {
            isDummy = true;
            break;
          }
        }
      }
      
      // Check order notes for test indicators
      if (order.notes) {
        if (order.notes.toLowerCase().includes('test') || 
            order.notes.toLowerCase().includes('dummy') ||
            order.notes.toLowerCase().includes('sample')) {
          isDummy = true;
        }
      }
      
      // Check for very low amounts (likely test orders)
      if (order.total < 1) {
        isDummy = true;
      }
      
      if (isDummy) {
        dummyOrders.push(order);
      } else {
        realOrders.push(order);
      }
    }

    console.log(`🗑️  Found ${dummyOrders.length} dummy orders to remove`);
    console.log(`✅ Found ${realOrders.length} real orders to keep`);

    if (dummyOrders.length > 0) {
      console.log('\n📋 Dummy orders to be removed:');
      dummyOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.orderNumber} - ${order.user?.name || 'Unknown'} (${order.user?.email || 'No email'}) - ₹${order.total}`);
      });

      // Ask for confirmation
      console.log('\n⚠️  This will permanently delete the dummy orders listed above.');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Delete dummy orders
      const dummyOrderIds = dummyOrders.map(order => order._id);
      const result = await Order.deleteMany({ _id: { $in: dummyOrderIds } });
      
      console.log(`✅ Successfully removed ${result.deletedCount} dummy orders`);
    } else {
      console.log('✅ No dummy orders found to remove');
    }

    // Show final count
    const remainingOrders = await Order.countDocuments();
    console.log(`📊 Remaining orders: ${remainingOrders}`);

  } catch (error) {
    console.error('❌ Error removing dummy orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
removeDummyOrders();


