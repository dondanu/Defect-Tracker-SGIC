module.exports = (sequelize, DataTypes) => {
  const ProjectUserPrivilege = sequelize.define('ProjectUserPrivilege', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    privilege_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'privileges',
        key: 'id'
      }
    },
    granted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    granted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'project_user_privileges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'project_id', 'privilege_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['project_id']
      },
      {
        fields: ['privilege_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  ProjectUserPrivilege.associate = function(models) {
    ProjectUserPrivilege.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    ProjectUserPrivilege.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    ProjectUserPrivilege.belongsTo(models.Privilege, { 
      foreignKey: 'privilege_id',
      as: 'privilege'
    });
    ProjectUserPrivilege.belongsTo(models.User, { 
      foreignKey: 'granted_by',
      as: 'grantedBy'
    });
  };

  return ProjectUserPrivilege;
};