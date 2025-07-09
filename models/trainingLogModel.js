'use strict';
const { Model, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
  class TrainingLog extends Model {
    static associate(models) {
      // define association here
    }
  }

  TrainingLog.init({
    logId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userUuid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    logCategory: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    logTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logDuration: {
      type: DataTypes.INTEGER  ,
      allowNull: false
    },
    logRelatedBelt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    logIsPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    logIntensity: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TrainingLog',
    tableName: 'trainingLogs',
    timestamps: true
  });

  return TrainingLog;
};