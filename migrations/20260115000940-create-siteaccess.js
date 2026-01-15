'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('siteAccess', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      intendedRole: {
        type: Sequelize.ENUM('admin', 'instructor', 'student'),
        defaultValue: 'student',
        allowNull: false
      },
      isAllowed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('siteAccess');
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_siteAccess_intendedRole;"
    );
  }
};
