const jwt = require('jsonwebtoken');
const { User, UserPrivilege, ProjectUserPrivilege, GroupPrivilege, Privilege, Role } = require('../models');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 AUTH DEBUG - authenticateToken called for:', req.method, req.path);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('🔍 AUTH DEBUG - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          association: 'designation',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'first_name', 'last_name', 'email', 'is_active']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Authorization middleware for checking privileges
const checkPrivilege = (module, action, projectSpecific = false) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const projectId = projectSpecific ? req.params.projectId : null;

      // Check user-specific privileges
      let hasPrivilege = await UserPrivilege.findOne({
        where: {
          user_id: userId,
          is_active: true,
          ...(projectId && { project_id: projectId })
        },
        include: [{
          model: Privilege,
          as: 'privilege',
          where: {
            module: module,
            action: action,
            is_active: true
          }
        }]
      });

      if (hasPrivilege) {
        return next();
      }

      // Check project-specific privileges
      if (projectId) {
        hasPrivilege = await ProjectUserPrivilege.findOne({
          where: {
            user_id: userId,
            project_id: projectId,
            is_active: true
          },
          include: [{
            model: Privilege,
            as: 'privilege',
            where: {
              module: module,
              action: action,
              is_active: true
            }
          }]
        });

        if (hasPrivilege) {
          return next();
        }
      }

      // Check group privileges through role assignments
      const { ProjectAllocation, GroupPrivilege } = require('../models');

      // First, get the user's project allocation
      const allocation = await ProjectAllocation.findOne({
        where: {
          user_id: userId,
          is_active: true,
          ...(projectId && { project_id: projectId })
        },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (allocation && allocation.role) {
        // Then check if the role has the required privilege
        const groupPrivilege = await GroupPrivilege.findOne({
          where: {
            role_id: allocation.role.id,
            is_active: true
          },
          include: [{
            model: Privilege,
            as: 'privilege',
            where: {
              module: module,
              action: action,
              is_active: true
            }
          }]
        });

        if (groupPrivilege) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to access this resource'
      });
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Check if user is project owner or has admin privileges
const checkProjectAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId || req.body.project_id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const { Project, ProjectAllocation } = require('../models');

    // Check if user is project owner
    const project = await Project.findOne({
      where: {
        id: projectId,
        user_id: userId,
        is_active: true
      }
    });

    if (project) {
      return next();
    }

    // Check if user is allocated to the project
    const allocation = await ProjectAllocation.findOne({
      where: {
        user_id: userId,
        project_id: projectId,
        is_active: true
      }
    });

    if (allocation) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not associated with this project.'
    });
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Project access check failed'
    });
  }
};

module.exports = {
  authenticateToken,
  checkPrivilege,
  checkProjectAccess
};