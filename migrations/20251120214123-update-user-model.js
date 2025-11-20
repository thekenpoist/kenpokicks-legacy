'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'rank', {
        type: Sequelize.ENUM(
            "White",
            "Yellow",
            "Orange",
            "Purple",
            "Blue",
            "Green",
            "Brown",
            "Red",
            "Red/Black",
            "Black"
        ),
        allowNull: false,
        defaultValue: 'White'
      });
    await queryInterface.addColumn('users', 'rankDetails', { type: Sequelize.STRING, allowNull: true }); 
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'rank',{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'White Belt'
      });
    await queryInterface.removeColumn('users', 'rankDetails');
  }
};
