module.exports = (sequelize, DataTypes) => {
  const Severity = sequelize.define('Severity', {
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
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
    },
    color_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'severities',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['level']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Severity.associate = function(models) {
    Severity.hasMany(models.TestCase, { 
      foreignKey: 'severity_id',
      as: 'testCases'
    });
    Severity.hasMany(models.Defect, { 
      foreignKey: 'severity_id',
      as: 'defects'
    });
  };

  return Severity;
};