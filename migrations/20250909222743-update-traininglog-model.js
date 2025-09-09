'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'trainingLogs';
    const desc = await queryInterface.describeTable(table);

    // Only run if the column exists
    if (desc.logRelatedBelt) {
      // 1) Hygiene: trim + normalize legacy value before tightening ENUM
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET logRelatedBelt = TRIM(logRelatedBelt)
        WHERE logRelatedBelt IS NOT NULL
      `);

      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET logRelatedBelt = 'Red/Black'
        WHERE logRelatedBelt = 'Black/Red'
      `);

      // 2) Apply ENUM (no "White"), allowNull stays TRUE per your model
      await queryInterface.changeColumn(table, 'logRelatedBelt', {
        type: Sequelize.ENUM(
          'Yellow',
          'Orange',
          'Purple',
          'Blue',
          'Green',
          'Brown',
          'Red',
          'Red/Black',
          'Black'
        ),
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'trainingLogs';
    const desc = await queryInterface.describeTable(table);

    if (desc.logRelatedBelt) {
      // Revert ENUM → STRING (safe fallback)
      await queryInterface.changeColumn(table, 'logRelatedBelt', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  }
};
