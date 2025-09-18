const User = require('../models/User');
const Plant = require('../models/Plant');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const { AppError } = require('../middlewares/errorHandler');
const { asyncHandler } = require('../middlewares/errorHandler');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get current date and date 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get basic counts
  const [
    totalUsers,
    totalPlants,
    totalOrders,
    totalRevenue,
    newUsersThisMonth,
    newOrdersThisMonth,
    revenueThisMonth,
    newUsersLastMonth,
    newOrdersLastMonth,
    revenueLastMonth
  ] = await Promise.all([
    User.countDocuments(),
    Plant.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    User.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thirtyDaysAgo }
    }),
    Order.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thirtyDaysAgo }
    }),
    Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: lastMonth, $lt: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ])
  ]);

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const userGrowth = calculateGrowth(newUsersThisMonth, newUsersLastMonth);
  const orderGrowth = calculateGrowth(newOrdersThisMonth, newOrdersLastMonth);
  const revenueGrowthValue = calculateGrowth(
    revenueThisMonth[0]?.total || 0,
    revenueLastMonth[0]?.total || 0
  );

  // Get recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .populate('items.plant', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Get top selling plants
  const topPlants = await Order.aggregate([
    { $unwind: '$items' },
    { 
      $group: {
        _id: '$items.plant',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'plants',
        localField: '_id',
        foreignField: '_id',
        as: 'plant'
      }
    },
    { $unwind: '$plant' }
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalPlants,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        userGrowth: `${userGrowth}%`,
        orderGrowth: `${orderGrowth}%`,
        revenueGrowth: `${revenueGrowthValue}%`
      },
      recentOrders,
      topPlants
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const { page, limit, skip } = req.pagination;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return next(new AppError('Invalid role. Must be user or admin', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: { user }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Create new plant
// @route   POST /api/admin/plants
// @access  Private (Admin only)
const createPlant = asyncHandler(async (req, res) => {
  const plant = await Plant.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Plant created successfully',
    data: { plant }
  });
});

// @desc    Update plant
// @route   PUT /api/admin/plants/:id
// @access  Private (Admin only)
const updatePlant = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findById(req.params.id);

  if (!plant) {
    return next(new AppError('Plant not found', 404));
  }

  const updatedPlant = await Plant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Plant updated successfully',
    data: { plant: updatedPlant }
  });
});

// @desc    Delete plant
// @route   DELETE /api/admin/plants/:id
// @access  Private (Admin only)
const deletePlant = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findById(req.params.id);

  if (!plant) {
    return next(new AppError('Plant not found', 404));
  }

  await Plant.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Plant deleted successfully'
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const { page, limit, skip } = req.pagination;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.plant', 'name images')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = status;
  
  // Add to status history
  order.statusHistory.push({
    status,
    note: note || `Status updated to ${status}`,
    updatedBy: req.user._id
  });

  // Set specific timestamps
  if (status === 'shipped' && !order.shipping.shippedAt) {
    order.shipping.shippedAt = new Date();
  }
  
  if (status === 'delivered' && !order.shipping.deliveredAt) {
    order.shipping.deliveredAt = new Date();
  }

  if (status === 'cancelled' && !order.cancelledAt) {
    order.cancelledAt = new Date();
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// @desc    Get blog posts for admin
// @route   GET /api/admin/blog
// @access  Private (Admin only)
const getAllBlogPosts = asyncHandler(async (req, res) => {
  const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const { page, limit, skip } = req.pagination;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const posts = await Blog.find(query)
    .populate('author', 'name email')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.json({
    success: true,
    data: {
      posts,
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

// @desc    Approve/Disapprove blog comment
// @route   PUT /api/admin/blog/:id/comments/:commentId/approve
// @access  Private (Admin only)
const toggleCommentApproval = asyncHandler(async (req, res, next) => {
  const { id, commentId } = req.params;
  const { isApproved } = req.body;

  const post = await Blog.findById(id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  comment.isApproved = isApproved;
  await post.save();

  res.json({
    success: true,
    message: `Comment ${isApproved ? 'approved' : 'disapproved'} successfully`
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createPlant,
  updatePlant,
  deletePlant,
  getAllOrders,
  updateOrderStatus,
  getAllBlogPosts,
  toggleCommentApproval
};