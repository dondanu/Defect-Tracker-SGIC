module.exports = (sequelize, DataTypes) => {
  const Defect = sequelize.define('Defect', {
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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    steps_to_reproduce: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expected_result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    actual_result: {
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
    modules_id: {
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
    release_test_case_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'release_test_cases',
        key: 'id'
      }
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    defect_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'defect_statuses',
        key: 'id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'defect_types',
        key: 'id'
      }
    },
    priority_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'priorities',
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
    environment: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_duplicate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    duplicate_of: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'defects',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'defects',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['project_id']
      },
      {
        fields: ['modules_id']
      },
      {
        fields: ['sub_module_id']
      },
      {
        fields: ['release_test_case_id']
      },
      {
        fields: ['assigned_by']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['defect_status_id']
      },
      {
        fields: ['type_id']
      },
      {
        fields: ['priority_id']
      },
      {
        fields: ['severity_id']
      },
      {
        fields: ['is_duplicate']
      },
      {
        fields: ['duplicate_of']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Defect.associate = function(models) {
    Defect.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    Defect.belongsTo(models.Module, { 
      foreignKey: 'modules_id',
      as: 'module'
    });
    Defect.belongsTo(models.SubModule, { 
      foreignKey: 'sub_module_id',
      as: 'subModule'
    });
    Defect.belongsTo(models.ReleaseTestCase, { 
      foreignKey: 'release_test_case_id',
      as: 'releaseTestCase'
    });
    Defect.belongsTo(models.User, { 
      foreignKey: 'assigned_by', 
      as: 'assigner'
    });
    Defect.belongsTo(models.User, { 
      foreignKey: 'assigned_to', 
      as: 'assignee'
    });
    Defect.belongsTo(models.DefectStatus, { 
      foreignKey: 'defect_status_id',
      as: 'defectStatus'
    });
    Defect.belongsTo(models.DefectType, { 
      foreignKey: 'type_id',
      as: 'defectType'
    });
    Defect.belongsTo(models.Priority, { 
      foreignKey: 'priority_id',
      as: 'priority'
    });
    Defect.belongsTo(models.Severity, { 
      foreignKey: 'severity_id',
      as: 'severity'
    });
    Defect.belongsTo(models.Defect, { 
      foreignKey: 'duplicate_of',
      as: 'duplicateDefect'
    });
    Defect.hasMany(models.Defect, { 
      foreignKey: 'duplicate_of',
      as: 'duplicateDefects'
    });
    Defect.hasMany(models.DefectHistory, { 
      foreignKey: 'defect_id',
      as: 'history',
      onDelete: 'CASCADE'
    });
    Defect.hasMany(models.Comment, { 
      foreignKey: 'defect_id',
      as: 'comments',
      onDelete: 'CASCADE'
    });
  };

  return Defect;
};