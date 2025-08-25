module.exports = (sequelize, DataTypes) => {
  const ProjectAllocationHistory = sequelize.define('ProjectAllocationHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    allocation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'project_allocations',
        key: 'id'
      }
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('ALLOCATED', 'DEALLOCATED', 'ROLE_CHANGED', 'PERCENTAGE_CHANGED'),
      allowNull: false
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'project_allocation_history',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['allocation_id']
      },
      {
        fields: ['project_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  ProjectAllocationHistory.associate = function(models) {
    ProjectAllocationHistory.belongsTo(models.ProjectAllocation, { 
      foreignKey: 'allocation_id',
      as: 'allocation'
    });
    ProjectAllocationHistory.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    ProjectAllocationHistory.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    ProjectAllocationHistory.belongsTo(models.Role, { 
      foreignKey: 'role_id',
      as: 'role'
    });
    ProjectAllocationHistory.belongsTo(models.User, { 
      foreignKey: 'changed_by',
      as: 'changedBy'
    });
  };

  return ProjectAllocationHistory;
};