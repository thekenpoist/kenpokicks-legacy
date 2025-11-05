'use strict';
const { truncate } = require('fs');
const { Model, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        const first = this.getDataValue('firstName') || '';
        const last = this.getDataValue('lastName') || '';
        return [first, last].filter(Boolean).join(' ');
      }
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'White Belt'
    },
    style: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Kenpo'
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'admin', 'instructor', 'student'),
      defaultValue: 'student',
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastLoggedIn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockoutUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    suspendUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    statusReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    deleteReason: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    pwdResetTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    pwdResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pwdResetRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pwdResetUsedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastPasswordChangeAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    scopes: {
      auth:   { attributes: { include: [
        'password','failedLoginAttempts','lockoutUntil','isVerified','role',
        'suspendUntil','deletedAt','passwordVersion','lastPasswordChangeAt'
      ] } },
      verify:  { attributes: { include: ['verificationToken'] } },
      forEdit: { attributes: ['uuid','username','firstName','lastName','email','style','rank','timezone','role','isVerified','avatar','lastLoggedIn','suspendUntil','statusReason'] },
      forList: { attributes: ['uuid','username','email','role','rank','style','isVerified','lastLoggedIn'] },
      forAdminShow: {
        attributes: [
          'uuid','username','email','firstName','lastName','rank','style','role','avatar','timezone',
          'isVerified','lastLoggedIn','createdAt','updatedAt',
          'failedLoginAttempts','lockoutUntil','suspendUntil','statusReason',
          'deletedAt','deletedBy','deleteReason',
          'lastPasswordChangeAt','passwordVersion',
          'pwdResetRequestedAt','pwdResetExpiresAt','pwdResetUsedAt'
        ]
      }

    }
  });

  return User;
};