'use strict';
const { Model, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
    class Belt extends Model {
        static associate(models) {

        }

        static async getAllOrdered() {
            return await this.findAll({
            order: [['beltRankOrder', 'ASC']],
            });
        }
    }

    Belt.init({
        beltId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        beltColor: {
        type: DataTypes.ENUM(
            "White",
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
        unique: true
        },
        beltSlug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        },
        beltRankOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
        },
        beltNotes: {
        type: DataTypes.TEXT,
        allowNull: true
        },
        beltGroup: {
        type: DataTypes.ENUM(
            "beginner",
            "intermediate",
            "advanced",
            "expert"
        ),
        allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Belt',
        tableName: 'belts',
        timestamps: true
    });

    return Belt;
};