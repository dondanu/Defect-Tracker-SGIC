module.exports = (sequelize, DataTypes) => {
  const DefectStatus = sequelize.define('DefectStatus', {
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
    is_closed_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    color_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    order_sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'defect_statuses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['is_closed_status']
      },
      {
        fields: ['order_sequence']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  DefectStatus.associate = function(models) {
    DefectStatus.hasMany(models.Defect, { 
      foreignKey: 'defect_status_id',
      as: 'defects'
    });
  };

  return DefectStatus;
};