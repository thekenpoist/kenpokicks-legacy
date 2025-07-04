'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('belts', {
      beltId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        beltName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
        },
        beltSlug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
        },
        beltRankOrder: {
        type: Sequelize.INTEGER,
        allowNull: false
        },
        beltNotes: {
        type: Sequelize.TEXT,
        allowNull: true
        },
        beltGroup: {
        type: Sequelize.STRING,
        allowNull: false
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
