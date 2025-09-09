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
    techSlug: {
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
      type: DataTypes.ENUM(
        "Punch",
        "Kick",
        "Strike Combo",
        "Grab",
        "Hold & Hug",
        "Tackle",
        "Choke",
        "Lock",
        "Push",
        "Multiple Attacker",
        "Stick Attack",
        "Gun Attack",
        "Knife Attack"
      ),
      allowNull: false
    },
    techAttackAngle: {
      type: DataTypes.ENUM(
        "12:00", "12:30",
        "1:00", "1:30",
        "2:00", "2:30",
        "3:00", "3:30",
        "4:00", "4:30",
        "5:00", "5:30",
        "6:00", "6:30",
        "7:00", "7:30",
        "8:00", "8:30",
        "9:00", "9:30",
        "10:00", "10:30",
        "11:00", "11:30"
      ),
      allowNull: false
    },
    techNotes: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedForm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    beltColor: {
      type: DataTypes.ENUM(
        "Yellow",
        "Orange",
        "Purple",
        "Blue",
        "Green",
        "Brown",
        "Red",
        "Red/Black",
        "Black"
      ),
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastUpdatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Technique',
    tableName: 'techniques',
    timestamps: true
  });

  return Technique;
};