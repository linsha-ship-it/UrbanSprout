const User = require('../models/User');
const Plant = require('../models/Plant');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const notificationService = require('../utils/notificationService');
const { sendBlogApprovalEmail, sendBlogRejectionEmail, sendEmailNotification, sendAdminVerificationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');
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

  // Send verification email if role is upgraded to admin
  if (role === 'admin') {
    try {
      await sendAdminVerificationEmail(user.email, user.name, 'user', 'Your account has been upgraded to admin status');
      console.log(`Admin verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send admin verification email:', emailError);
    }
  }

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
    .populate('items.product', 'name images')
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
  
  // Add to status history (if statusHistory exists)
  if (order.statusHistory) {
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
  }

  // Send notification to user about order status update
  try {
    let notificationType = 'order_status_update';
    let notificationTitle = 'Order Status Updated';
    let notificationMessage = `Your order #${order.orderNumber} status has been updated to: ${status.toUpperCase()}`;

    // Set specific notification types for important status changes
    if (status === 'shipped') {
      notificationType = 'order_shipped';
      notificationTitle = 'Order Shipped! 🚚';
      notificationMessage = `Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.`;
    } else if (status === 'delivered') {
      notificationType = 'order_delivered';
      notificationTitle = 'Order Delivered! ✅';
      notificationMessage = `Your order #${order.orderNumber} has been delivered successfully. Thank you for shopping with UrbanSprout!`;
    } else if (status === 'cancelled') {
      notificationType = 'order_cancelled';
      notificationTitle = 'Order Cancelled';
      notificationMessage = `Your order #${order.orderNumber} has been cancelled. If you have any questions, please contact our support team.`;
    }

    await notificationService.sendNotification(order.user, {
      userEmail: order.user.email,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      relatedId: order._id,
      relatedModel: 'Order'
    });

    console.log(`Order status notification sent to user ${order.user.email}`);

    // Send professional email notification for order status update
    try {
      const orderDetails = {
        orderId: order.orderNumber || order._id.toString().slice(-8),
        status: status,
        updatedAt: new Date(),
        trackingNumber: order.trackingNumber || null,
        carrier: order.shipping?.carrier || 'Standard Shipping',
        estimatedDelivery: order.shipping?.estimatedDelivery || '3-5 business days'
      };

      await sendOrderStatusUpdateEmail(order.user.email, order.user.name, orderDetails);
      console.log(`Professional order status update email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Error sending order status update email:', emailError);
      // Fallback to basic email notification
      try {
        await sendEmailNotification(
          order.user.email,
          `Order Status Update - ${status.toUpperCase()}`,
          `Your order #${order.orderNumber || order._id.toString().slice(-8)} status has been updated to: ${status.toUpperCase()}`,
          order.user.name || 'Customer'
        );
        console.log(`Fallback email notification sent to ${order.user.email}`);
      } catch (fallbackError) {
        console.error('Error sending fallback email notification:', fallbackError);
      }
    }
  } catch (notificationError) {
    console.error('Error sending order status notification:', notificationError);
    // Don't fail the order update if notification fails
  }

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

  // Send notification to the author
  try {
    const author = await User.findOne({ email: post.authorEmail });
    if (author) {
      await notificationService.sendNotification(author._id, {
        userEmail: post.authorEmail,
        type: 'blog_approved',
        title: 'Blog Post Approved! ✅',
        message: `Congratulations! Your blog post "${post.title}" has been approved and is now live on UrbanSprout.`,
        relatedId: post._id,
        relatedModel: 'Blog'
      });
      console.log(`Blog approval notification sent to user ${post.authorEmail}`);
    }
  } catch (notificationError) {
    console.error('Error sending blog approval notification:', notificationError);
    // Don't fail approval if notification fails
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

  // Send notification to the author
  try {
    const author = await User.findOne({ email: post.authorEmail });
    if (author) {
      await notificationService.sendNotification(author._id, {
        userEmail: post.authorEmail,
        type: 'blog_rejected',
        title: 'Blog Post Needs Revision',
        message: `Your blog post "${post.title}" needs some revisions. Reason: ${reason.trim()}`,
        relatedId: post._id,
        relatedModel: 'Blog'
      });
      console.log(`Blog rejection notification sent to user ${post.authorEmail}`);
    }
  } catch (notificationError) {
    console.error('Error sending blog rejection notification:', notificationError);
    // Don't fail rejection if notification fails
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

  // Send notification to the author before deleting
  try {
    const author = await User.findOne({ email: post.authorEmail });
    if (author) {
      await notificationService.sendNotification(author._id, {
        userEmail: post.authorEmail,
        type: 'blog_deleted',
        title: 'Blog Post Deleted',
        message: `Your blog post "${post.title}" has been deleted from UrbanSprout.`,
        relatedId: post._id,
        relatedModel: 'Blog'
      });
      console.log(`Blog deletion notification sent to user ${post.authorEmail}`);
    }
  } catch (notificationError) {
    console.error('Error sending blog deletion notification:', notificationError);
    // Don't fail deletion if notification fails
  }

  // Send email notification to the author before deleting
  try {
    await sendEmailNotification(
      post.authorEmail,
      'Blog Post Deleted - UrbanSprout',
      `Hello ${post.author}!

We wanted to inform you that your blog post "${post.title}" has been deleted from UrbanSprout.

If you have any questions about this action or would like to discuss it further, please don't hesitate to contact our support team.

Thank you for your understanding.

Best regards,
The UrbanSprout Team`,
      post.author
    );
    console.log(`Blog deletion email sent to ${post.authorEmail}`);
  } catch (emailError) {
    console.error('Error sending blog deletion email:', emailError);
    // Don't fail deletion if email fails
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
  const { page = 1, limit = 10, search, category, status, featured, stock, minPrice, maxPrice, sortBy, sortOrder } = req.query;
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

  // Stock filter
  if (stock) {
    if (stock === 'in-stock') {
      // In stock: stock > lowStockThreshold (excludes low stock and out of stock)
      query.$expr = { $gt: ['$stock', '$lowStockThreshold'] };
    } else if (stock === 'low-stock') {
      // Low stock: stock > 0 AND stock <= lowStockThreshold (excludes out of stock)
      query.$expr = { 
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', '$lowStockThreshold'] }
        ]
      };
    } else if (stock === 'out-of-stock') {
      // Out of stock: stock = 0
      query.stock = 0;
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.regularPrice = {};
    if (minPrice) {
      query.regularPrice.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.regularPrice.$lte = parseFloat(maxPrice);
    }
  }

  // Build sort object
  let sortObj = { createdAt: -1 }; // default sort
  if (sortBy && sortOrder) {
    sortObj = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'name') {
      sortObj.name = order;
    } else if (sortBy === 'price') {
      sortObj.regularPrice = order;
    } else if (sortBy === 'stock') {
      sortObj.stock = order;
    } else if (sortBy === 'createdAt') {
      sortObj.createdAt = order;
    }
  }

  const products = await Product.find(query)
    .populate('vendor', 'name email')
    .sort(sortObj)
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
    {
      $match: {
        name: { $not: /^Dummy Product for/ }
      }
    },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Get categories with products count
// @route   GET /api/admin/products/categories-with-products
// @access  Private (Admin only)
const getCategoriesWithProducts = asyncHandler(async (req, res, next) => {
  const categories = await Product.aggregate([
    {
      $match: {
        name: { $not: /^Dummy Product for/ }
      }
    },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $match: { count: { $gt: 0 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: { categories: categories.map(cat => cat._id) }
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/products/categories/:categoryName
// @access  Private (Admin only)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { categoryName } = req.params;

  // Check if category has real products (excluding placeholder and dummy products)
  const productCount = await Product.countDocuments({ 
    category: categoryName,
    $and: [
      { published: { $ne: false } },
      { archived: { $ne: true } },
      { name: { $not: /^Dummy Product for/ } },
      { name: { $not: /^Placeholder for/ } }
    ]
  });
  
  if (productCount > 0) {
    return next(new AppError(`Cannot delete category "${categoryName}" - it has ${productCount} products`, 400));
  }

  // Check if category exists
  const categoryExists = await Product.findOne({ category: categoryName });
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  // Delete all placeholder products with this category (including the one created for the category)
  const deleteResult = await Product.deleteMany({ 
    category: categoryName,
    $or: [
      { published: false },
      { archived: true },
      { name: /^Dummy Product for/ },
      { name: /^Placeholder for/ }
    ]
  });

  res.json({
    success: true,
    message: `Category "${categoryName}" deleted successfully`,
    data: { deletedCount: deleteResult.deletedCount }
  });
});

// @desc    Create new category
// @route   POST /api/admin/products/categories
// @access  Private (Admin only)
const createCategory = asyncHandler(async (req, res, next) => {
  const { categoryName } = req.body;

  if (!categoryName || categoryName.trim() === '') {
    return next(new AppError('Category name is required', 400));
  }

  // Check if category already exists
  const categoryExists = await Product.findOne({ category: categoryName.trim() });
  if (categoryExists) {
    return next(new AppError('Category already exists', 400));
  }

  // Create a placeholder product with this category to make it "exist"
  // This product is published but marked as a placeholder so it doesn't show in the store
  const placeholderProduct = new Product({
    name: `Placeholder for ${categoryName.trim()}`,
    category: categoryName.trim(),
    description: 'This is a placeholder product to create the category',
    sku: `PLACEHOLDER-${Date.now()}`,
    regularPrice: 0,
    stock: 0,
    published: true, // Published so it appears in categories
    archived: false, // Not archived so it appears in categories
    tags: ['placeholder', 'category-creation'] // Tag to identify placeholder products
  });

  await placeholderProduct.save();

  res.json({
    success: true,
    message: `Category "${categoryName.trim()}" created successfully`,
    data: { category: categoryName.trim() }
  });
});

// @desc    Update category name
// @route   PUT /api/admin/products/categories/:oldCategoryName
// @access  Private (Admin only)
const updateCategory = asyncHandler(async (req, res, next) => {
  const { oldCategoryName } = req.params;
  const { newCategoryName } = req.body;

  if (!newCategoryName || newCategoryName.trim() === '') {
    return next(new AppError('New category name is required', 400));
  }

  // Check if old category exists
  const oldCategoryExists = await Product.findOne({ category: oldCategoryName });
  if (!oldCategoryExists) {
    return next(new AppError('Category not found', 404));
  }

  // Check if new category name already exists
  const newCategoryExists = await Product.findOne({ category: newCategoryName.trim() });
  if (newCategoryExists) {
    return next(new AppError('Category name already exists', 400));
  }

  // Update all products with the old category name (including dummy products)
  const result = await Product.updateMany(
    { category: oldCategoryName },
    { $set: { category: newCategoryName.trim() } }
  );

  res.json({
    success: true,
    message: `Category "${oldCategoryName}" updated to "${newCategoryName}" successfully`,
    data: { updatedCount: result.modifiedCount }
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

// @desc    Get inventory statistics
// @route   GET /api/admin/products/inventory-stats
// @access  Private (Admin only)
const getInventoryStats = asyncHandler(async (req, res, next) => {
  const totalProducts = await Product.countDocuments({ archived: false });
  const lowStockProducts = await Product.find({ 
    $expr: { 
      $and: [
        { $gt: ['$stock', 0] },
        { $lte: ['$stock', '$lowStockThreshold'] }
      ]
    },
    archived: false 
  });
  const outOfStockProducts = await Product.find({ 
    stock: 0, 
    archived: false 
  });
  
  // Calculate total inventory value
  const products = await Product.find({ archived: false });
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.stock * product.regularPrice);
  }, 0);

  // Get top selling products (mock data for now)
  const topSellingProducts = await Product.find({ archived: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name salesCount totalSales');

  // Get slow moving products (mock data for now)
  const slowMovingProducts = await Product.find({ archived: false })
    .sort({ createdAt: 1 })
    .limit(5)
    .select('name salesCount totalSales');

  res.json({
    success: true,
    data: {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      slowMovingProducts
    }
  });
});

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin only)
const getNotifications = asyncHandler(async (req, res, next) => {
  // Mock notifications for now
  const notifications = [
    {
      id: 1,
      type: 'low_stock',
      message: '5 products are running low on stock',
      timestamp: new Date(),
      read: false
    },
    {
      id: 2,
      type: 'out_of_stock',
      message: '2 products are out of stock',
      timestamp: new Date(),
      read: false
    }
  ];

  res.json({
    success: true,
    data: notifications
  });
});

// @desc    Get product reviews
// @route   GET /api/admin/products/reviews
// @access  Private (Admin only)
const getProductReviews = asyncHandler(async (req, res, next) => {
  // Mock reviews for now
  const reviews = [
    {
      _id: 1,
      productName: 'Garden Trowel',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      rating: 5,
      comment: 'Great quality tool!',
      status: 'pending',
      createdAt: new Date()
    },
    {
      _id: 2,
      productName: 'Plant Pot',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      rating: 4,
      comment: 'Good pot, fast delivery',
      status: 'approved',
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: reviews
  });
});

// @desc    Approve or reject review
// @route   PUT /api/admin/products/reviews/:id/:action
// @access  Private (Admin only)
const handleReviewAction = asyncHandler(async (req, res, next) => {
  const { id, action } = req.params;
  
  // Mock implementation
  res.json({
    success: true,
    message: `Review ${action}ed successfully`
  });
});

// @desc    Bulk edit products
// @route   PUT /api/admin/products/bulk-edit
// @access  Private (Admin only)
const bulkEditProducts = asyncHandler(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs are required', 400));
  }

  // Handle price adjustments
  if (updates.priceAdjustment) {
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const product of products) {
      if (updates.priceAdjustmentType === 'percentage') {
        product.regularPrice = product.regularPrice * (1 + updates.priceAdjustment / 100);
      } else {
        product.regularPrice = product.regularPrice + updates.priceAdjustment;
      }
      await product.save();
    }
  }

  // Handle stock adjustments
  if (updates.stockAdjustment) {
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $inc: { stock: updates.stockAdjustment } }
    );
  }

  res.json({
    success: true,
    message: `${productIds.length} products updated successfully`
  });
});

// @desc    Upload CSV file
// @route   POST /api/admin/products/upload-csv
// @access  Private (Admin only)
const uploadCSV = asyncHandler(async (req, res, next) => {
  // Mock implementation
  res.json({
    success: true,
    message: 'CSV uploaded successfully',
    data: { processed: 10 }
  });
});

// @desc    Create discount
// @route   POST /api/admin/products/discounts
// @access  Private (Admin only)
const createDiscount = asyncHandler(async (req, res, next) => {
  // Mock implementation
  res.json({
    success: true,
    message: 'Discount created successfully'
  });
});

// @desc    Send custom email to order customer
// @route   POST /api/admin/orders/:id/send-email
// @access  Private (Admin only)
const sendOrderEmail = asyncHandler(async (req, res, next) => {
  const { content, subject = 'Order Update' } = req.body;
  const orderId = req.params.id;

  if (!content || !content.trim()) {
    return next(new AppError('Email content is required', 400));
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.user || !order.user.email) {
    return next(new AppError('Customer email not found for this order', 400));
  }

  try {
    await sendEmailNotification(
      order.user.email,
      subject,
      content,
      order.user.name || 'Customer'
    );

    res.json({
      success: true,
      message: 'Email sent successfully to customer'
    });
  } catch (error) {
    console.error('Error sending order email:', error);
    return next(new AppError('Failed to send email', 500));
  }
});

// @desc    Send order status update notification
// @route   POST /api/admin/orders/send-notification
// @access  Private (Admin only)
const sendOrderStatusNotification = asyncHandler(async (req, res, next) => {
  const { orderId, type, status } = req.body;

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.user || !order.user.email) {
    return next(new AppError('Customer email not found for this order', 400));
  }

  let subject, message;

  if (type === 'status_update') {
    subject = `Order Status Update - Order #${order.orderNumber}`;
    message = `Hello ${order.user.name || 'Customer'}!

Your order #${order.orderNumber} status has been updated to: ${status.toUpperCase()}

Order Details:
- Order Number: ${order.orderNumber}
- Total Amount: ₹${order.total}
- Items: ${order.items.length} item(s)
- Status: ${status.toUpperCase()}

${status === 'shipped' ? 'Your order is now on its way to you!' : ''}
${status === 'delivered' ? 'Your order has been delivered successfully!' : ''}
${status === 'cancelled' ? 'Your order has been cancelled. If you have any questions, please contact our support team.' : ''}

Thank you for choosing UrbanSprout!`;
  } else {
    subject = `Order Update - Order #${order.orderNumber}`;
    message = `Hello ${order.user.name || 'Customer'}!

This is an update regarding your order #${order.orderNumber}.

Thank you for choosing UrbanSprout!`;
  }

  try {
    await sendEmailNotification(
      order.user.email,
      subject,
      message,
      order.user.name || 'Customer'
    );

    res.json({
      success: true,
      message: 'Status update notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending status notification:', error);
    return next(new AppError('Failed to send notification', 500));
  }
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
  sendOrderEmail,
  sendOrderStatusNotification,
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
  getCategoriesWithProducts,
  createCategory,
  deleteCategory,
  updateCategory,
  bulkUpdateProducts,
  getInventoryStats,
  getNotifications,
  getProductReviews,
  handleReviewAction,
  bulkEditProducts,
  uploadCSV,
  createDiscount
};