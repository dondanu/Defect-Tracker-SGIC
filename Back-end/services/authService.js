const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Designation } = require('../models');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate unique username (US0001, US0002, etc.)
  async generateUsername() {
    try {
      const lastUser = await User.findOne({
        order: [['id', 'DESC']]
      });
      
      const nextId = (lastUser ? lastUser.id : 0) + 1;
      return `US${String(nextId).padStart(4, '0')}`;
    } catch (error) {
      console.error('Username generation error:', error);
      // Fallback to timestamp-based username
      const timestamp = Date.now();
      return `US${timestamp}`;
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Generate unique username
      const username = await this.generateUsername();

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user with username
      const user = await User.create({
        ...userData,
        username: username,
        password: hashedPassword,
        is_active: true
      });

      // Generate token
      const token = this.generateToken(user.id);

      // Get user data without password
      const userResponse = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Designation,
            as: 'designation',
            attributes: ['id', 'name'],
            required: false  // LEFT JOIN to include users without designation
          }
        ]
      });

      // Send welcome email with credentials (optional)
      try {
        const emailService = require('../services/emailService');
        await emailService.sendWelcomeEmail(user.email, username, userData.password, user.first_name);
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        console.log('Registration successful but email not sent. User can still login with username and password.');
        // Don't fail registration if email fails
      }

      return {
        success: true,
        message: 'User registered successfully. Check your email for login credentials.',
        data: {
          user: userResponse,
          token: token
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: error.message
      };
    }
  }

  // Login user
  async login(username, password, req) {
    try {
      // Find user by username
      const user = await User.findOne({
        where: { username: username },
        include: [
          {
            model: Designation,
            as: 'designation',
            attributes: ['id', 'name'],
            required: false  // LEFT JOIN to include users without designation
          }
        ]
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Your account has been deactivated. Please contact administrator.'
        };
      }

      // Check password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Send login notification email
      try {
        const emailService = require('../services/emailService');
        const loginTime = new Date().toLocaleString();
        const ipAddress = req?.realIP || req?.ip || req?.connection?.remoteAddress || 'Unknown';
        const userAgent = req?.headers?.['user-agent'] || 'Unknown';
        
        await emailService.sendLoginNotification(
          user.email, 
          user.username, 
          user.first_name, 
          loginTime, 
          ipAddress, 
          userAgent
        );
        console.log(`Login notification sent to ${user.email}`);
      } catch (emailError) {
        console.error('Login notification email failed:', emailError);
        // Don't fail login if email fails
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Return user data without password
      const { password: userPassword, ...userResponse } = user.toJSON();

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token: token
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: error.message
      };
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await user.update({ password: hashedNewPassword });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
        error: error.message
      };
    }
  }

  // Reset password (for admin)
  async resetPassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await user.update({ password: hashedPassword });

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password',
        error: error.message
      };
    }
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        success: true,
        userId: decoded.userId
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }
  }

  // Get user by token
  async getUserByToken(token) {
    try {
      const verification = this.verifyToken(token);
      if (!verification.success) {
        return verification;
      }

      const user = await User.findByPk(verification.userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Designation,
            as: 'designation',
            attributes: ['id', 'name'],
            required: false  // LEFT JOIN to include users without designation
          }
        ]
      });

      if (!user || !user.is_active) {
        return {
          success: false,
          message: 'User not found or inactive'
        };
      }

      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      console.error('Get user by token error:', error);
      return {
        success: false,
        message: 'Failed to get user information',
        error: error.message
      };
    }
  }
}

module.exports = new AuthService();