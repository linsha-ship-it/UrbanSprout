const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Blog = require('../models/Blog');

async function removeDummyUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // List of dummy users to remove (the ones I created)
    const dummyEmails = [
      'john.smith@example.com',
      'sarah.johnson@example.com', 
      'mike.wilson@example.com',
      'emily.davis@example.com',
      'david.brown@example.com'
    ];

    console.log('🗑️  Removing dummy users...');
    
    // Remove dummy users
    const result = await User.deleteMany({ 
      email: { $in: dummyEmails } 
    });
    
    console.log(`✅ Removed ${result.deletedCount} dummy users`);

    // Check remaining users
    const remainingUsers = await User.find({}, 'name email role');
    console.log('\n👥 Remaining users:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Check for any blog posts
    const blogPosts = await Blog.find({}, 'title author status approvalStatus');
    console.log('\n📝 Blog posts in database:');
    if (blogPosts.length === 0) {
      console.log('  No blog posts found');
    } else {
      blogPosts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.author} - Status: ${post.status}, Approval: ${post.approvalStatus}`);
      });
    }

    console.log('\n✅ Cleanup completed!');
    console.log('Your original admin accounts are preserved.');

  } catch (error) {
    console.error('❌ Error removing dummy users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

removeDummyUsers();


