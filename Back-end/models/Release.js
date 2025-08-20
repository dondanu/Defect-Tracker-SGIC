module.exports = (sequelize, DataTypes) => {
  const Release = sequelize.define('Release', {
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
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
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
    release_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'release_types',
        key: 'id'
      }
    },
    planned_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'TESTING', 'RELEASED', 'CANCELLED'),
      defaultValue: 'PLANNED'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'releases',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['project_id']
      },
      {
        fields: ['release_type_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['version']
      },
      {
        unique: true,
        fields: ['project_id', 'version']
      }
    ]
  });

  Release.associate = function(models) {
    Release.belongsTo(models.Project, { 
      foreignKey: 'project_id',
      as: 'project'
    });
    Release.belongsTo(models.ReleaseType, { 
      foreignKey: 'release_type_id',
      as: 'releaseType'
    });
    Release.hasMany(models.ReleaseTestCase, { 
      foreignKey: 'release_id',
      as: 'releaseTestCases'
    });
    Release.hasMany(models.DefectHistory, { 
      foreignKey: 'release_id',
      as: 'defectHistory'
    });
  };

  return Release;
};