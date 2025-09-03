"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Map desired weights by severity name
    const nameToWeight = new Map([
      ["Critical", 3],
      ["Major", 2],
      ["Minor", 1],
      ["Trivial", 1]
    ]);

    // Fetch current severities
    const [rows] = await queryInterface.sequelize.query(
      'SELECT id, name FROM severities'
    );

    for (const row of rows) {
      const weight = nameToWeight.get(row.name) ?? 1;
      await queryInterface.bulkUpdate(
        'severities',
        { weight },
        { id: row.id }
      );
    }
  },

  async down(queryInterface) {
    // Revert weights back to 1 (safe default)
    await queryInterface.bulkUpdate('severities', { weight: 1 }, {});
  }
};


