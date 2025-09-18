const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Import models to ensure collections are created
const User = require('../models/User');
const Blog = require('../models/Blog');
const Product = require('../models/Product');
const Plant = require('../models/Plant');
const Order = require('../models/Order');

const setupUrbanDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB (urban database)...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to urban database successfully!');

    // Create collections by ensuring indexes
    console.log('📋 Setting up collections...');

    // Users collection
    await User.createIndexes();
    console.log('✅ Users collection ready');

    // Blog posts collection
    await Blog.createIndexes();
    console.log('✅ Blog posts collection ready');

    // Products collection
    await Product.createIndexes();
    console.log('✅ Products collection ready');

    // Plants collection
    await Plant.createIndexes();
    console.log('✅ Plants collection ready');

    // Orders collection
    await Order.createIndexes();
    console.log('✅ Orders collection ready');

    // Seed some sample blog posts if none exist
    const existingPosts = await Blog.countDocuments();
    if (existingPosts === 0) {
      console.log('📝 Seeding sample blog posts...');
      
      const samplePosts = [
        {
          title: 'Help! My basil leaves are turning yellow 🌿',
          content: 'I\'ve been growing basil for 3 months and recently noticed the lower leaves turning yellow. I water it every other day and it gets morning sun. Has anyone experienced this? What could be causing it and how can I fix it?',
          excerpt: 'Basil leaves turning yellow - need help with diagnosis and treatment',
          category: 'question',
          tags: ['basil', 'yellow-leaves', 'herb-garden', 'plant-help'],
          author: 'Sarah Chen',
          authorEmail: 'sarah@example.com',
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&h=300&fit=crop'
        },
        {
          title: 'My first tomato harvest from balcony garden! 🍅',
          content: 'After 4 months of careful tending, my cherry tomatoes are finally ready for harvest! Started from seeds in my small balcony setup. The key was consistent watering and good support structures. So proud of this achievement!',
          excerpt: 'Successful tomato harvest from balcony garden setup',
          category: 'success_story',
          tags: ['tomatoes', 'balcony-garden', 'success-story', 'harvest'],
          author: 'Mike Rodriguez',
          authorEmail: 'mike@example.com',
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1592841200221-21e1c4e8e8c4?w=500&h=300&fit=crop'
        },
        {
          title: 'Snake plant survived my 2-week vacation! 🐍',
          content: 'I was worried about leaving my plants for 2 weeks, but my snake plant not only survived but actually looks healthier! I think the break from overwatering was exactly what it needed. Sometimes less is more with plant care.',
          excerpt: 'Snake plant thrived during vacation - low maintenance success',
          category: 'success_story',
          tags: ['snake-plant', 'low-maintenance', 'vacation-care', 'success'],
          author: 'Alex Johnson',
          authorEmail: 'alex@example.com',
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
        },
        {
          title: 'Why are my pothos leaves getting brown spots? 🤔',
          content: 'I noticed small brown spots appearing on my pothos leaves over the past week. The plant is in bright indirect light and I water it weekly. The spots are mostly on older leaves. Should I be worried? What could be causing this?',
          excerpt: 'Pothos developing brown spots - seeking advice',
          category: 'question',
          tags: ['pothos', 'brown-spots', 'plant-problems', 'help'],
          author: 'Maria Santos',
          authorEmail: 'maria@example.com',
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop'
        }
      ];

      await Blog.insertMany(samplePosts);
      console.log('✅ Sample blog posts created');
    }

    // Seed some sample products if none exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      console.log('🛒 Seeding sample products...');
      
      const sampleProducts = [
        {
          name: 'Snake Plant',
          description: 'Perfect for beginners, tolerates low light and infrequent watering',
          price: 24.99,
          category: 'indoor-plants',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
          tags: ['low-maintenance', 'air-purifying', 'beginner-friendly']
        },
        {
          name: 'Pothos Golden',
          description: 'Fast-growing trailing plant, excellent for hanging baskets',
          price: 18.99,
          category: 'indoor-plants',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
          tags: ['trailing', 'fast-growing', 'easy-care']
        },
        {
          name: 'Ceramic Planter Set',
          description: 'Set of 3 modern ceramic planters with drainage holes',
          price: 34.99,
          category: 'accessories',
          inStock: true,
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
          tags: ['planters', 'ceramic', 'modern-design']
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products created');
    }

    console.log('🎉 Urban database setup completed successfully!');
    console.log('📊 Database statistics:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Blog Posts: ${await Blog.countDocuments()}`);
    console.log(`   Products: ${await Product.countDocuments()}`);
    console.log(`   Plants: ${await Plant.countDocuments()}`);
    console.log(`   Orders: ${await Order.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error setting up urban database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the setup
setupUrbanDatabase();

