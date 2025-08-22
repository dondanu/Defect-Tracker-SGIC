const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validateLogin, validateUser, validatePasswordChange, handleValidationErrors } = require('../middlewares/validation');

// Public routes
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/register', validateUser, handleValidationErrors, authController.register);
router.post('/request-password-reset', authController.requestPasswordReset);

// Protected routes
router.use(authenticateToken);
router.get('/profile', authController.getProfile);
router.post('/change-password', validatePasswordChange, handleValidationErrors, authController.changePassword);
router.post('/logout', authController.logout);
router.get('/verify-token', authController.verifyToken);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;