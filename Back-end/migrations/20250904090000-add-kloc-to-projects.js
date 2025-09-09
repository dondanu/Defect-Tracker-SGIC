"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("projects", "kloc", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      comment: "Thousand Lines of Code (size metric)"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("projects", "kloc");
  }
};


