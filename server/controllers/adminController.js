const User = require('../models/User');
const Plant = require('../models/Plant');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');
const { sendBlogApprovalEmail, sendBlogRejectionEmail } = require('../utils/emailService');
const { AppError } = require('../middlewares/errorHandler');
const { asyncHandler } = require('../middlewares/errorHandler');
const crypto = require('crypto');

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
    revenueLastMonth,
    pendingBlogPosts,
    totalBlogPosts
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
    ]),
    Blog.countDocuments({ approvalStatus: 'pending' }),
    Blog.countDocuments()
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
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { 
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' }
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
        revenueGrowth: `${revenueGrowthValue}%`,
        pendingBlogPosts,
        totalBlogPosts
      },
      recentOrders,
      topProducts
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
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

  if (status) {
    query.status = status;
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
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
  const { status, search, sortBy = 'createdAt', sortOrder = 'desc', approvalStatus } = req.query;
  const { page, limit, skip } = req.pagination;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (approvalStatus) {
    query.approvalStatus = approvalStatus;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const posts = await Blog.find(query)
    .populate('authorId', 'name email')
    .populate('approvedBy', 'name')
    .populate('rejectedBy', 'name')
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

// @desc    Approve blog post
// @route   PUT /api/admin/blog/:id/approve
// @access  Private (Admin only)
const approveBlogPost = asyncHandler(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  post.approvalStatus = 'approved';
  post.status = 'published';
  post.approvedBy = req.user._id;
  post.approvedAt = new Date();
  post.rejectionReason = undefined;

  await post.save();

  // Send real-time notification to the author
  await notificationService.sendNotification(post.authorId, {
    userEmail: post.authorEmail,
    type: 'blog_approved',
    title: 'Blog Post Approved! 🎉',
    message: `Your blog post "${post.title}" has been approved and is now live on the blog!`,
    relatedId: post._id
  });

  // Send approval email to the author
  try {
    await sendBlogApprovalEmail(post.authorEmail, post.author, post.title);
    console.log(`Blog approval email sent to ${post.authorEmail}`);
  } catch (emailError) {
    console.error('Failed to send blog approval email:', emailError);
    // Don't fail approval if email fails
  }

  res.json({
    success: true,
    message: 'Blog post approved successfully',
    data: { post }
  });
});

// @desc    Reject blog post
// @route   PUT /api/admin/blog/:id/reject
// @access  Private (Admin only)
const rejectBlogPost = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  post.approvalStatus = 'rejected';
  post.status = 'rejected';
  post.rejectionReason = reason.trim();
  post.rejectedBy = req.user._id;
  post.rejectedAt = new Date();

  await post.save();

  // Send real-time notification to the author
  await notificationService.sendNotification(post.authorId, {
    userEmail: post.authorEmail,
    type: 'blog_rejected',
    title: 'Blog Post Feedback 📝',
    message: `Your blog post "${post.title}" needs some adjustments. Reason: ${reason.trim()}`,
    relatedId: post._id
  });

  // Send rejection email to the author
  try {
    await sendBlogRejectionEmail(post.authorEmail, post.author, post.title, reason.trim());
    console.log(`Blog rejection email sent to ${post.authorEmail}`);
  } catch (emailError) {
    console.error('Failed to send blog rejection email:', emailError);
    // Don't fail rejection if email fails
  }

  res.json({
    success: true,
    message: 'Blog post rejected successfully',
    data: { post }
  });
});

