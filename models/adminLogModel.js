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
        actor_uuid: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        occurred_at: {
            type: DataTypes.DATE(3),
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        action: {
            type: DataTypes.ENUM(
                "edit_user",
                "suspend_user",
                "unsuspend_user",
                "delete_user",
                "edit_technique",
                "create_technique",
                "edit_form",
                "edit_set",
                "edit_basics"
            ),
            allowNull: false
        },
        entity_affected: {
            type: DataTypes.ENUM(
                "User",
                "Technique",
                "Form",
                "Set",
                "Basics"
            ),
            allowNull: false
        },
        entity_label: {
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
        tableName: 'adminlogs',
        timestamps: false
    });

    return AdminLog;
};