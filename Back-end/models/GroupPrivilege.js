module.exports = (sequelize, DataTypes) => {
  const GroupPrivilege = sequelize.define('GroupPrivilege', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'group_privileges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'privilege_id']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['privilege_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  GroupPrivilege.associate = function(models) {
    GroupPrivilege.belongsTo(models.Role, { 
      foreignKey: 'role_id',
      as: 'role'
    });
    GroupPrivilege.belongsTo(models.Privilege, { 
      foreignKey: 'privilege_id',
      as: 'privilege'
    });
  };

  return GroupPrivilege;
};