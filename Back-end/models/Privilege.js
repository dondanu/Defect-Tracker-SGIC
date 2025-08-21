module.exports = (sequelize, DataTypes) => {
  const Privilege = sequelize.define('Privilege', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'privileges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['module']
      },
      {
        fields: ['action']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Privilege.associate = function(models) {
    Privilege.hasMany(models.UserPrivilege, { 
      foreignKey: 'privilege_id',
      as: 'userPrivileges'
    });
    Privilege.hasMany(models.ProjectUserPrivilege, { 
      foreignKey: 'privilege_id',
      as: 'projectPrivileges'
    });
    Privilege.hasMany(models.GroupPrivilege, { 
      foreignKey: 'privilege_id',
      as: 'groupPrivileges'
    });
  };

  return Privilege;
};