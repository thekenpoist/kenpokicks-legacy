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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    techAttack: {
      type: DataTypes.STRING,
      allowNull: false
    },
    techDescription: {
      type: DataTypes.JSON,
      allowNull: false
    },
    techGroup: {
      type: DataTypes.STRING,
      allowNull: false
    },
    techAttackAngle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relatedForm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    beltColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Technique',
    tableName: 'techniques',
    timestamps: true
  });

  return Technique;
};