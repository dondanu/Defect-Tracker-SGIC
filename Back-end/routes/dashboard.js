const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, checkProjectAccess } = require('../middlewares/auth');
const { validateProjectId, handleValidationErrors } = require('../middlewares/validation');

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/defect_severity_summary/:projectId
router.get('/defect_severity_summary/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getDefectSeveritySummary);

// GET /api/dashboard/dsi/:projectId
router.get('/dsi/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getDSI);

// GET /api/dashboard/defect-type/:projectId
router.get('/defect-type/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getDefectTypes);

// GET /api/dashboard/defect-remark-ratio
router.get('/defect-remark-ratio', dashboardController.getDefectRemarkRatio);

// GET /api/dashboard/module
router.get('/module', dashboardController.getDefectsByModule);

// GET /api/dashboard/reopen-count_summary/:projectId
router.get('/reopen-count_summary/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getReopenCountSummary);

// GET /api/dashboard/defect-density/:projectId
router.get('/defect-density/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getDefectDensity);

// GET /api/dashboard/project-card-color/:projectId
router.get('/project-card-color/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, dashboardController.getProjectCardColor);

module.exports = router;

