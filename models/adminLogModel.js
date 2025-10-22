'use strict';
const { Model, DataTypes, DATE, ENUM } = require('sequelize');

module.exports = (sequelize) => {
    class AdminLog extends Model {
        static associate(models) {

        }
    }

    AdminLog.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        actor: {
            type: DataTypes.CHAR(50),
            allowNull: false
        },
        actor_uuid: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        occurred_at: {
            type: DataTypes.DATE,
            allowNull: false
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
            type: ENUM(
                "User",
                "Technique",
                "Form",
                "set",
                "Basics"
            )
        },
        entity_label: {
            type: DataTypes.VARCHAR(128),
            allowNull: true
        },
        summary: {
            type: DataTypes.VARCHAR(256),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'AdminLog',
        tableName: 'adminlogs',
        timestamps: true
    });

    return AdminLog;
};