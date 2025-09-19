const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyPayment,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist
} = require('../controllers/storeController');

// GET /store - Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      sort = 'name', 
      order = 'asc', 
      minPrice, 
      maxPrice, 
      search,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    if (sort === 'price') {
      sortObj.price = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else if (sort === 'rating') {
      sortObj.rating = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // Default: newest first
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Get categories for filter sidebar
    const categories = await Product.distinct('category');
    
    // Get price range
    const priceRange = await Product.aggregate([
      { $group: { 
        _id: null, 
        minPrice: { $min: '$price' }, 
        maxPrice: { $max: '$price' } 
      }}
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        filters: {
          categories,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100 }
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /store/:id - Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products (same category, different product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4).lean();

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST /store/orders - Create order with hardcoded products
router.post('/orders', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'Cash on Delivery',
      subtotal,
      shipping = 0,
      tax = 0,
      total,
      status = 'Pending',
      notes
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      });
    }

    // Debug: Log items structure
    console.log('Order items received:', JSON.stringify(items, null, 2));

    // Create order with hardcoded products - SIMPLIFIED
    const order = new Order({
      user: req.user._id,
      items: items.map((item, index) => {
        // Simple, safe ID extraction
        const productId = String(item.id || item._id || item.productId || `temp_${Date.now()}_${index}`);
        
        console.log(`Item ${index}: ${item.name} -> productId: ${productId}`);
        
        return {
          productId: productId,
          name: String(item.name || 'Unknown Product'),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: String(item.image || '')
        };
      }),
      shippingAddress,
      paymentMethod,
      subtotal: subtotal || total,
      shipping,
      tax,
      total,
      status,
      notes
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validationErrors}`,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// POST /store/order - Create order (dummy checkout)
router.post('/order', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'Credit Card',
      paymentDetails,
      notes
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Calculate shipping and tax (dummy values)
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      notes
    });

    await order.save();

    // Update product stock (in a real app, this would be in a transaction)
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate product details for response
    await order.populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      data: {
        order,
        message: 'Order placed successfully!'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// GET /store/orders/my - Get user's orders
router.get('/orders/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Razorpay Payment Routes
router.post('/create-order', auth, createRazorpayOrder);
router.post('/verify-payment', auth, verifyPayment);

// Cart Routes
router.get('/cart', auth, getCart);
router.post('/cart', auth, saveCart);

// Wishlist Routes
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist', auth, saveWishlist);

module.exports = router;