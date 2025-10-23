'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('adminLogs', {
       id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true
      },
      actor: {
          type: Sequelize.STRING(50),
          allowNull: false
      },
      actorUuid: {
          type: Sequelize.CHAR(36),
          allowNull: false
      },
      action: {
          type: Sequelize.ENUM(
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
          type: Sequelize.DATE(3),
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
      },
      entityAffected: {
          type: Sequelize.ENUM(
              "User",
              "Technique",
              "Form",
              "Set",
              "Basics"
          ),
          allowNull: false
      },
      entityLabel: {
          type: Sequelize.STRING(128),
          allowNull: true
      },
      summary: {
          type: Sequelize.STRING(256),
          allowNull: false
      }
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('adminLogs');
  }
};
