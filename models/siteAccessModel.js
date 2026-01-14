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
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
            set(value) {
                const normalized = String(value || '').trim().toLowerCase();
                this.setDataValue('email', normalized);
            }
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        intendedRole: {
            type: DataTypes.ENUM('admin', 'instructor', 'student'),
            defaultValue: 'student',
            allowNull: false
        },
        isAllowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'SiteAccess',
        tableName: 'siteAccess',
        timestamps: true
    });

    return SiteAccess;
};