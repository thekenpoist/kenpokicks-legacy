'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('adminlogs', {
       id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
      },
      actor: {
          type: Sequelize.STRING(50),
          allowNull: false
      },
      actor_uuid: {
          type: Sequelize.CHAR(36),
          allowNull: false
      },
      occurred_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
      },
      action: {
          type: Sequelize.ENUM(
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
          type: Sequelize.ENUM(
              "User",
              "Technique",
              "Form",
              "Set",
              "Basics"
          )
      },
      entity_label: {
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
    await queryInterface.dropTable('adminlogs');
  }
};
