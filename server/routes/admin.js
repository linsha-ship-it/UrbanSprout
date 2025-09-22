const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');
const { 
  validateObjectId, 
  validatePagination, 
  validatePlant,
  validateBlogPost 
} = require('../middlewares/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', validatePagination, getAllUsers);
router.get('/users/:id/details', validateObjectId, getUserDetails);
router.put('/users/:id/role', validateObjectId, updateUserRole);
router.put('/users/:id/block', validateObjectId, blockUser);
router.put('/users/:id/suspend', validateObjectId, suspendUser);
router.post('/users/:id/reset-password', validateObjectId, resetUserPassword);
router.post('/users/:id/send-email', validateObjectId, sendUserEmail);
router.put('/users/:id/notes', validateObjectId, updateUserNotes);
router.put('/users/:id/flag', validateObjectId, flagUser);
router.delete('/users/:id', validateObjectId, deleteUser);
router.post('/users/bulk', bulkUserOperations);

// Plant management
router.post('/plants', validatePlant, createPlant);
router.put('/plants/:id', validateObjectId, updatePlant);
router.delete('/plants/:id', validateObjectId, deletePlant);

// Order management
router.get('/orders', validatePagination, getAllOrders);
router.put('/orders/:id/status', validateObjectId, updateOrderStatus);

// Blog management
router.get('/blog', validatePagination, getAllBlogPosts);
router.put('/blog/:id/approve', validateObjectId, approveBlogPost);
router.put('/blog/:id/reject', validateObjectId, rejectBlogPost);
router.delete('/blog/:id', validateObjectId, deleteBlogPost);
router.put('/blog/:id/comments/:commentId/approve', validateObjectId, toggleCommentApproval);

// Product management
router.get('/products', validatePagination, getAllProducts);
router.get('/products/categories', getProductCategories);
router.get('/products/:id', validateObjectId, getProduct);
router.post('/products', createProduct);
router.put('/products/:id', validateObjectId, updateProduct);
router.put('/products/:id/archive', validateObjectId, archiveProduct);
router.put('/products/:id/restore', validateObjectId, restoreProduct);
router.delete('/products/:id', validateObjectId, deleteProduct);
router.put('/products/bulk', bulkUpdateProducts);

module.exports = router;