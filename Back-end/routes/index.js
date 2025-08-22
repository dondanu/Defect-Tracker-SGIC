const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const defectRoutes = require('./defects');
const lookupRoutes = require('./lookups');
const configRoutes = require('./config');
const dashboardRoutes = require('./dashboard');
const releaseRoutes = require('./releases');

// Route definitions
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', defectRoutes);
router.use('/', lookupRoutes);
router.use('/config', configRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/releases', releaseRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Defect Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Defect Management System API',
    version: '1.0.0',
    documentation: 'Import the Postman collection for complete API documentation',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      defects: '/api/projects/:projectId/defects',
      lookups: '/api/{roles|privileges|priorities|severities|defect-types|defect-statuses|release-types}',
      config: '/api/config'
    }
  });
});

module.exports = router;