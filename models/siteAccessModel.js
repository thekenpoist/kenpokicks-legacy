'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SiteAccess extends Model {
        static associate(models) {

        }
    }

    SiteAccess.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        isAllowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'SiteAccess',
        tableName: 'siteAccess',
        timestamps: true
    });

    return SiteAccess;
};