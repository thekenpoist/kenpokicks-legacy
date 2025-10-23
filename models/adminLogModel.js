'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class AdminLog extends Model {
        static associate(models) {

        }
    }

    AdminLog.init({
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        actor: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        actorUuid: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM(
                "Edit User",
                "Suspend User",
                "Unsuspend User",
                "Delete User",
                "Edit Technique",
                "Create Technique",
                "Edit Form",
                "Edit Set",
                "Edit Basics"
            ),
            allowNull: false
        },
        actionDate: {
            type: DataTypes.DATE(3),
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        entityAffected: {
            type: DataTypes.ENUM(
                "User",
                "Technique",
                "Form",
                "Set",
                "Basics"
            ),
            allowNull: false
        },
        entityLabel: { // Steve, this is username, technique name, belt color, etc...
            type: DataTypes.STRING(128),
            allowNull: true
        },
        summary: {
            type: DataTypes.STRING(256),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'AdminLog',
        tableName: 'adminLogs',
        timestamps: false
    });

    return AdminLog;
};