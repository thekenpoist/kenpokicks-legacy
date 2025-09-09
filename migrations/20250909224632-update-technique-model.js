'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'techniques';
    const desc = await queryInterface.describeTable(table);

    // Only proceed if beltColor column exists
    if (desc.beltColor) {
      // 1) Hygiene: trim + normalize BEFORE tightening ENUM
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET beltColor = TRIM(beltColor)
        WHERE beltColor IS NOT NULL
      `);

      // Legacy to canonical
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET beltColor = 'Red/Black'
        WHERE beltColor = 'Black/Red'
      `);

      // Ensure "White" isn't present on techniques (map to Yellow)
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET beltColor = 'Yellow'
        WHERE beltColor = 'White'
      `);

      // 2) Apply ENUM exactly as defined in your model (no "White")
      await queryInterface.changeColumn(table, 'beltColor', {
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
        allowNull: false
      });
    }

    // NOTE: techGroup and techAttackAngle ENUMs were migrated earlier.
    // If you need to reassert them later, do separate changeColumn calls.
  },

  async down(queryInterface, Sequelize) {
    const table = 'techniques';
    const desc = await queryInterface.describeTable(table);

    if (desc.beltColor) {
      // Generic, safe fallback
      await queryInterface.changeColumn(table, 'beltColor', {
        type: Sequelize.STRING,
        allowNull: false
      });
    }
  }
};
