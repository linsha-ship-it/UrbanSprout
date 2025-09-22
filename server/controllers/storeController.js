const Plant = require('../models/Plant');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const { asyncHandler } = require('../middlewares/errorHandler');
const { sendOrderConfirmationEmail, sendPaymentConfirmationEmail } = require('../utils/emailService');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RH9Kx0Ibt9neI6',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'CjIJyaqKbJzhUNR9J0zu4KjI'
});

// @desc    Get all plants
// @route   GET /api/store/plants
// @access  Public
const getAllPlants = asyncHandler(async (req, res) => {
  const { 
    category, 
    difficulty, 
    light, 
    features, 
    minPrice, 
    maxPrice, 
    search, 
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  const { page, limit, skip } = req.pagination;

  // Build query
  let query = { isActive: true };

  if (category) {
    query.category = category.toLowerCase();
  }

  if (difficulty) {
    query.difficulty = difficulty.toLowerCase();
  }

  if (light) {
    query['careInstructions.light'] = light.toLowerCase();
  }

  if (features) {
    const featureArray = Array.isArray(features) ? features : [features];
    query.features = { $in: featureArray.map(f => f.toLowerCase()) };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Build sort object
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get plants with pagination
  const plants = await Plant.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await Plant.countDocuments(query);

  res.json({
    success: true,
    data: {
      plants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single plant
// @route   GET /api/store/plants/:id
// @access  Public
const getPlant = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findById(req.params.id)
    .populate('reviews.user', 'name avatar');

  if (!plant || !plant.isActive) {
    return next(new AppError('Plant not found', 404));
  }

  res.json({
    success: true,
    data: { plant }
  });
});

// @desc    Get plant by slug
// @route   GET /api/store/plants/slug/:slug
// @access  Public
const getPlantBySlug = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findOne({ 'seo.slug': req.params.slug, isActive: true })
    .populate('reviews.user', 'name avatar');

  if (!plant) {
    return next(new AppError('Plant not found', 404));
  }

  res.json({
    success: true,
    data: { plant }
  });
});

// @desc    Get featured plants
// @route   GET /api/store/plants/featured
// @access  Public
const getFeaturedPlants = asyncHandler(async (req, res) => {
  const plants = await Plant.find({ isActive: true, isFeatured: true })
    .sort({ 'rating.average': -1 })
    .limit(8)
    .lean();

  res.json({
    success: true,
    data: { plants }
  });
});

// @desc    Get plant recommendations based on user preferences
// @route   GET /api/store/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const { lightLevel, wateringFrequency, spaceType, experience, petFriendly, airPurifying } = user.preferences;

  let query = { isActive: true };

  // Build query based on preferences
  if (lightLevel) {
    query['careInstructions.light'] = { $in: [lightLevel, 'low-medium', 'medium-high'] };
  }

  if (experience) {
    if (experience === 'beginner') {
      query.difficulty = { $in: ['beginner'] };
    } else if (experience === 'intermediate') {
      query.difficulty = { $in: ['beginner', 'intermediate'] };
    }
    // Advanced users can handle any difficulty
  }

  if (petFriendly) {
    query.features = { $in: ['pet-safe'] };
  }

  if (airPurifying) {
    query.features = { $in: ['air-purifying'] };
  }

  // Get recommended plants
  const plants = await Plant.find(query)
    .sort({ 'rating.average': -1, isFeatured: -1 })
    .limit(12)
    .lean();

  res.json({
    success: true,
    data: { 
      plants,
      basedOn: user.preferences
    }
  });
});

// @desc    Add plant review
// @route   POST /api/store/plants/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  const plant = await Plant.findById(req.params.id);

  if (!plant || !plant.isActive) {
    return next(new AppError('Plant not found', 404));
  }

  // Check if user already reviewed this plant
  const existingReview = plant.reviews.find(
    review => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    return next(new AppError('You have already reviewed this plant', 400));
  }

  // Add review
  const review = {
    user: req.user._id,
    rating,
    comment: comment ? comment.trim() : ''
  };

  plant.reviews.push(review);
  plant.updateRating();
  await plant.save();

  await plant.populate('reviews.user', 'name avatar');

  const newReview = plant.reviews[plant.reviews.length - 1];

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: { review: newReview }
  });
});