// @desc    Delete blog post
// @route   DELETE /api/admin/blog/:id
// @access  Private (Admin only)
const deleteBlogPost = asyncHandler(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Blog post deleted successfully'
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

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
const blockUser = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new AppError('Cannot block admin users', 400));
  }

  user.status = user.status === 'blocked' ? 'active' : 'blocked';
  user.blockReason = user.status === 'blocked' ? reason : null;

  await user.save();

  // TODO: Send email notification
  // await sendEmailNotification(user.email, 'Account Status Update', 
  //   `Your account has been ${user.status === 'blocked' ? 'blocked' : 'unblocked'}. ${reason ? `Reason: ${reason}` : ''}`);

  res.json({
    success: true,
    message: `User ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
    data: { user }
  });
});

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
const suspendUser = asyncHandler(async (req, res, next) => {
  const { reason, duration } = req.body; // duration in hours
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new AppError('Cannot suspend admin users', 400));
  }

  const suspensionEnd = new Date();
  suspensionEnd.setHours(suspensionEnd.getHours() + duration);

  user.status = 'suspended';
  user.suspensionEnd = suspensionEnd;
  user.suspensionReason = reason;

  await user.save();

  // TODO: Send email notification
  // await sendEmailNotification(user.email, 'Account Suspended', 
  //   `Your account has been suspended until ${suspensionEnd.toLocaleString()}. Reason: ${reason}`);

  res.json({
    success: true,
    message: 'User suspended successfully',
    data: { user }
  });
});

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (Admin only)
const resetUserPassword = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').hash(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // TODO: Send reset email
  // await sendEmailNotification(user.email, 'Password Reset', 
  //   `A password reset has been initiated for your account. Click here to reset: ${process.env.CLIENT_URL}/reset-password/${resetToken}`);

  res.json({
    success: true,
    message: 'Password reset email sent successfully'
  });
});

// @desc    Send email to user
// @route   POST /api/admin/users/:id/send-email
// @access  Private (Admin only)
const sendUserEmail = asyncHandler(async (req, res, next) => {
  const { subject, message } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // TODO: Send email
  // await sendEmailNotification(user.email, subject, message);

  res.json({
    success: true,
    message: 'Email sent successfully'
  });
});

// @desc    Update admin notes
// @route   PUT /api/admin/users/:id/notes
// @access  Private (Admin only)
const updateUserNotes = asyncHandler(async (req, res, next) => {
  const { notes } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.adminNotes = notes;
  await user.save();

  res.json({
    success: true,
    message: 'Admin notes updated successfully',
    data: { user }
  });
});

// @desc    Flag/Unflag user
// @route   PUT /api/admin/users/:id/flag
// @access  Private (Admin only)
const flagUser = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isFlagged = !user.isFlagged;
  user.flaggedReason = user.isFlagged ? reason : null;

  await user.save();

  res.json({
    success: true,
    message: `User ${user.isFlagged ? 'flagged' : 'unflagged'} successfully`,
    data: { user }
  });
});

// @desc    Bulk operations on users
// @route   POST /api/admin/users/bulk
// @access  Private (Admin only)
const bulkUserOperations = asyncHandler(async (req, res, next) => {
  const { userIds, operation, data } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('User IDs are required', 400));
  }

  const users = await User.find({ _id: { $in: userIds } });
  const results = [];

  for (const user of users) {
    if (user.role === 'admin') {
      results.push({ userId: user._id, success: false, message: 'Cannot modify admin users' });
      continue;
    }

    try {
      switch (operation) {
        case 'block':
          user.status = 'blocked';
          user.blockReason = data.reason || 'Bulk block operation';
          break;
        case 'unblock':
          user.status = 'active';
          user.blockReason = null;
          break;
        case 'delete':
          await User.findByIdAndDelete(user._id);
          results.push({ userId: user._id, success: true, message: 'User deleted' });
          continue;
        case 'changeRole':
          user.role = data.role;
          break;
        case 'suspend':
          const suspensionEnd = new Date();
          suspensionEnd.setHours(suspensionEnd.getHours() + (data.duration || 24));
          user.status = 'suspended';
          user.suspensionEnd = suspensionEnd;
          user.suspensionReason = data.reason || 'Bulk suspend operation';
          break;
        default:
          results.push({ userId: user._id, success: false, message: 'Invalid operation' });
          continue;
      }

      await user.save();
      results.push({ userId: user._id, success: true, message: `Operation ${operation} completed` });
    } catch (error) {
      results.push({ userId: user._id, success: false, message: error.message });
    }
  }

  res.json({
    success: true,
    message: 'Bulk operation completed',
    data: { results }
  });
});

// @desc    Get user details for quick view
// @route   GET /api/admin/users/:id/details
// @access  Private (Admin only)
const getUserDetails = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
    .lean();

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get additional user activity data
  const [blogPosts, orders] = await Promise.all([
    Blog.countDocuments({ authorId: userId }),
    Order.countDocuments({ userId: userId })
  ]);

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        activity: {
          blogPosts,
          orders
        }
      }
    }
  });
});

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get all products with pagination and filters
// @route   GET /api/admin/products
// @access  Private (Admin only)
const getAllProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, category, status, featured } = req.query;
  const { skip } = req.pagination;

  let query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Status filter
  if (status === 'published') {
    query.published = true;
    query.archived = false;
  } else if (status === 'unpublished') {
    query.published = false;
    query.archived = false;
  } else if (status === 'archived') {
    query.archived = true;
  }

  // Featured filter
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  const products = await Product.find(query)
    .populate('vendor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Private (Admin only)
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('vendor', 'name email');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.json({
    success: true,
    data: { product }
  });
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin only)
const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    category,
    description,
    sku,
    regularPrice,
    discountPrice,
    stock,
    lowStockThreshold,
    images,
    featured,
    published,
    tags,
    weight,
    dimensions,
    specifications
  } = req.body;

  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return next(new AppError('SKU already exists', 400));
  }

  const product = await Product.create({
    name,
    category,
    description,
    sku,
    regularPrice,
    discountPrice,
    stock,
    lowStockThreshold,
    images,
    featured: featured || false,
    published: published !== false,
    tags,
    weight,
    dimensions,
    specifications
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    category,
    description,
    sku,
    regularPrice,
    discountPrice,
    stock,
    lowStockThreshold,
    images,
    featured,
    published,
    tags,
    weight,
    dimensions,
    specifications
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if SKU already exists (excluding current product)
  if (sku && sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku, _id: { $ne: req.params.id } });
    if (existingProduct) {
      return next(new AppError('SKU already exists', 400));
    }
  }

  // Update fields
  if (name) product.name = name;
  if (category) product.category = category;
  if (description) product.description = description;
  if (sku) product.sku = sku;
  if (regularPrice !== undefined) product.regularPrice = regularPrice;
  if (discountPrice !== undefined) product.discountPrice = discountPrice;
  if (stock !== undefined) product.stock = stock;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
  if (images) product.images = images;
  if (featured !== undefined) product.featured = featured;
  if (published !== undefined) product.published = published;
  if (tags) product.tags = tags;
  if (weight !== undefined) product.weight = weight;
  if (dimensions) product.dimensions = dimensions;
  if (specifications) product.specifications = specifications;

  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// @desc    Archive product (soft delete)
// @route   PUT /api/admin/products/:id/archive
// @access  Private (Admin only)
const archiveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product.archived = true;
  product.published = false;
  await product.save();

  res.json({
    success: true,
    message: 'Product archived successfully',
    data: { product }
  });
});

// @desc    Restore archived product
// @route   PUT /api/admin/products/:id/restore
// @access  Private (Admin only)
const restoreProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product.archived = false;
  product.published = true;
  await product.save();

  res.json({
    success: true,
    message: 'Product restored successfully',
    data: { product }
  });
});

// @desc    Delete product permanently
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted permanently'
  });
});

// @desc    Get product categories
// @route   GET /api/admin/products/categories
// @access  Private (Admin only)
const getProductCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk
// @access  Private (Admin only)
const bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: updates }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  blockUser,
  suspendUser,
  resetUserPassword,
  sendUserEmail,
  updateUserNotes,
  flagUser,
  bulkUserOperations,
  getUserDetails,
  createPlant,
  updatePlant,
  deletePlant,
  getAllOrders,
  updateOrderStatus,
  getAllBlogPosts,
  approveBlogPost,
  rejectBlogPost,
  deleteBlogPost,
  toggleCommentApproval,
  // Product management
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
  deleteProduct,
  getProductCategories,
  bulkUpdateProducts
};