const express = require('express');
const router = express.Router();
const { authenticateToken, checkProjectAccess } = require('../middlewares/auth');
const { validateProjectId, handleValidationErrors } = require('../middlewares/validation');
const { Release, ReleaseType } = require('../models');

router.use(authenticateToken);

// GET /api/releases/project/:projectId
router.get('/project/:projectId', validateProjectId, handleValidationErrors, checkProjectAccess, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const releases = await Release.findAll({
      where: { project_id: projectId, is_active: true },
      include: [{ model: ReleaseType, as: 'releaseType', attributes: ['id', 'name'] }],
      order: [['planned_date', 'DESC']]
    });
    res.status(200).json({ success: true, message: 'Project releases retrieved successfully', data: { releases } });
  } catch (error) { next(error); }
});

module.exports = router;

