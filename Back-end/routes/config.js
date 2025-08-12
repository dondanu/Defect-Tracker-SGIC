const express = require('express');
const router = express.Router();
const { authenticateToken, checkPrivilege } = require('../middlewares/auth');
const { validateSMTPConfig, handleValidationErrors, validateId } = require('../middlewares/validation');
const { SmtpConfig } = require('../models');
const emailService = require('../services/emailService');

// Apply authentication to all routes
router.use(authenticateToken);

// SMTP Configuration routes
router.get('/smtp', checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const smtpConfigs = await SmtpConfig.findAll({
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'SMTP configurations retrieved successfully',
      data: { smtpConfigs }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/smtp/:id', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const smtpConfig = await SmtpConfig.findByPk(id);

    if (!smtpConfig) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SMTP configuration retrieved successfully',
      data: { smtpConfig }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/smtp', validateSMTPConfig, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { is_default, ...smtpData } = req.body;

    // If this is set as default, unset others
    if (is_default) {
      await SmtpConfig.update(
        { is_default: false },
        { where: { is_default: true } }
      );
    }

    const smtpConfig = await SmtpConfig.create({
      ...smtpData,
      is_default: is_default || false
    });

    res.status(201).json({
      success: true,
      message: 'SMTP configuration created successfully',
      data: { smtpConfig }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/smtp/:id', validateId, validateSMTPConfig, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_default, ...smtpData } = req.body;

    const smtpConfig = await SmtpConfig.findByPk(id);
    if (!smtpConfig) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // If this is set as default, unset others
    if (is_default) {
      await SmtpConfig.update(
        { is_default: false },
        { where: { is_default: true, id: { [require('sequelize').Op.ne]: id } } }
      );
    }

    await smtpConfig.update({
      ...smtpData,
      is_default: is_default !== undefined ? is_default : smtpConfig.is_default
    });

    res.status(200).json({
      success: true,
      message: 'SMTP configuration updated successfully',
      data: { smtpConfig }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/smtp/:id', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const smtpConfig = await SmtpConfig.findByPk(id);

    if (!smtpConfig) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    await smtpConfig.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'SMTP configuration deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Test SMTP configuration
router.post('/smtp/:id/test', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { test_email } = req.body;

    const smtpConfig = await SmtpConfig.findByPk(id);
    if (!smtpConfig) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Test connection
    const testResult = await emailService.testConnection(smtpConfig);
    
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: 'SMTP connection test failed',
        error: testResult.error
      });
    }

    // Send test email if email address provided
    if (test_email) {
      const emailResult = await emailService.sendGeneralNotification(
        test_email,
        'SMTP Configuration Test',
        '<h2>SMTP Test Email</h2><p>This is a test email to verify SMTP configuration is working correctly.</p><p>If you receive this email, the configuration is successful!</p>'
      );

      if (!emailResult.success) {
        return res.status(400).json({
          success: false,
          message: 'SMTP connection successful but failed to send test email',
          error: emailResult.error
        });
      }
    }

    res.status(200).json({
      success: true,
      message: test_email ? 'SMTP test successful. Test email sent!' : 'SMTP connection test successful',
      data: { connectionTest: testResult }
    });
  } catch (error) {
    next(error);
  }
});

// Set default SMTP configuration
router.patch('/smtp/:id/default', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const smtpConfig = await SmtpConfig.findByPk(id);
    if (!smtpConfig) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Unset all other defaults
    await SmtpConfig.update(
      { is_default: false },
      { where: { is_default: true } }
    );

    // Set this one as default
    await smtpConfig.update({ is_default: true });

    res.status(200).json({
      success: true,
      message: 'Default SMTP configuration updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;