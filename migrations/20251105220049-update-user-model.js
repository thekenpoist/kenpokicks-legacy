'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transacti

    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('superadmin', 'admin', 'instructor', 'student'),
         defaultValue: 'student',
         allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'instructor', 'student'),
         defaultValue: 'student',
         allowNull: false
    });
  }
};
