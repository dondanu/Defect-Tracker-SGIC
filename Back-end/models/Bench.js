module.exports = (sequelize, DataTypes) => {
  const Bench = sequelize.define('Bench', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    availability_status: {
      type: DataTypes.ENUM('AVAILABLE', 'PARTIALLY_AVAILABLE', 'NOT_AVAILABLE'),
      defaultValue: 'AVAILABLE'
    },
    availability_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.00,
      validate: {
        min: 0,
        max: 100
      }
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'bench',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['availability_status']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['end_date']
      }
    ]
  });

  Bench.associate = function(models) {
    Bench.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Bench;
};