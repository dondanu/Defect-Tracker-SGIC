const { User, Designation, UserPrivilege, ProjectUserPrivilege, EmailUser, ProjectAllocation, Role } = require('../models');
const authService = require('../services/authService');
const { Op } = require('sequelize');

class UserController {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, designation_id, is_active } = req.query;
      const offset = (page - 1) * limit;

      console.log('🔍 DEBUG - getAllUsers called with query params:', req.query);

      const whereClause = {};

      if (search) {
        console.log('🔍 DEBUG - Adding search filter:', search);
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (designation_id) {
        console.log('🔍 DEBUG - Adding designation_id filter:', designation_id);
        whereClause.designation_id = designation_id;
      }

      if (is_active !== undefined) {
        console.log('🔍 DEBUG - Adding is_active filter:', is_active);
        whereClause.is_active = is_active === 'true';
      }

      console.log('🔍 DEBUG - Final whereClause:', JSON.stringify(whereClause, null, 2));

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      console.log('🔍 DEBUG - Query result count:', count);
      console.log('🔍 DEBUG - Query result users length:', users.length);
      console.log('🔍 DEBUG - Users found:', users.map(u => ({ id: u.id, email: u.email, designation_id: u.designation_id })));

      const responseData = {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      };

      console.log('🔍 DEBUG - Final response data users count:', responseData.data.users.length);
      console.log('🔍 DEBUG - Final response pagination:', responseData.data.pagination);

      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Designation,
            as: 'designation',
            attributes: ['id', 'name'],
            required: false  // LEFT JOIN to include users without designation
          },
          {
            model: EmailUser,
            as: 'emailPreferences',
            attributes: ['email_type', 'is_enabled'],
            required: false  // LEFT JOIN to include users without email preferences
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new user
  async createUser(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove password from update data if present
      delete updateData.password;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Designation,
            as: 'designation',
            attributes: ['id', 'name'],
            required: false  // LEFT JOIN to include users without designation
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (hard delete - permanently remove the record)
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Attempt hard delete; return a clear message if there are FK references
      try {
        await user.destroy();
      } catch (err) {
        const isFKError = err?.name === 'SequelizeForeignKeyConstraintError' || err?.parent?.code === 'ER_ROW_IS_REFERENCED_2';
        if (isFKError) {
          return res.status(409).json({
            success: false,
            message: 'Cannot delete user because there are related records (projects, allocations, defects, comments, privileges, etc.). Remove or reassign those references first.'
          });
        }
        throw err;
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Change user status (activate/deactivate)
  async changeUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ is_active });

      res.status(200).json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset user password (admin function)
  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      const result = await authService.resetPassword(id, new_password);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // Get user privileges
  async getUserPrivileges(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userPrivileges = await UserPrivilege.findAll({
        where: {
          user_id: id,
          is_active: true
        },
        include: [
          {
            model: require('../models').Privilege,
            as: 'privilege',
            attributes: ['id', 'name', 'module', 'action']
          }
        ]
      });

      const projectPrivileges = await ProjectUserPrivilege.findAll({
        where: {
          user_id: id,
          is_active: true
        },
        include: [
          {
            model: require('../models').Privilege,
            as: 'privilege',
            attributes: ['id', 'name', 'module', 'action']
          },
          {
            model: require('../models').Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      // Get group privileges through role assignments
      const rolePrivileges = await ProjectAllocation.findAll({
        where: {
          user_id: id,
          is_active: true
        },
        include: [
          {
            model: Role,
            as: 'role',
            include: [
              {
                model: require('../models').GroupPrivilege,
                as: 'groupPrivileges',
                where: { is_active: true },
                include: [
                  {
                    model: require('../models').Privilege,
                    as: 'privilege',
                    attributes: ['id', 'name', 'module', 'action']
                  }
                ]
              }
            ]
          },
          {
            model: require('../models').Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'User privileges retrieved successfully',
        data: {
          userPrivileges,
          projectPrivileges,
          rolePrivileges
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user projects
  async getUserProjects(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const projectAllocations = await ProjectAllocation.findAll({
        where: {
          user_id: id,
          is_active: true
        },
        include: [
          {
            model: require('../models').Project,
            as: 'project',
            attributes: ['id', 'name', 'description', 'status', 'start_date', 'end_date']
          },
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'User projects retrieved successfully',
        data: { projectAllocations }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user email preferences
  async getEmailPreferences(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const emailPreferences = await EmailUser.findAll({
        where: { user_id: id }
      });

      res.status(200).json({
        success: true,
        message: 'Email preferences retrieved successfully',
        data: { emailPreferences }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user email preferences
  async updateEmailPreferences(req, res, next) {
    try {
      const { id } = req.params;
      const { preferences } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update or create email preferences
      for (const pref of preferences) {
        await EmailUser.upsert({
          user_id: id,
          email_type: pref.email_type,
          is_enabled: pref.is_enabled
        });
      }

      const updatedPreferences = await EmailUser.findAll({
        where: { user_id: id }
      });

      res.status(200).json({
        success: true,
        message: 'Email preferences updated successfully',
        data: { emailPreferences: updatedPreferences }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();