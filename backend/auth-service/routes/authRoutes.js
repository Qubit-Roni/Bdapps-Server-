const express = require('express');
const { register, login, getMe, getUsers, approveUser, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Admin only routes
router.get('/users', protect, authorize('admin', 'super_admin'), getUsers);
router.put('/approve/:id', protect, authorize('admin', 'super_admin'), approveUser);

module.exports = router;
