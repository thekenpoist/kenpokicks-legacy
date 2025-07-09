'use strict';
module.exports = {
  async up (queryInterface, Sequelize) { 
    await queryInterface.createTable('trainingLogs', {
      logId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        userUuid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'uuid'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        logCategory: {
            type: Sequelize.ENUM(
                    'Bag/Pad Work',
                    'Basics',
                    'Cardio',
                    'Dry Fire',
                    'Field Training',
                    'Forms',
                    'Grappling',
                    'Instruction',
                    'Live Fire',
                    'Meditation',
                    'Recovery',
                    'Sets',
                    'Skill Drills',
                    'Sparring',
                    'Stretching',
                    'Techniques',
                    'Weightlifting',
                    'Weapons Practice'
                    ),
            allowNull: false,
        },
        logTitle: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        logDescription: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        logDuration: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        logRelatedBelt: {
          type: Sequelize.STRING,
          allowNull: true
        },
        logDate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        logIsPrivate: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        logIntensity: {
          type: Sequelize.ENUM('Low', 'Moderate', 'High', 'Extreme'),
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
    await queryInterface.dropTable('trainingLogs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trainingLogs_logCategory";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trainingLogs_logIntensity";');

  }
};
