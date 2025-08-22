const authService = require('../services/authService');
const emailService = require('../services/emailService');

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password, req);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      const result = await authService.changePassword(userId, current_password, new_password);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side token invalidation)
  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message: 'Logged out successfully. Please remove the token from client storage.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify token (for client-side token validation)
  async verifyToken(req, res, next) {
    try {
      // Token is already verified by the authenticateToken middleware
      // If we reach here, the token is valid
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token (generate new token with same payload)
  async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;
      const newToken = authService.generateToken(userId);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newToken }
      });
    } catch (error) {
      next(error);
    }
  }

  // Send password reset email (placeholder implementation)
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link
      
      const result = await emailService.sendGeneralNotification(
        email,
        'Password Reset Request',
        `
          <p>You have requested a password reset for your account.</p>
          <p>Please contact your system administrator to reset your password.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        `
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset instructions have been sent to your email'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();