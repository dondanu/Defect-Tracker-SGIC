module.exports = (sequelize, DataTypes) => {
  const ProjectAllocation = sequelize.define('ProjectAllocation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allocation_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.00,
      validate: {
        min: 0,
        max: 100
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'project_allocations',
    timestamps: true,
    underscored: true,
    indexes: [
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
        fields: ['is_active']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['end_date']
      }
    ]
  });

  ProjectAllocation.associate = function(models) {
    ProjectAllocation.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    ProjectAllocation.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    ProjectAllocation.belongsTo(models.Role, { 
      foreignKey: 'role_id',
      as: 'role'
    });
    ProjectAllocation.hasMany(models.ProjectAllocationHistory, { 
      foreignKey: 'allocation_id',
      as: 'history'
    });
  };

  return ProjectAllocation;
};