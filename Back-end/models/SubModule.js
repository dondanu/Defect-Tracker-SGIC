module.exports = (sequelize, DataTypes) => {
  const SubModule = sequelize.define('SubModule', {
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
    modules_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'sub_modules',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['modules_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['modules_id', 'name']
      }
    ]
  });

  SubModule.associate = function(models) {
    SubModule.belongsTo(models.Module, { 
      foreignKey: 'modules_id',
      as: 'module'
    });
    SubModule.hasMany(models.TestCase, { 
      foreignKey: 'sub_module_id',
      as: 'testCases'
    });
    SubModule.hasMany(models.Defect, { 
      foreignKey: 'sub_module_id',
      as: 'defects'
    });
  };

  return SubModule;
};