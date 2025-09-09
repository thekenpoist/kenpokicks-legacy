'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'belts';

    // 1) Inspect table columns safely
    const desc = await queryInterface.describeTable(table);

    // 2) Rename beltName -> beltColor if needed
    if (desc.beltName && !desc.beltColor) {
      await queryInterface.renameColumn(table, 'beltName', 'beltColor');
    }

    // 3) Normalize values BEFORE tightening the ENUM
    //    - Trim stray spaces
    //    - "Black/Red" -> "Red/Black" (your new canonical)
    await queryInterface.sequelize.query(`
      UPDATE ${table}
      SET beltColor = TRIM(beltColor)
      WHERE beltColor IS NOT NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE ${table}
      SET beltColor = 'Red/Black'
      WHERE beltColor = 'Black/Red'
    `);

    // 4) Apply ENUM to beltColor with White + Red/Black
    await queryInterface.changeColumn(table, 'beltColor', {
      type: Sequelize.ENUM(
        'White',
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
      allowNull: false,
    });

    // 5) Ensure beltGroup is the expected four-group ENUM (lowercase)
    await queryInterface.changeColumn(table, 'beltGroup', {
      type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    const table = 'belts';
    const desc = await queryInterface.describeTable(table);

    // Revert beltGroup to generic STRING (safe fallback)
    await queryInterface.changeColumn(table, 'beltGroup', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Revert "Red/Black" back to legacy "Black/Red"
    await queryInterface.sequelize.query(`
      UPDATE ${table}
      SET beltColor = 'Black/Red'
      WHERE beltColor = 'Red/Black'
    `);

    // Revert beltColor ENUM to previous set (no White, legacy Black/Red)
    await queryInterface.changeColumn(table, 'beltColor', {
      type: Sequelize.ENUM(
        'Yellow',
        'Orange',
        'Purple',
        'Blue',
        'Green',
        'Brown',
        'Red',
        'Black/Red',
        'Black'
      ),
      allowNull: false,
    });

    // Optionally rename back if that column existed before
    if (desc.beltColor && !desc.beltName) {
      await queryInterface.renameColumn(table, 'beltColor', 'beltName');
    }
  }
};
