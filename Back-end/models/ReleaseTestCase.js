module.exports = (sequelize, DataTypes) => {
  const ReleaseTestCase = sequelize.define('ReleaseTestCase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    release_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'releases',
        key: 'id'
      }
    },
    test_case_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_cases',
        key: 'id'
      }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    execution_status: {
      type: DataTypes.ENUM('NOT_EXECUTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'),
      defaultValue: 'NOT_EXECUTED'
    },
    execution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    execution_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    actual_result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'release_test_cases',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['release_id', 'test_case_id']
      },
      {
        fields: ['release_id']
      },
      {
        fields: ['test_case_id']
      },
      {
        fields: ['owner_id']
      },
      {
        fields: ['execution_status']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  ReleaseTestCase.associate = function(models) {
    ReleaseTestCase.belongsTo(models.Release, { 
      foreignKey: 'release_id',
      as: 'release'
    });
    ReleaseTestCase.belongsTo(models.TestCase, { 
      foreignKey: 'test_case_id',
      as: 'testCase'
    });
    ReleaseTestCase.belongsTo(models.User, { 
      foreignKey: 'owner_id',
      as: 'owner'
    });
    ReleaseTestCase.hasMany(models.Defect, { 
      foreignKey: 'release_test_case_id',
      as: 'defects'
    });
  };

  return ReleaseTestCase;
};