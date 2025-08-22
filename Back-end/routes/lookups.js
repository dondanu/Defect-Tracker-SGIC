const express = require('express');
const router = express.Router();
const { authenticateToken, checkPrivilege } = require('../middlewares/auth');
const { handleValidationErrors, validateId } = require('../middlewares/validation');
const { 
  Role, 
  Privilege, 
  Priority, 
  Severity, 
  DefectType, 
  DefectStatus, 
  ReleaseType, 
  Designation,
  UserPrivilege,
  ProjectUserPrivilege,
  GroupPrivilege
} = require('../models');

// Apply authentication to all routes
router.use(authenticateToken);

// Generic CRUD operations for lookup tables
const createLookupRoutes = (model, name, privilege) => {
  // Get all
  router.get(`/${name}`, async (req, res, next) => {
    try {
      const { is_active, search } = req.query;
      const whereClause = {};
      
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }
      
      if (search) {
        whereClause.name = { [require('sequelize').Op.like]: `%${search}%` };
      }

      const items = await model.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
      });

      res.status(200).json({
        success: true,
        message: `${name} retrieved successfully`,
        data: { [name]: items }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get by ID
  router.get(`/${name}/:id`, validateId, handleValidationErrors, async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await model.findByPk(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${name.slice(0, -1)} not found`
        });
      }

      res.status(200).json({
        success: true,
        message: `${name.slice(0, -1)} retrieved successfully`,
        data: { [name.slice(0, -1)]: item }
      });
    } catch (error) {
      next(error);
    }
  });

  // Create
  router.post(`/${name}`, async (req, res, next) => {
    try {
      const item = await model.create(req.body);

      res.status(201).json({
        success: true,
        message: `${name.slice(0, -1)} created successfully`,
        data: { [name.slice(0, -1)]: item }
      });
    } catch (error) {
      next(error);
    }
  });

  // Update
  router.put(`/${name}/:id`, validateId, handleValidationErrors, async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await model.findByPk(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${name.slice(0, -1)} not found`
        });
      }

      await item.update(req.body);

      res.status(200).json({
        success: true,
        message: `${name.slice(0, -1)} updated successfully`,
        data: { [name.slice(0, -1)]: item }
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete (hard delete - permanently remove from database)
  router.delete(`/${name}/:id`, validateId, handleValidationErrors, async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await model.findByPk(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${name.slice(0, -1)} not found`
        });
      }

      await item.destroy();

      res.status(200).json({
        success: true,
        message: `${name.slice(0, -1)} permanently deleted from database`
      });
    } catch (error) {
      next(error);
    }
  });
};

// Create routes for all lookup tables
createLookupRoutes(Role, 'roles', 'users');
createLookupRoutes(Privilege, 'privileges', 'users');
createLookupRoutes(Priority, 'priorities', 'defects');
createLookupRoutes(Severity, 'severities', 'defects');
createLookupRoutes(DefectType, 'defect-types', 'defects');
createLookupRoutes(DefectStatus, 'defect-statuses', 'defects');
// Backward-compat alias for old client expecting /defectStatus
router.get('/defectStatus', async (req, res, next) => {
  try {
    const items = await DefectStatus.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.status(200).json({ success: true, message: 'defectStatus retrieved successfully', data: items });
  } catch (error) { next(error); }
});
createLookupRoutes(ReleaseType, 'release-types', 'releases');
createLookupRoutes(Designation, 'designations', 'users');

// Privilege assignment routes
router.get('/user-privileges', checkPrivilege('users', 'READ'), async (req, res, next) => {
  try {
    const { user_id, project_id } = req.query;
    const whereClause = { is_active: true };
    
    if (user_id) whereClause.user_id = user_id;
    if (project_id) whereClause.project_id = project_id;

    const userPrivileges = await UserPrivilege.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        },
        {
          model: require('../models').Project,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'User privileges retrieved successfully',
      data: { userPrivileges }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/user-privileges', checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { user_id, privilege_id, project_id, expires_at } = req.body;

    const userPrivilege = await UserPrivilege.create({
      user_id,
      privilege_id,
      project_id,
      granted_by: req.user.id,
      expires_at
    });

    const newUserPrivilege = await UserPrivilege.findByPk(userPrivilege.id, {
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'User privilege assigned successfully',
      data: { userPrivilege: newUserPrivilege }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/user-privileges/:id', validateId, handleValidationErrors, checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userPrivilege = await UserPrivilege.findByPk(id);

    if (!userPrivilege) {
      return res.status(404).json({
        success: false,
        message: 'User privilege not found'
      });
    }

    await userPrivilege.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'User privilege removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Project-specific privilege routes
router.get('/project-user-privileges', checkPrivilege('users', 'READ'), async (req, res, next) => {
  try {
    const { user_id, project_id } = req.query;
    const whereClause = { is_active: true };
    
    if (user_id) whereClause.user_id = user_id;
    if (project_id) whereClause.project_id = project_id;

    const projectPrivileges = await ProjectUserPrivilege.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: require('../models').Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Project user privileges retrieved successfully',
      data: { projectPrivileges }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/project-user-privileges', checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { user_id, project_id, privilege_id } = req.body;

    const projectPrivilege = await ProjectUserPrivilege.create({
      user_id,
      project_id,
      privilege_id,
      granted_by: req.user.id
    });

    const newProjectPrivilege = await ProjectUserPrivilege.findByPk(projectPrivilege.id, {
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: require('../models').Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Project user privilege assigned successfully',
      data: { projectPrivilege: newProjectPrivilege }
    });
  } catch (error) {
    next(error);
  }
});

// Group privilege routes
router.get('/group-privileges', checkPrivilege('users', 'READ'), async (req, res, next) => {
  try {
    const { role_id } = req.query;
    const whereClause = { is_active: true };
    
    if (role_id) whereClause.role_id = role_id;

    const groupPrivileges = await GroupPrivilege.findAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Group privileges retrieved successfully',
      data: { groupPrivileges }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/group-privileges', checkPrivilege('users', 'MANAGE'), async (req, res, next) => {
  try {
    const { role_id, privilege_id } = req.body;

    const groupPrivilege = await GroupPrivilege.create({
      role_id,
      privilege_id
    });

    const newGroupPrivilege = await GroupPrivilege.findByPk(groupPrivilege.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        },
        {
          model: Privilege,
          as: 'privilege',
          attributes: ['id', 'name', 'module', 'action']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Group privilege assigned successfully',
      data: { groupPrivilege: newGroupPrivilege }
    });
  } catch (error) {
    next(error);
  }
});

// Simple privilege assignment for testing (remove in production)
router.post('/assign-test-privilege', async (req, res, next) => {
  try {
    const { user_id, project_id } = req.body;
    
    // Find the projects.CREATE privilege
    const createPrivilege = await Privilege.findOne({
      where: { module: 'projects', action: 'CREATE', is_active: true }
    });

    if (!createPrivilege) {
      return res.status(404).json({
        success: false,
        message: 'projects.CREATE privilege not found'
      });
    }

    // Assign the privilege to the user for the project
    const userPrivilege = await ProjectUserPrivilege.create({
      user_id: user_id || 1,
      project_id: project_id || 2,
      privilege_id: createPrivilege.id,
      granted_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Test privilege assigned successfully',
      data: { userPrivilege }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;