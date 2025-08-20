module.exports = (sequelize, DataTypes) => {
  const ReleaseType = sequelize.define('ReleaseType', {
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
    tableName: 'release_types',
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

  ReleaseType.associate = function(models) {
    ReleaseType.hasMany(models.Release, { 
      foreignKey: 'release_type_id',
      as: 'releases'
    });
  };

  return ReleaseType;
};