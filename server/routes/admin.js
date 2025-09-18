const express = require('express');
const {
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
router.put('/users/:id/role', validateObjectId, updateUserRole);
router.delete('/users/:id', validateObjectId, deleteUser);

// Plant management
router.post('/plants', validatePlant, createPlant);
router.put('/plants/:id', validateObjectId, updatePlant);
router.delete('/plants/:id', validateObjectId, deletePlant);

// Order management
router.get('/orders', validatePagination, getAllOrders);
router.put('/orders/:id/status', validateObjectId, updateOrderStatus);

// Blog management
router.get('/blog', validatePagination, getAllBlogPosts);
router.put('/blog/:id/comments/:commentId/approve', validateObjectId, toggleCommentApproval);

module.exports = router;