// @desc    Get plant categories
// @route   GET /api/store/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Plant.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Create new order
// @route   POST /api/store/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    payment,
    shipping,
    notes,
    coupon
  } = req.body;

  // Validate and calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const plant = await Plant.findById(item.plant);
    
    if (!plant || !plant.isActive) {
      return next(new AppError(`Plant with ID ${item.plant} not found or inactive`, 400));
    }

    if (plant.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${plant.name}. Available: ${plant.stock}`, 400));
    }

    const itemTotal = plant.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      plant: plant._id,
      quantity: item.quantity,
      price: plant.price,
      size: item.size || plant.size,
      potSize: item.potSize || plant.potSize
    });

    // Update plant stock
    plant.stock -= item.quantity;
    await plant.save();
  }

  // Calculate tax and shipping (simplified)
  const tax = subtotal * 0.08; // 8% tax
  const shippingCost = subtotal > 50 ? 0 : 9.99; // Free shipping over ₹50
  let discount = 0;

  // Apply coupon if provided
  if (coupon && coupon.code) {
    // Simple coupon validation (in real app, you'd have a Coupon model)
    if (coupon.code === 'WELCOME10') {
      discount = coupon.type === 'percentage' ? subtotal * 0.1 : 10;
    }
  }

  const total = subtotal + tax + shippingCost - discount;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress,
    pricing: {
      subtotal,
      tax,
      shipping: shippingCost,
      discount,
      total
    },
    payment: {
      method: payment.method,
      status: 'pending'
    },
    shipping: {
      method: shipping.method || 'standard'
    },
    notes,
    coupon
  });

  await order.populate('items.plant', 'name images');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

// @desc    Get user orders
// @route   GET /api/store/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = req.pagination;

  const orders = await Order.find({ user: req.user._id })
    .populate('items.plant', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single order
// @route   GET /api/store/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('items.plant', 'name images scientificName');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.json({
    success: true,
    data: { order }
  });
});

// @desc    Cancel order
// @route   PUT /api/store/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  // Restore plant stock
  for (const item of order.items) {
    const plant = await Plant.findById(item.plant);
    if (plant) {
      plant.stock += item.quantity;
      await plant.save();
    }
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Cancelled by customer';
  
  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

// @desc    Create Razorpay order
// @route   POST /api/store/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  if (!amount || amount <= 0) {
    return next(new AppError('Invalid amount', 400));
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return next(new AppError('Failed to create payment order', 500));
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/store/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Missing payment verification data', 400));
  }

  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError('Invalid payment signature', 400));
    }

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      items: orderData.items.map((item, index) => {
        // Simple, safe ID extraction for Razorpay
        const productId = String(item.id || item._id || item.productId || `razorpay_${Date.now()}_${index}`);
        
        console.log(`Razorpay item ${index}: ${item.name} -> productId: ${productId}`);
        
        return {
          productId: productId,
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          name: String(item.name || 'Unknown Product'),
          image: String(item.image || '')
        };
      }),
      shippingAddress: {
        fullName: orderData.shippingAddress.fullName,
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postalCode: orderData.shippingAddress.pincode, // Map pincode to postalCode
        country: orderData.shippingAddress.country || 'India', // Default to India
        phone: orderData.shippingAddress.phone
      },
      paymentMethod: 'UPI', // Map online payment to UPI
      subtotal: orderData.total,
      shipping: 0,
      tax: 0,
      total: orderData.total,
      status: 'Pending', // Use valid enum value
      notes: `Razorpay Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`
    });

    // Get user details for email
    const user = await User.findById(req.user._id);

    // Send order confirmation email
    try {
      const orderDetails = {
        orderId: order._id.toString().slice(-8),
        orderDate: order.createdAt,
        totalAmount: order.total,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: `${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 days from now
      };

      // Temporarily disabled due to Gmail authentication issues
      // await sendOrderConfirmationEmail(user.email, user.name, orderDetails);
      console.log(`Order confirmation email would be sent to ${user.email} (disabled)`);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail payment if email fails
    }

    // Send payment confirmation email
    try {
      const paymentDetails = {
        transactionId: razorpay_payment_id,
        paymentDate: new Date(),
        paymentMethod: 'UPI',
        amount: order.total,
        orderId: order._id.toString().slice(-8)
      };

      // Temporarily disabled due to Gmail authentication issues
      // await sendPaymentConfirmationEmail(user.email, user.name, paymentDetails);
      console.log(`Payment confirmation email would be sent to ${user.email} (disabled)`);
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
      // Don't fail payment if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new AppError(`Order validation failed: ${validationErrors}`, 400));
    }
    
    return next(new AppError('Payment verification failed', 500));
  }
});

// @desc    Get user cart
// @route   GET /api/store/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.json({
      success: true,
      data: cart.items
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.json({
      success: true,
      data: [] // Return empty array on error
    });
  }
});

// @desc    Save user cart
// @route   POST /api/store/cart
// @access  Private
const saveCart = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body;
    
    // Validate items
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    // Find or create cart using upsert
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          items: items.map(item => ({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
          })),
          updatedAt: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json({
      success: true,
      message: 'Cart saved successfully',
      data: { items: cart.items }
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving cart',
      error: error.message
    });
  }
});

// @desc    Get user wishlist
// @route   GET /api/store/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    
    res.json({
      success: true,
      data: wishlist.items
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.json({
      success: true,
      data: [] // Return empty array on error
    });
  }
});

// @desc    Save user wishlist
// @route   POST /api/store/wishlist
// @access  Private
const saveWishlist = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body;
    
    // Validate items
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    // Find or create wishlist using upsert
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          items: items.map(item => ({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.image
          })),
          updatedAt: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json({
      success: true,
      message: 'Wishlist saved successfully',
      data: { items: wishlist.items }
    });
  } catch (error) {
    console.error('Error saving wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving wishlist',
      error: error.message
    });
  }
});

module.exports = {
  getAllPlants,
  getPlant,
  getPlantBySlug,
  getFeaturedPlants,
  getRecommendations,
  addReview,
  getCategories,
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  createRazorpayOrder,
  verifyPayment,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist
};