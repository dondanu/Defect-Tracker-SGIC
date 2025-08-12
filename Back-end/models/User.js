module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'designations',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['designation_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  User.associate = function(models) {
    User.belongsTo(models.Designation, { 
      foreignKey: 'designation_id',
      as: 'designation'
    });
    User.hasMany(models.EmailUser, { 
      foreignKey: 'user_id',
      as: 'emailPreferences'
    });
    User.hasMany(models.Project, { 
      foreignKey: 'user_id',
      as: 'ownedProjects'
    });
    User.hasMany(models.ProjectAllocation, { 
      foreignKey: 'user_id',
      as: 'projectAllocations'
    });
    User.hasMany(models.Bench, { 
      foreignKey: 'user_id',
      as: 'benchRecords'
    });
    User.hasMany(models.Defect, { 
      foreignKey: 'assigned_by', 
      as: 'assignedDefectsBy'
    });
    User.hasMany(models.Defect, { 
      foreignKey: 'assigned_to', 
      as: 'assignedDefectsTo'
    });
    User.hasMany(models.Comment, { 
      foreignKey: 'user_id',
      as: 'comments'
    });
    User.hasMany(models.UserPrivilege, { 
      foreignKey: 'user_id',
      as: 'userPrivileges'
    });
    User.hasMany(models.ProjectUserPrivilege, { 
      foreignKey: 'user_id',
      as: 'projectPrivileges'
    });
    User.hasMany(models.ReleaseTestCase, { 
      foreignKey: 'owner_id',
      as: 'ownedTestCases'
    });
  };

  return User;
};