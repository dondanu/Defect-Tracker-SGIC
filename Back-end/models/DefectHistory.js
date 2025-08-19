module.exports = (sequelize, DataTypes) => {
  const DefectHistory = sequelize.define('DefectHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    defect_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'defects',
        key: 'id'
      }
    },
    release_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'releases',
        key: 'id'
      }
    },
    field_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'defect_history',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['defect_id']
      },
      {
        fields: ['release_id']
      },
      {
        fields: ['field_name']
      },
      {
        fields: ['changed_by']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  DefectHistory.associate = function(models) {
    DefectHistory.belongsTo(models.Defect, { 
      foreignKey: 'defect_id',
      as: 'defect'
    });
    DefectHistory.belongsTo(models.Release, { 
      foreignKey: 'release_id',
      as: 'release'
    });
    DefectHistory.belongsTo(models.User, { 
      foreignKey: 'changed_by',
      as: 'changedBy'
    });
  };

  return DefectHistory;
};