'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First add the column as nullable
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: false
    });

    // Update existing users with generated usernames
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE username IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      const username = `US${String(user.id).padStart(4, '0')}`;
      await queryInterface.sequelize.query(
        'UPDATE users SET username = ? WHERE id = ?',
        {
          replacements: [username, user.id],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Now make the column NOT NULL and unique
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true
    });

    // Add index for username
    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('users', 'users_username_unique');
    
    // Remove column
    await queryInterface.removeColumn('users', 'username');
  }
};
