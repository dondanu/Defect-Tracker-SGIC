'use strict';

/**
 * Adds optional client_* fields to the projects table.
 * Safe to run multiple times: checks existing columns before adding/removing.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('projects');

    if (!table.client_name) {
      await queryInterface.addColumn('projects', 'client_name', {
        type: Sequelize.STRING(200),
        allowNull: true
      });
    }

    if (!table.client_country) {
      await queryInterface.addColumn('projects', 'client_country', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!table.client_state) {
      await queryInterface.addColumn('projects', 'client_state', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!table.client_email) {
      await queryInterface.addColumn('projects', 'client_email', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!table.client_phone) {
      await queryInterface.addColumn('projects', 'client_phone', {
        type: Sequelize.STRING(20),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('projects');

    if (table.client_phone) {
      await queryInterface.removeColumn('projects', 'client_phone');
    }
    if (table.client_email) {
      await queryInterface.removeColumn('projects', 'client_email');
    }
    if (table.client_state) {
      await queryInterface.removeColumn('projects', 'client_state');
    }
    if (table.client_country) {
      await queryInterface.removeColumn('projects', 'client_country');
    }
    if (table.client_name) {
      await queryInterface.removeColumn('projects', 'client_name');
    }
  }
};

