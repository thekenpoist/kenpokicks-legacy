'use strict';
const { Model, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
  class Belt extends Model {
    static associate(models) {
      // define association here
    }
  }

  Belt.init({
    beltId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    curriculum: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    basics: {
      type: DataTypes.JSON,
      allowNull: true
    },
    techniques: {
      type: DataTypes.JSON,
      allowNull: true
    },
    forms: {
      type: DataTypes.JSON,
      allowNull: true
    },
    sets: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Belt',
    tableName: 'belts',
    timestamps: true
  });

  return Belt;
};