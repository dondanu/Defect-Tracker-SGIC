const { Project, Module, SubModule, User, ProjectAllocation, ProjectAllocationHistory, Role } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

class ProjectController {
  // Get all projects
  async getAllProjects(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, user_id } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { is_active: true };
      
      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }

      if (status) {
        whereClause.status = status;
      }

      if (user_id) {
        whereClause.user_id = user_id;
      }

      const { count, rows: projects } = await Project.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Module,
            as: 'modules',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: {
          projects,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get project by ID
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id, {
        where: { is_active: true },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Module,
            as: 'modules',
            where: { is_active: true },
            required: false,
            include: [
              {
                model: SubModule,
                as: 'subModules',
                where: { is_active: true },
                required: false
              }
            ]
          }
        ]
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new project
  async createProject(req, res, next) {
    try {
      const projectData = {
        ...req.body,
        user_id: req.user.id
      };

      const project = await Project.create(projectData);

      const newProject = await Project.findByPk(project.id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project: newProject }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update project
  async updateProject(req, res, next) {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id, {
        where: { is_active: true }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.update(req.body);

      const updatedProject = await Project.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project: updatedProject }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete project
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.update({ is_active: false });

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get project modules
  async getProjectModules(req, res, next) {
    try {
      const { projectId } = req.params;

      const modules = await Module.findAll({
        where: {
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: SubModule,
            as: 'subModules',
            where: { is_active: true },
            required: false
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.status(200).json({
        success: true,
        message: 'Project modules retrieved successfully',
        data: { modules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create project module
  async createProjectModule(req, res, next) {
    try {
      const { projectId } = req.params;

      const moduleData = {
        ...req.body,
        project_id: projectId
      };

      const module = await Module.create(moduleData);

      res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: { module }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update project module
  async updateProjectModule(req, res, next) {
    try {
      const { projectId, moduleId } = req.params;

      const module = await Module.findOne({
        where: {
          id: moduleId,
          project_id: projectId,
          is_active: true
        }
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      await module.update(req.body);

      res.status(200).json({
        success: true,
        message: 'Module updated successfully',
        data: { module }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete project module
  async deleteProjectModule(req, res, next) {
    try {
      const { projectId, moduleId } = req.params;

      const module = await Module.findOne({
        where: {
          id: moduleId,
          project_id: projectId
        }
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      await module.update({ is_active: false });

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get project allocations
  async getProjectAllocations(req, res, next) {
    try {
      const { projectId } = req.params;

      const allocations = await ProjectAllocation.findAll({
        where: {
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Project allocations retrieved successfully',
        data: { allocations }
      });
    } catch (error) {
      next(error);
    }
  }

  // Allocate user to project
  async allocateUserToProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const { user_id, role_id, start_date, end_date, allocation_percentage, notes } = req.body;

      // Check if allocation already exists
      const existingAllocation = await ProjectAllocation.findOne({
        where: {
          project_id: projectId,
          user_id: user_id,
          is_active: true
        }
      });

      if (existingAllocation) {
        return res.status(409).json({
          success: false,
          message: 'User is already allocated to this project'
        });
      }

      const allocation = await ProjectAllocation.create({
        project_id: projectId,
        user_id,
        role_id,
        start_date: start_date || new Date(),
        end_date,
        allocation_percentage: allocation_percentage || 100,
        notes
      });

      // Create allocation history record
      await ProjectAllocationHistory.create({
        allocation_id: allocation.id,
        project_id: projectId,
        user_id,
        role_id,
        action: 'ALLOCATED',
        new_value: `${allocation_percentage}%`,
        changed_by: req.user.id,
        notes
      });

      // Get complete allocation data
      const newAllocation = await ProjectAllocation.findByPk(allocation.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      // Send email notification
      if (newAllocation.user.email) {
        await emailService.sendProjectAssignmentNotification(
          newAllocation.project,
          newAllocation.user,
          newAllocation.role,
          req.user
        );
      }

      res.status(201).json({
        success: true,
        message: 'User allocated to project successfully',
        data: { allocation: newAllocation }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update project allocation
  async updateProjectAllocation(req, res, next) {
    try {
      const { projectId, allocationId } = req.params;
      const { role_id, end_date, allocation_percentage, notes } = req.body;

      const allocation = await ProjectAllocation.findOne({
        where: {
          id: allocationId,
          project_id: projectId
        }
      });

      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Allocation not found'
        });
      }

      const oldValues = {
        role_id: allocation.role_id,
        allocation_percentage: allocation.allocation_percentage
      };

      await allocation.update({ role_id, end_date, allocation_percentage, notes });

      // Create history records for changes
      if (role_id && role_id !== oldValues.role_id) {
        await ProjectAllocationHistory.create({
          allocation_id: allocation.id,
          project_id: projectId,
          user_id: allocation.user_id,
          role_id: role_id,
          action: 'ROLE_CHANGED',
          old_value: oldValues.role_id?.toString(),
          new_value: role_id.toString(),
          changed_by: req.user.id,
          notes: 'Role updated'
        });
      }

      if (allocation_percentage && allocation_percentage !== oldValues.allocation_percentage) {
        await ProjectAllocationHistory.create({
          allocation_id: allocation.id,
          project_id: projectId,
          user_id: allocation.user_id,
          role_id: allocation.role_id,
          action: 'PERCENTAGE_CHANGED',
          old_value: oldValues.allocation_percentage?.toString(),
          new_value: allocation_percentage.toString(),
          changed_by: req.user.id,
          notes: 'Allocation percentage updated'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project allocation updated successfully',
        data: { allocation }
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove user from project
  async deallocateUser(req, res, next) {
    try {
      const { projectId, allocationId } = req.params;

      const allocation = await ProjectAllocation.findOne({
        where: {
          id: allocationId,
          project_id: projectId
        }
      });

      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Allocation not found'
        });
      }

      await allocation.update({ is_active: false, end_date: new Date() });

      // Create history record
      await ProjectAllocationHistory.create({
        allocation_id: allocation.id,
        project_id: projectId,
        user_id: allocation.user_id,
        role_id: allocation.role_id,
        action: 'DEALLOCATED',
        changed_by: req.user.id,
        notes: 'User removed from project'
      });

      res.status(200).json({
        success: true,
        message: 'User removed from project successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get project allocation history
  async getAllocationHistory(req, res, next) {
    try {
      const { projectId } = req.params;

      const history = await ProjectAllocationHistory.findAll({
        where: { project_id: projectId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'changedBy',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Allocation history retrieved successfully',
        data: { history }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();