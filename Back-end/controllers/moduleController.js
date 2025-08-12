const { Module, SubModule, Project } = require('../models');
const { Op } = require('sequelize');

class ModuleController {
  // Get all modules for a project
  async getModules(req, res, next) {
    try {
      const { projectId } = req.params;
      const { search, is_active } = req.query;

      const whereClause = { project_id: projectId };

      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      } else {
        whereClause.is_active = true;
      }

      const modules = await Module.findAll({
        where: whereClause,
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
        message: 'Modules retrieved successfully',
        data: { modules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get module by ID
  async getModuleById(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const module = await Module.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: SubModule,
            as: 'subModules',
            where: { is_active: true },
            required: false
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Module retrieved successfully',
        data: { module }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new module
  async createModule(req, res, next) {
    try {
      const { projectId } = req.params;

      const moduleData = {
        ...req.body,
        project_id: projectId
      };

      const module = await Module.create(moduleData);

      const newModule = await Module.findByPk(module.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: { module: newModule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update module
  async updateModule(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const module = await Module.findOne({
        where: {
          id: id,
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

      const updatedModule = await Module.findByPk(id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Module updated successfully',
        data: { module: updatedModule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete module
  async deleteModule(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const module = await Module.findOne({
        where: {
          id: id,
          project_id: projectId
        }
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Soft delete module and its submodules
      await module.update({ is_active: false });
      
      await SubModule.update(
        { is_active: false },
        { where: { modules_id: id } }
      );

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get submodules for a module
  async getSubModules(req, res, next) {
    try {
      const { projectId, moduleId } = req.params;
      const { search, is_active } = req.query;

      const whereClause = { modules_id: moduleId };

      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      } else {
        whereClause.is_active = true;
      }

      const subModules = await SubModule.findAll({
        where: whereClause,
        include: [
          {
            model: Module,
            as: 'module',
            where: { project_id: projectId },
            attributes: ['id', 'name', 'project_id']
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.status(200).json({
        success: true,
        message: 'Sub-modules retrieved successfully',
        data: { subModules }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new submodule
  async createSubModule(req, res, next) {
    try {
      const { moduleId } = req.params;

      const subModuleData = {
        ...req.body,
        modules_id: moduleId
      };

      const subModule = await SubModule.create(subModuleData);

      const newSubModule = await SubModule.findByPk(subModule.id, {
        include: [
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'name', 'project_id']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Sub-module created successfully',
        data: { subModule: newSubModule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update submodule
  async updateSubModule(req, res, next) {
    try {
      const { moduleId, subModuleId } = req.params;

      const subModule = await SubModule.findOne({
        where: {
          id: subModuleId,
          modules_id: moduleId,
          is_active: true
        }
      });

      if (!subModule) {
        return res.status(404).json({
          success: false,
          message: 'Sub-module not found'
        });
      }

      await subModule.update(req.body);

      const updatedSubModule = await SubModule.findByPk(subModuleId, {
        include: [
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'name', 'project_id']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Sub-module updated successfully',
        data: { subModule: updatedSubModule }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete submodule
  async deleteSubModule(req, res, next) {
    try {
      const { moduleId, subModuleId } = req.params;

      const subModule = await SubModule.findOne({
        where: {
          id: subModuleId,
          modules_id: moduleId
        }
      });

      if (!subModule) {
        return res.status(404).json({
          success: false,
          message: 'Sub-module not found'
        });
      }

      await subModule.update({ is_active: false });

      res.status(200).json({
        success: true,
        message: 'Sub-module deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModuleController();