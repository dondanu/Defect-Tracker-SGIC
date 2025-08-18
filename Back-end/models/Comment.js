module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
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
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['defect_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.Defect, { 
      foreignKey: 'defect_id',
      as: 'defect'
    });
    Comment.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Comment;
};