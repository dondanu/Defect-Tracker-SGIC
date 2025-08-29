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

  // Send password reset email with new password
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      console.log(`📧 Password reset request received for email: ${email}`);
      
      // First, reset the password in database and get new password
      const resetResult = await authService.resetPasswordByEmail(email);
      
      if (!resetResult.success) {
        console.log(`❌ Password reset failed: ${resetResult.message}`);
        return res.status(400).json(resetResult);
      }

      console.log(`✅ Password reset successful for user: ${resetResult.data.username}`);

      // Send email with new password using dedicated method
      const emailResult = await emailService.sendPasswordResetEmail(
        email,
        resetResult.data.username,
        resetResult.data.newPassword,
        resetResult.data.first_name
      );
      
      if (emailResult.success) {
        console.log(`📨 Password reset email sent successfully to: ${email}`);
        res.status(200).json({
          success: true,
          message: 'Password reset successfully. New password has been sent to your email.',
          data: {
            email: email,
            message: 'Check your email for the new password'
          }
        });
      } else {
        // Password was reset in database but email failed
        // We should probably revert the password change or notify admin
        console.error('❌ Password reset email failed:', emailResult);
        res.status(500).json({
          success: false,
          message: 'Password was reset but failed to send email. Please contact administrator.',
          error: 'Email delivery failed'
        });
      }
    } catch (error) {
      console.error('❌ Password reset controller error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();