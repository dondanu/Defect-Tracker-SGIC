module.exports = (sequelize, DataTypes) => {
  const DefectType = sequelize.define('DefectType', {
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
    tableName: 'defect_types',
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

  DefectType.associate = function(models) {
    DefectType.hasMany(models.Defect, { 
      foreignKey: 'type_id',
      as: 'defects'
    });
  };

  return DefectType;
};