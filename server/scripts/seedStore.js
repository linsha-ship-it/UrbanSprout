const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  // Pots Category
  {
    name: "Ceramic Plant Pot Set",
    category: "Pots",
    price: 24.99,
    description: "Beautiful set of 3 ceramic pots in different sizes. Perfect for indoor plants with drainage holes and saucers included.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop",
    stock: 25,
    featured: true,
    rating: 4.8,
    reviews: 127
  },
  {
    name: "Terracotta Planter Large",
    category: "Pots",
    price: 18.50,
    description: "Classic terracotta planter ideal for outdoor use. Excellent drainage and breathability for healthy root development.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 40,
    rating: 4.6,
    reviews: 89
  },
  {
    name: "Modern Hanging Planters",
    category: "Pots",
    price: 32.00,
    description: "Set of 4 modern hanging planters with macrame hangers. Perfect for creating vertical gardens in small spaces.",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=400&h=300&fit=crop",
    stock: 15,
    rating: 4.7,
    reviews: 56
  },
  {
    name: "Self-Watering Planter",
    category: "Pots",
    price: 45.99,
    description: "Innovative self-watering system keeps plants hydrated for weeks. Perfect for busy gardeners or vacation care.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 20,
    featured: true,
    rating: 4.9,
    reviews: 203
  },
  {
    name: "Window Box Planter",
    category: "Pots",
    price: 28.75,
    description: "Long rectangular planter perfect for window sills. Ideal for herbs and small vegetables with built-in drainage.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop",
    stock: 30,
    rating: 4.5,
    reviews: 74
  },

  // Tools Category
  {
    name: "Premium Garden Tool Set",
    category: "Tools",
    price: 89.99,
    description: "Complete 10-piece garden tool set with ergonomic handles. Includes trowel, pruners, weeder, and more in a carrying case.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 35,
    featured: true,
    rating: 4.8,
    reviews: 156
  },
  {
    name: "Hand Trowel Stainless Steel",
    category: "Tools",
    price: 15.99,
    description: "Durable stainless steel hand trowel with comfortable grip handle. Perfect for planting, transplanting, and weeding.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 60,
    rating: 4.6,
    reviews: 234
  },
  {
    name: "Pruning Shears Professional",
    category: "Tools",
    price: 24.50,
    description: "Sharp, precision pruning shears for clean cuts. Ideal for harvesting vegetables and maintaining plants.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 45,
    rating: 4.7,
    reviews: 98
  },
  {
    name: "Garden Gloves Breathable",
    category: "Tools",
    price: 12.99,
    description: "Comfortable, breathable garden gloves with grip coating. Protects hands while maintaining dexterity.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 80,
    rating: 4.4,
    reviews: 167
  },
  {
    name: "Soil pH Testing Kit",
    category: "Tools",
    price: 19.99,
    description: "Easy-to-use soil pH testing kit with color chart. Essential for optimal plant growth and nutrient uptake.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 25,
    rating: 4.3,
    reviews: 45
  },

  // Fertilizers Category
  {
    name: "Organic Compost Premium",
    category: "Fertilizers",
    price: 16.99,
    description: "Rich, organic compost made from kitchen scraps and yard waste. Perfect natural fertilizer for all plants.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 50,
    featured: true,
    rating: 4.9,
    reviews: 289
  },
  {
    name: "Liquid Plant Food All-Purpose",
    category: "Fertilizers",
    price: 11.50,
    description: "Concentrated liquid fertilizer for indoor and outdoor plants. Easy application with measuring cap included.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 75,
    rating: 4.5,
    reviews: 134
  },
  {
    name: "Vegetable Garden Fertilizer",
    category: "Fertilizers",
    price: 14.25,
    description: "Specially formulated for vegetables with balanced NPK ratio. Promotes healthy growth and abundant harvests.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 40,
    rating: 4.7,
    reviews: 92
  },
  {
    name: "Bone Meal Organic",
    category: "Fertilizers",
    price: 13.99,
    description: "Slow-release organic bone meal fertilizer. Excellent source of phosphorus for strong root development.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 30,
    rating: 4.6,
    reviews: 67
  },
  {
    name: "Worm Castings Pure",
    category: "Fertilizers",
    price: 22.99,
    description: "Premium worm castings - nature's perfect fertilizer. Rich in nutrients and beneficial microorganisms.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 20,
    rating: 4.8,
    reviews: 156
  },

  // Watering Cans Category
  {
    name: "Copper Watering Can Vintage",
    category: "Watering Cans",
    price: 49.99,
    description: "Beautiful vintage-style copper watering can with long spout. Perfect for precise watering and garden decoration.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 15,
    featured: true,
    rating: 4.9,
    reviews: 78
  },
  {
    name: "Plastic Watering Can 2L",
    category: "Watering Cans",
    price: 12.99,
    description: "Lightweight plastic watering can with removable rose head. Perfect for indoor plants and seedlings.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 55,
    rating: 4.3,
    reviews: 123
  },
  {
    name: "Galvanized Steel Watering Can",
    category: "Watering Cans",
    price: 34.50,
    description: "Durable galvanized steel watering can with brass fittings. Classic design that lasts for years.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 25,
    rating: 4.7,
    reviews: 89
  },
  {
    name: "Long Spout Watering Can",
    category: "Watering Cans",
    price: 27.99,
    description: "Extra-long spout watering can for reaching hanging plants and deep containers. Ergonomic handle design.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 30,
    rating: 4.5,
    reviews: 56
  },
  {
    name: "Decorative Ceramic Watering Can",
    category: "Watering Cans",
    price: 38.75,
    description: "Hand-painted ceramic watering can with floral design. Functional art piece for your garden collection.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    stock: 12,
    rating: 4.6,
    reviews: 34
  }
];

async function seedStore() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);

    // Display summary
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Store Inventory Summary:');
    categories.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} products`);
    });

    console.log('\n✅ Store seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding store:', error);
    process.exit(1);
  }
}

// Run the seed function
seedStore();