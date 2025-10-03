'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // === account status ===
    await queryInterface.addColumn('users', 'suspendUntil',        { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'statusReason',         { type: Sequelize.STRING(120), allowNull: true });

    // === soft delete ===
    await queryInterface.addColumn('users', 'deletedAt',            { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'deletedBy',            { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addColumn('users', 'deleteReason',         { type: Sequelize.STRING(120), allowNull: true });

    // === password recovery ===
    await queryInterface.addColumn('users', 'pwdResetTokenHash',    { type: Sequelize.STRING(64), allowNull: true });
    await queryInterface.addColumn('users', 'pwdResetExpiresAt',    { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'pwdResetRequestedAt',  { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'pwdResetUsedAt',       { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'lastPasswordChangeAt', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'passwordVersion',      { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });

    // === indexes for fast checks ===
    await queryInterface.addIndex('users', ['suspendUntil'],       { name: 'idx_users_suspend_until' });
    await queryInterface.addIndex('users', ['deletedAt'],          { name: 'idx_users_deleted_at' });
    await queryInterface.addIndex('users', ['pwdResetExpiresAt'],  { name: 'idx_users_pwdreset_expires' });
  },

  async down(queryInterface, Sequelize) {
    // drop indexes
    await queryInterface.removeIndex('users', 'idx_users_pwdreset_expires');
    await queryInterface.removeIndex('users', 'idx_users_deleted_at');
    await queryInterface.removeIndex('users', 'idx_users_suspend_until');

    // drop columns (reverse order is fine)
    await queryInterface.removeColumn('users', 'passwordVersion');
    await queryInterface.removeColumn('users', 'lastPasswordChangeAt');
    await queryInterface.removeColumn('users', 'pwdResetUsedAt');
    await queryInterface.removeColumn('users', 'pwdResetRequestedAt');
    await queryInterface.removeColumn('users', 'pwdResetExpiresAt');
    await queryInterface.removeColumn('users', 'pwdResetTokenHash');

    await queryInterface.removeColumn('users', 'deleteReason');
    await queryInterface.removeColumn('users', 'deletedBy');
    await queryInterface.removeColumn('users', 'deletedAt');

    await queryInterface.removeColumn('users', 'statusReason');
    await queryInterface.removeColumn('users', 'suspendUntil');
  }
};
