module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Optional client details captured at project creation
    client_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    client_country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    client_state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    client_email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    client_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'ON_HOLD'),
      defaultValue: 'ACTIVE'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'projects',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Project.associate = function(models) {
    Project.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'owner'
    });
    Project.hasMany(models.Module, { 
      foreignKey: 'project_id',
      as: 'modules',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.ProjectAllocation, { 
      foreignKey: 'project_id',
      as: 'allocations',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.ProjectAllocationHistory, { 
      foreignKey: 'project_id',
      as: 'allocationHistory'
    });
    Project.hasMany(models.Release, { 
      foreignKey: 'project_id',
      as: 'releases',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.TestCase, { 
      foreignKey: 'project_id',
      as: 'testCases',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.Defect, { 
      foreignKey: 'project_id',
      as: 'defects',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.UserPrivilege, { 
      foreignKey: 'project_id',
      as: 'userPrivileges'
    });
    Project.hasMany(models.ProjectUserPrivilege, { 
      foreignKey: 'project_id',
      as: 'projectPrivileges'
    });
  };

  return Project;
};