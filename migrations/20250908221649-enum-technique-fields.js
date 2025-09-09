'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter techGroup → ENUM
    await queryInterface.changeColumn('techniques', 'techGroup', {
      type: Sequelize.ENUM(
        "Punch",
        "Kick",
        "Strike Combo",
        "Grab",
        "Hold & Hug",
        "Tackle",
        "Choke",
        "Lock",
        "Push",
        "Multiple Attacker",
        "Stick Attack",
        "Gun Attack",
        "Knife Attack"
      ),
      allowNull: false,
    });

    // Alter techAttackAngle → ENUM
    await queryInterface.changeColumn('techniques', 'techAttackAngle', {
      type: Sequelize.ENUM(
        "12:00", "12:30",
        "1:00", "1:30",
        "2:00", "2:30",
        "3:00", "3:30",
        "4:00", "4:30",
        "5:00", "5:30",
        "6:00", "6:30",
        "7:00", "7:30",
        "8:00", "8:30",
        "9:00", "9:30",
        "10:00", "10:30",
        "11:00", "11:30"
      ),
      allowNull: false,
    });

    // Alter beltColor → ENUM
    await queryInterface.changeColumn('techniques', 'beltColor', {
      type: Sequelize.ENUM(
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
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback to plain STRING
    await queryInterface.changeColumn('techniques', 'techGroup', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('techniques', 'techAttackAngle', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('techniques', 'beltColor', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
