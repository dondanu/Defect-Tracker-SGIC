module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Role.associate = function(models) {
    Role.hasMany(models.ProjectAllocation, { 
      foreignKey: 'role_id',
      as: 'projectAllocations'
    });
    Role.hasMany(models.ProjectAllocationHistory, { 
      foreignKey: 'role_id',
      as: 'allocationHistory'
    });
    Role.hasMany(models.GroupPrivilege, { 
      foreignKey: 'role_id',
      as: 'groupPrivileges'
    });
  };

  return Role;
};