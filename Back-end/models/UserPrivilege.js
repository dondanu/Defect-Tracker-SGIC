module.exports = (sequelize, DataTypes) => {
  const UserPrivilege = sequelize.define('UserPrivilege', {
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
    privilege_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'privileges',
        key: 'id'
      }
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
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
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'user_privileges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'privilege_id', 'project_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['privilege_id']
      },
      {
        fields: ['project_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  UserPrivilege.associate = function(models) {
    UserPrivilege.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    UserPrivilege.belongsTo(models.Privilege, { 
      foreignKey: 'privilege_id',
      as: 'privilege'
    });
    UserPrivilege.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    UserPrivilege.belongsTo(models.User, { 
      foreignKey: 'granted_by',
      as: 'grantedBy'
    });
  };

  return UserPrivilege;
};