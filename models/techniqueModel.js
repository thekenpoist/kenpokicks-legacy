'use strict';
const { Model, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
  class Technique extends Model {
    static associate(models) {
      // define association here
    }
  }

  Technique.init({
    techId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    techTitle: {
      type: DataTypes.JSON,
      allowNull: false,
      unique: true
    },
    techAttack: {
      type: DataTypes.JSON,
      allowNull: false
    },
    techDescription: {
      type: DataTypes.JSON,
      allowNull: false
    },
    techGroup: {
      type: DataTypes.JSON,
      allowNull: false
    },
    techAttackAngle: {
      type: DataTypes.JSON,
      allowNull: false
    },
    relatedForm: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    beltColor: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
  }, {
    sequelize,
    modelName: 'Technique',
    tableName: 'techniques',
    timestamps: true
  });

  return Technique;
};