const { 
  Defect, 
  DefectStatus, 
  DefectType, 
  Priority, 
  Severity, 
  User, 
  Project, 
  Module, 
  SubModule, 
  DefectHistory,
  Comment,
  ReleaseTestCase
} = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

class DefectController {
  // Get all defects for a project
  async getProjectDefects(req, res, next) {
    try {
      const { projectId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status_id, 
        priority_id, 
        severity_id, 
        type_id,
        assigned_to,
        assigned_by 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = { project_id: projectId, is_active: true };

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status_id) whereClause.defect_status_id = status_id;
      if (priority_id) whereClause.priority_id = priority_id;
      if (severity_id) whereClause.severity_id = severity_id;
      if (type_id) whereClause.type_id = type_id;
      if (assigned_to) whereClause.assigned_to = assigned_to;
      if (assigned_by) whereClause.assigned_by = assigned_by;

      const { count, rows: defects } = await Defect.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus',
            attributes: ['id', 'name', 'color_code']
          },
          {
            model: DefectType,
            as: 'defectType',
            attributes: ['id', 'name']
          },
          {
            model: Priority,
            as: 'priority',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: Severity,
            as: 'severity',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: User,
            as: 'assigner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'name']
          },
          {
            model: SubModule,
            as: 'subModule',
            attributes: ['id', 'name']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Defects retrieved successfully',
        data: {
          defects,
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

  // Get defect by ID
  async getDefectById(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus',
            attributes: ['id', 'name', 'color_code', 'is_closed_status']
          },
          {
            model: DefectType,
            as: 'defectType',
            attributes: ['id', 'name']
          },
          {
            model: Priority,
            as: 'priority',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: Severity,
            as: 'severity',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: User,
            as: 'assigner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          },
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'name']
          },
          {
            model: SubModule,
            as: 'subModule',
            attributes: ['id', 'name']
          },
          {
            model: ReleaseTestCase,
            as: 'releaseTestCase',
            attributes: ['id', 'release_id', 'test_case_id']
          },
          {
            model: Defect,
            as: 'duplicateDefect',
            attributes: ['id', 'title']
          }
        ]
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Defect retrieved successfully',
        data: { defect }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new defect
  async createDefect(req, res, next) {
    try {
      const { projectId } = req.params;

      const defectData = {
        ...req.body,
        project_id: projectId,
        assigned_by: req.user.id
      };

      const defect = await Defect.create(defectData);

      // Create initial history record
      await DefectHistory.create({
        defect_id: defect.id,
        field_name: 'status',
        new_value: 'Created',
        changed_by: req.user.id,
        notes: 'Defect created'
      });

      // Get complete defect data
      const newDefect = await Defect.findByPk(defect.id, {
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus',
            attributes: ['id', 'name', 'color_code']
          },
          {
            model: DefectType,
            as: 'defectType',
            attributes: ['id', 'name']
          },
          {
            model: Priority,
            as: 'priority',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: Severity,
            as: 'severity',
            attributes: ['id', 'name', 'color_code', 'level']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: User,
            as: 'assigner',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      // Send assignment notification if assignee is specified
      if (newDefect.assignee && newDefect.assignee.email) {
        await emailService.sendDefectAssignmentNotification(
          newDefect,
          newDefect.assignee,
          newDefect.assigner
        );
      }

      res.status(201).json({
        success: true,
        message: 'Defect created successfully',
        data: { defect: newDefect }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update defect
  async updateDefect(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus'
          }
        ]
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const oldValues = { ...defect.toJSON() };
      await defect.update(req.body);

      // Create history records for changed fields
      const fieldsToTrack = [
        'defect_status_id', 'priority_id', 'severity_id', 'type_id',
        'assigned_to', 'title', 'description'
      ];

      for (const field of fieldsToTrack) {
        if (req.body[field] && req.body[field] !== oldValues[field]) {
          await DefectHistory.create({
            defect_id: defect.id,
            field_name: field,
            old_value: oldValues[field]?.toString() || null,
            new_value: req.body[field]?.toString() || null,
            changed_by: req.user.id,
            notes: `${field} updated`
          });
        }
      }

      const updatedDefect = await Defect.findByPk(id, {
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus',
            attributes: ['id', 'name', 'color_code']
          },
          {
            model: Priority,
            as: 'priority',
            attributes: ['id', 'name', 'color_code']
          },
          {
            model: Severity,
            as: 'severity',
            attributes: ['id', 'name', 'color_code']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Defect updated successfully',
        data: { defect: updatedDefect }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete defect
  async deleteDefect(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId
        }
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      await defect.update({ is_active: false });

      res.status(200).json({
        success: true,
        message: 'Defect deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update defect status
  async updateDefectStatus(req, res, next) {
    try {
      const { projectId, id } = req.params;
      const { defect_status_id, resolution_notes } = req.body;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: DefectStatus,
            as: 'defectStatus'
          },
          {
            model: User,
            as: 'assignee'
          },
          {
            model: User,
            as: 'assigner'
          },
          {
            model: Project,
            as: 'project'
          },
          {
            model: Priority,
            as: 'priority'
          },
          {
            model: Severity,
            as: 'severity'
          }
        ]
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const oldStatus = defect.defectStatus.name;
      const updateData = { defect_status_id };
      
      if (resolution_notes) {
        updateData.resolution_notes = resolution_notes;
      }

      await defect.update(updateData);

      // Get new status name
      const newStatus = await DefectStatus.findByPk(defect_status_id);

      // Create history record
      await DefectHistory.create({
        defect_id: defect.id,
        field_name: 'status',
        old_value: oldStatus,
        new_value: newStatus.name,
        changed_by: req.user.id,
        notes: resolution_notes || 'Status updated'
      });

      // Send status change notification
      await emailService.sendDefectStatusChangeNotification(
        defect,
        req.user,
        oldStatus,
        newStatus.name
      );

      res.status(200).json({
        success: true,
        message: 'Defect status updated successfully',
        data: {
          defect_id: defect.id,
          old_status: oldStatus,
          new_status: newStatus.name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign defect to user
  async assignDefect(req, res, next) {
    try {
      const { projectId, id } = req.params;
      const { assigned_to, notes } = req.body;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        },
        include: [
          {
            model: User,
            as: 'assignee'
          },
          {
            model: Project,
            as: 'project'
          },
          {
            model: Priority,
            as: 'priority'
          },
          {
            model: Severity,
            as: 'severity'
          },
          {
            model: DefectStatus,
            as: 'defectStatus'
          }
        ]
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const oldAssignee = defect.assignee;
      await defect.update({ assigned_to, assigned_by: req.user.id });

      // Get new assignee details
      const newAssignee = await User.findByPk(assigned_to, {
        attributes: ['id', 'first_name', 'last_name', 'email']
      });

      // Create history record
      await DefectHistory.create({
        defect_id: defect.id,
        field_name: 'assigned_to',
        old_value: oldAssignee ? `${oldAssignee.first_name} ${oldAssignee.last_name}` : null,
        new_value: `${newAssignee.first_name} ${newAssignee.last_name}`,
        changed_by: req.user.id,
        notes: notes || 'Defect reassigned'
      });

      // Send assignment notification
      if (newAssignee.email) {
        await emailService.sendDefectAssignmentNotification(
          defect,
          newAssignee,
          req.user
        );
      }

      res.status(200).json({
        success: true,
        message: 'Defect assigned successfully',
        data: {
          defect_id: defect.id,
          assigned_to: newAssignee
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get defect history
  async getDefectHistory(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        }
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const history = await DefectHistory.findAll({
        where: { defect_id: id },
        include: [
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
        message: 'Defect history retrieved successfully',
        data: { history }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get defect comments
  async getDefectComments(req, res, next) {
    try {
      const { projectId, id } = req.params;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        }
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const comments = await Comment.findAll({
        where: {
          defect_id: id,
          is_active: true
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Defect comments retrieved successfully',
        data: { comments }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add comment to defect
  async addDefectComment(req, res, next) {
    try {
      const { projectId, id } = req.params;
      const { comment, attachments } = req.body;

      const defect = await Defect.findOne({
        where: {
          id: id,
          project_id: projectId,
          is_active: true
        }
      });

      if (!defect) {
        return res.status(404).json({
          success: false,
          message: 'Defect not found'
        });
      }

      const newComment = await Comment.create({
        defect_id: id,
        user_id: req.user.id,
        comment,
        attachments: attachments ? JSON.stringify(attachments) : null
      });

      const commentWithUser = await Comment.findByPk(newComment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { comment: commentWithUser }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DefectController();