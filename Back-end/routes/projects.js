const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const moduleController = require('../controllers/moduleController');
const { authenticateToken, checkPrivilege, checkProjectAccess } = require('../middlewares/auth');
const { validateProject, validateModule, validateId, validateProjectId, handleValidationErrors } = require('../middlewares/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Project routes
router.get('/', projectController.getAllProjects);
router.post('/', validateProject, handleValidationErrors, projectController.createProject);

// Project-specific routes (require project access)
router.get('/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.getProjectById);
router.put('/:projectId', validateProjectId, validateProject, handleValidationErrors, checkProjectAccess, checkPrivilege('projects', 'UPDATE', true), projectController.updateProject);
router.delete('/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, checkPrivilege('projects', 'DELETE', true), projectController.deleteProject);

// Module routes
router.get('/:projectId/modules', validateProjectId, handleValidationErrors, checkProjectAccess, moduleController.getModules);
router.post('/:projectId/modules', validateProjectId, validateModule, handleValidationErrors, checkProjectAccess, moduleController.createModule);
router.get('/:projectId/modules/:id', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, moduleController.getModuleById);
router.put('/:projectId/modules/:id', validateProjectId, validateId, validateModule, handleValidationErrors, checkProjectAccess, checkPrivilege('projects', 'UPDATE', true), moduleController.updateModule);
router.delete('/:projectId/modules/:id', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, moduleController.deleteModule);

// Submodule routes
router.get('/:projectId/modules/:moduleId/submodules', validateProjectId, handleValidationErrors, checkProjectAccess, moduleController.getSubModules);
router.post('/:projectId/modules/:moduleId/submodules', validateProjectId, validateModule, handleValidationErrors, checkProjectAccess, moduleController.createSubModule);
router.put('/:projectId/modules/:moduleId/submodules/:subModuleId', validateProjectId, validateModule, handleValidationErrors, checkProjectAccess, moduleController.updateSubModule);
router.delete('/:projectId/modules/:moduleId/submodules/:subModuleId', validateProjectId, validateModule, handleValidationErrors, checkProjectAccess, moduleController.deleteSubModule);

// Project allocation routes
router.get('/:projectId/allocations', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.getProjectAllocations);
router.post('/:projectId/allocations', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.allocateUserToProject);
router.put('/:projectId/allocations/:allocationId', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.updateProjectAllocation);
router.delete('/:projectId/allocations/:allocationId', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.deallocateUser);
router.get('/:projectId/allocation-history', validateProjectId, handleValidationErrors, checkProjectAccess, projectController.getAllocationHistory);

module.exports = router;