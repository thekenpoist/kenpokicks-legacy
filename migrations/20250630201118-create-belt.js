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
          type: Sequelize.JSONB,
          allowNull: false,
        },
        basics: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        techniques: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        forms: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        sets: {
          type: Sequelize.JSONB,
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
