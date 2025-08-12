const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkPrivilege } = require('../middlewares/auth');
const { validateUser, validateId, validatePasswordChange, handleValidationErrors } = require('../middlewares/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// User management routes
router.get('/', (req, res, next) => {
  console.log('🔍 ROUTE DEBUG - GET /api/users hit');
  console.log('🔍 ROUTE DEBUG - Query params:', req.query);
  console.log('🔍 ROUTE DEBUG - User:', req.user ? req.user.id : 'No user');
  next();
}, checkPrivilege('users', 'READ'), userController.getAllUsers);
router.get('/:id', validateId, handleValidationErrors, checkPrivilege('users', 'READ'), userController.getUserById);
router.post('/', validateUser, handleValidationErrors, checkPrivilege('users', 'CREATE'), userController.createUser);
router.put('/:id', validateId, validateUser, handleValidationErrors, checkPrivilege('users', 'UPDATE'), userController.updateUser);
router.delete('/:id', validateId, handleValidationErrors, checkPrivilege('users', 'DELETE'), userController.deleteUser);

// User status management
router.patch('/:id/status', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), userController.changeUserStatus);
router.patch('/:id/password', validateId, validatePasswordChange, handleValidationErrors, checkPrivilege('users', 'MANAGE'), userController.resetUserPassword);

// User privileges and projects
router.get('/:id/privileges', validateId, handleValidationErrors, checkPrivilege('users', 'READ'), userController.getUserPrivileges);
router.get('/:id/projects', validateId, handleValidationErrors, checkPrivilege('users', 'READ'), userController.getUserProjects);

// Email preferences
router.get('/:id/email-preferences', validateId, handleValidationErrors, checkPrivilege('users', 'READ'), userController.getEmailPreferences);
router.put('/:id/email-preferences', validateId, handleValidationErrors, checkPrivilege('users', 'UPDATE'), userController.updateEmailPreferences);

module.exports = router;