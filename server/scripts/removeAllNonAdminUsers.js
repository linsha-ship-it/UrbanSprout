const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Blog = require('../models/Blog');

async function removeAllNonAdminUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Keep only admin users
    const adminEmails = ['lxiao0391@gmail.com', 'admin@urbansprout.com'];
    
    console.log('🗑️  Removing all non-admin users and their content...');
    
    // Get non-admin users first
    const nonAdminUsers = await User.find({ 
      email: { $nin: adminEmails } 
    });
    
    console.log(`Found ${nonAdminUsers.length} non-admin users to remove`);
    
    // Remove blog posts by non-admin users
    const nonAdminEmails = nonAdminUsers.map(user => user.email);
    const blogResult = await Blog.deleteMany({ 
      authorEmail: { $in: nonAdminEmails } 
    });
    console.log(`✅ Removed ${blogResult.deletedCount} blog posts by non-admin users`);
    
    // Remove non-admin users
    const userResult = await User.deleteMany({ 
      email: { $nin: adminEmails } 
    });
    console.log(`✅ Removed ${userResult.deletedCount} non-admin users`);

    // Check remaining users
    const remainingUsers = await User.find({}, 'name email role');
    console.log('\n👥 Remaining users:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Check remaining blog posts
    const remainingPosts = await Blog.find({}, 'title author status approvalStatus');
    console.log('\n📝 Remaining blog posts:');
    if (remainingPosts.length === 0) {
      console.log('  No blog posts found');
    } else {
      remainingPosts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.author} - Status: ${post.status}, Approval: ${post.approvalStatus}`);
      });
    }

    console.log('\n✅ Cleanup completed!');
    console.log('Only your original admin accounts remain.');

  } catch (error) {
    console.error('❌ Error removing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

removeAllNonAdminUsers();


