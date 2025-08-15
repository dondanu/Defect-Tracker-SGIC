module.exports = (sequelize, DataTypes) => {
  const TestCase = sequelize.define('TestCase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preconditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    steps: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    expected_result: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
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
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    sub_module_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sub_modules',
        key: 'id'
      }
    },
    severity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'severities',
        key: 'id'
      }
    },
    test_type: {
      type: DataTypes.ENUM('FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION', 'INTEGRATION', 'UNIT', 'UI', 'API', 'PERFORMANCE'),
      defaultValue: 'FUNCTIONAL'
    },
    automation_status: {
      type: DataTypes.ENUM('MANUAL', 'AUTOMATED', 'TO_BE_AUTOMATED'),
      defaultValue: 'MANUAL'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'test_cases',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['project_id']
      },
      {
        fields: ['module_id']
      },
      {
        fields: ['sub_module_id']
      },
      {
        fields: ['severity_id']
      },
      {
        fields: ['test_type']
      },
      {
        fields: ['automation_status']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  TestCase.associate = function(models) {
    TestCase.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    TestCase.belongsTo(models.Module, { 
      foreignKey: 'module_id',
      as: 'module'
    });
    TestCase.belongsTo(models.SubModule, { 
      foreignKey: 'sub_module_id',
      as: 'subModule'
    });
    TestCase.belongsTo(models.Severity, { 
      foreignKey: 'severity_id',
      as: 'severity'
    });
    TestCase.hasMany(models.ReleaseTestCase, { 
      foreignKey: 'test_case_id',
      as: 'releaseTestCases'
    });
  };

  return TestCase;
};