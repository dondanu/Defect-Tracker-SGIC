module.exports = (sequelize, DataTypes) => {
  const EmailUser = sequelize.define('EmailUser', {
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
    email_type: {
      type: DataTypes.ENUM('DEFECT_ASSIGNED', 'DEFECT_STATUS_CHANGED', 'PROJECT_ASSIGNED', 'RELEASE_CREATED', 'GENERAL_NOTIFICATION'),
      allowNull: false
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'email_users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'email_type']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['email_type']
      },
      {
        fields: ['is_enabled']
      }
    ]
  });

  EmailUser.associate = function(models) {
    EmailUser.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return EmailUser;
};