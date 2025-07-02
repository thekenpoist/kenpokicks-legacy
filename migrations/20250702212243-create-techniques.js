'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('techniques', {
      techId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        techTitle: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        techSlug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        techAttack: {
          type: Sequelize.STRING,
          allowNull: false
        },
        techDescription: {
          type: Sequelize.JSON,
          allowNull: false
        },
        techGroup: {
          type: Sequelize.STRING,
          allowNull: false
        },
        techAttackAngle: {
          type: Sequelize.STRING,
          allowNull: false
        },
        techNotes: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        relatedForm: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        beltColor: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        videoUrl: {
          type: Sequelize.STRING,
          allowNull: true
        },
        lastUpdatedBy: {
          type: Sequelize.STRING,
          allowNull: true
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

    await queryInterface.addIndex('techniques', ['techSlug'], {
      unique: true,
      name: 'techniques_techSlug_unique'
    });

    await queryInterface.addIndex('techniques', ['beltColor'], {
      name: 'techniques_beltColor_index'
    });

    await queryInterface.addIndex('techniques', ['beltColor', 'techGroup'], {
      name: 'techniques_beltColor_techGroup_index'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('techniques', 'techniques_techSlug_unique');
    await queryInterface.removeIndex('techniques', 'techniques_beltColor_index');
    await queryInterface.removeIndex('techniques', 'techniques_beltColor_techGroup_index');
    await queryInterface.dropTable('techniques');
  }
};
 