const express = require('express');
const router = express.Router();
const defectController = require('../controllers/defectController');
const { authenticateToken, checkPrivilege, checkProjectAccess } = require('../middlewares/auth');
const { validateDefect, validateComment, validateId, validateProjectId, handleValidationErrors, validateDefectSimpleCreate, validateDefectSimpleUpdate } = require('../middlewares/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Defect routes for projects
router.get('/:projectId/defects', validateProjectId, handleValidationErrors, checkProjectAccess, defectController.getProjectDefects);
router.post('/:projectId/defects', validateProjectId, validateDefectSimpleCreate, handleValidationErrors, checkProjectAccess, defectController.createDefect);
router.get('/:projectId/defects/:id', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.getDefectById);
router.put('/:projectId/defects/:id', validateProjectId, validateId, validateDefectSimpleUpdate, handleValidationErrors, checkProjectAccess, defectController.updateDefect);
router.delete('/:projectId/defects/:id', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.deleteDefect);

// Defect status and assignment
router.patch('/:projectId/defects/:id/status', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.updateDefectStatus);
router.patch('/:projectId/defects/:id/assign', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.assignDefect);

// Defect history and comments
router.get('/:projectId/defects/:id/history', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.getDefectHistory);
router.get('/:projectId/defects/:id/comments', validateProjectId, validateId, handleValidationErrors, checkProjectAccess, defectController.getDefectComments);
router.post('/:projectId/defects/:id/comments', validateProjectId, validateId, validateComment, handleValidationErrors, checkProjectAccess, defectController.addDefectComment);

module.exports = router;