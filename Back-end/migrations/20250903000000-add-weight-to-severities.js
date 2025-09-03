"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("severities", "weight", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
    await queryInterface.addIndex("severities", ["weight"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("severities", ["weight"]);
    await queryInterface.removeColumn("severities", "weight");
  }
};


