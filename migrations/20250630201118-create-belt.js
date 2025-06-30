'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('belts', {
        beltId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        color: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        curriculum: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        basics: {
          type: Sequelize.JSON,
          allowNull: true
        },
        techniques: {
          type: Sequelize.JSON,
          allowNull: true
        },
        forms: {
          type: Sequelize.JSON,
          allowNull: true
        },
        sets: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('belts');
  }
};
