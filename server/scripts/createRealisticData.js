const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Blog = require('../models/Blog');

async function createRealisticUsersWithPosts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Create realistic users
    const users = [
      {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@gmail.com',
        password: 'Password123!',
        role: 'beginner',
        emailVerified: true
      },
      {
        name: 'James Chen',
        email: 'james.chen@gmail.com',
        password: 'Password123!',
        role: 'expert',
        emailVerified: true
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa.thompson@gmail.com',
        password: 'Password123!',
        role: 'vendor',
        emailVerified: false
      }
    ];

    console.log('👥 Creating realistic users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create blog posts with different approval statuses
    const blogPosts = [
      {
        title: 'My first succulent collection is growing! 🌵',
        content: 'I started collecting succulents 3 months ago and I\'m amazed at how they\'ve grown. I have 12 different varieties now, from echeverias to haworthias. The key has been finding the right balance of light and water. I keep them on my south-facing windowsill and water them every 2 weeks. Some are flowering now which is so exciting!',
        excerpt: 'Sharing my journey with succulent collection and care tips',
        category: 'success_story',
        tags: ['succulents', 'collection', 'care-tips', 'beginner'],
        author: 'Maria Rodriguez',
        authorEmail: 'maria.rodriguez@gmail.com',
        status: 'pending_approval',
        approvalStatus: 'pending',
        likes: [],
        bookmarks: [],
        shares: [],
        comments: []
      },
      {
        title: 'Help! My fiddle leaf fig is dropping leaves 🍃',
        content: 'I\'ve had my fiddle leaf fig for about 6 months and it was doing great until recently. Over the past 2 weeks, it\'s been dropping leaves almost daily. The leaves are turning yellow and brown before falling off. I water it once a week and it gets bright indirect light. I\'m worried I might be overwatering or there could be a pest issue. Any advice would be greatly appreciated!',
        excerpt: 'Seeking help with fiddle leaf fig leaf drop issue',
        category: 'question',
        tags: ['fiddle-leaf-fig', 'leaf-drop', 'plant-problems', 'help'],
        author: 'Maria Rodriguez',
        authorEmail: 'maria.rodriguez@gmail.com',
        status: 'pending_approval',
        approvalStatus: 'pending',
        likes: [],
        bookmarks: [],
        shares: [],
        comments: []
      },
      {
        title: 'Advanced propagation techniques for rare plants 🌿',
        content: 'After years of experimenting with plant propagation, I\'ve developed some advanced techniques that work particularly well for rare and difficult-to-propagate species. The key is understanding the specific needs of each plant type. For example, some plants respond better to air layering while others prefer stem cuttings with rooting hormone. I\'ll share my detailed methods including timing, substrate preparation, and environmental conditions.',
        excerpt: 'Expert guide to advanced plant propagation methods',
        category: 'success_story',
        tags: ['propagation', 'rare-plants', 'advanced-techniques', 'expert'],
        author: 'James Chen',
        authorEmail: 'james.chen@gmail.com',
        status: 'pending_approval',
        approvalStatus: 'pending',
        likes: [],
        bookmarks: [],
        shares: [],
        comments: []
      },
      {
        title: 'Starting my plant nursery business - Day 1! 🌱',
        content: 'Today marks the official start of my plant nursery business! I\'ve been planning this for over a year and finally have my greenhouse set up. I\'m starting with 200 plants including popular houseplants, herbs, and some rare varieties. The biggest challenge so far has been getting the humidity and temperature just right in the greenhouse. I\'m documenting everything and will share my journey as I learn and grow.',
        excerpt: 'Beginning of plant nursery business journey',
        category: 'success_story',
        tags: ['nursery', 'business', 'greenhouse', 'vendor'],
        author: 'Lisa Thompson',
        authorEmail: 'lisa.thompson@gmail.com',
        status: 'pending_approval',
        approvalStatus: 'pending',
        likes: [],
        bookmarks: [],
        shares: [],
        comments: []
      },
      {
        title: 'What\'s the best soil mix for indoor plants? 🤔',
        content: 'I\'m getting conflicting advice about soil mixes for indoor plants. Some people say to use regular potting soil, others recommend adding perlite, and I\'ve heard about special indoor plant mixes. I have a variety of plants including pothos, snake plants, and a few succulents. What would be the best approach? Should I use different mixes for different types of plants?',
        excerpt: 'Question about optimal soil mixes for indoor plants',
        category: 'question',
        tags: ['soil', 'indoor-plants', 'potting-mix', 'care'],
        author: 'Maria Rodriguez',
        authorEmail: 'maria.rodriguez@gmail.com',
        status: 'pending_approval',
        approvalStatus: 'pending',
        likes: [],
        bookmarks: [],
        shares: [],
        comments: []
      }
    ];

    console.log('📝 Creating blog posts with pending approval...');
    const createdPosts = await Blog.insertMany(blogPosts);
    console.log(`✅ Created ${createdPosts.length} blog posts pending approval`);

    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📝 Blog posts: ${createdPosts.length} (all pending approval)`);
    
    console.log('\n🎯 Test Credentials:');
    console.log('All users have password: Password123!');
    console.log('- maria.rodriguez@gmail.com (Beginner)');
    console.log('- james.chen@gmail.com (Expert)');
    console.log('- lisa.thompson@gmail.com (Vendor)');

    console.log('\n✅ Setup complete! You now have:');
    console.log('- Realistic users with different roles');
    console.log('- Blog posts pending admin approval');
    console.log('- Test data for admin functionality');

  } catch (error) {
    console.error('❌ Error creating users and posts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createRealisticUsersWithPosts();


