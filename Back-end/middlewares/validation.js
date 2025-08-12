const { validationResult, body, param } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {})
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('designation_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Designation ID must be a positive integer')
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Project validation rules
const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project name must be between 1-200 characters'),
  body('description')
    .optional()
    .trim(),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'COMPLETED', 'ON_HOLD'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, COMPLETED, ON_HOLD')
];

// Module validation rules
const validateModule = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Module name must be between 1-200 characters'),
  body('description')
    .optional()
    .trim()
];

// Defect validation rules
const validateDefect = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Defect title must be between 1-500 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('defect_status_id')
    .isInt({ min: 1 })
    .withMessage('Defect status ID must be a positive integer'),
  body('type_id')
    .isInt({ min: 1 })
    .withMessage('Defect type ID must be a positive integer'),
  body('priority_id')
    .isInt({ min: 1 })
    .withMessage('Priority ID must be a positive integer'),
  body('severity_id')
    .isInt({ min: 1 })
    .withMessage('Severity ID must be a positive integer'),
  body('modules_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Module ID must be a positive integer'),
  body('sub_module_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sub-module ID must be a positive integer')
];

// Test case validation rules
const validateTestCase = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Test case title must be between 1-500 characters'),
  body('steps')
    .trim()
    .notEmpty()
    .withMessage('Test steps are required'),
  body('expected_result')
    .trim()
    .notEmpty()
    .withMessage('Expected result is required'),
  body('severity_id')
    .isInt({ min: 1 })
    .withMessage('Severity ID must be a positive integer'),
  body('test_type')
    .optional()
    .isIn(['FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION', 'INTEGRATION', 'UNIT', 'UI', 'API', 'PERFORMANCE'])
    .withMessage('Invalid test type'),
  body('automation_status')
    .optional()
    .isIn(['MANUAL', 'AUTOMATED', 'TO_BE_AUTOMATED'])
    .withMessage('Invalid automation status')
];

// Release validation rules
const validateRelease = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Release name must be between 1-200 characters'),
  body('version')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Version must be between 1-50 characters'),
  body('release_type_id')
    .isInt({ min: 1 })
    .withMessage('Release type ID must be a positive integer'),
  body('planned_date')
    .optional()
    .isISO8601()
    .withMessage('Planned date must be a valid date'),
  body('actual_date')
    .optional()
    .isISO8601()
    .withMessage('Actual date must be a valid date'),
  body('status')
    .optional()
    .isIn(['PLANNED', 'IN_PROGRESS', 'TESTING', 'RELEASED', 'CANCELLED'])
    .withMessage('Invalid release status')
];

// Comment validation rules
const validateComment = [
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

const validateProjectId = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

// Password change validation
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// SMTP configuration validation
const validateSMTPConfig = [
  body('host')
    .trim()
    .notEmpty()
    .withMessage('SMTP host is required'),
  body('port')
    .isInt({ min: 1, max: 65535 })
    .withMessage('Port must be between 1-65535'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  body('from_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid from email is required'),
  body('secure')
    .optional()
    .isBoolean()
    .withMessage('Secure must be boolean')
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validateProject,
  validateModule,
  validateDefect,
  validateTestCase,
  validateRelease,
  validateComment,
  validateId,
  validateProjectId,
  validatePasswordChange,
  validateSMTPConfig
};