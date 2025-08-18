module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
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
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'modules',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['project_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['project_id', 'name']
      }
    ]
  });

  Module.associate = function(models) {
    Module.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    Module.hasMany(models.SubModule, { 
      foreignKey: 'modules_id',
      as: 'subModules',
      onDelete: 'CASCADE'
    });
    Module.hasMany(models.TestCase, { 
      foreignKey: 'module_id',
      as: 'testCases'
    });
    Module.hasMany(models.Defect, { 
      foreignKey: 'modules_id',
      as: 'defects'
    });
  };

  return Module;
};