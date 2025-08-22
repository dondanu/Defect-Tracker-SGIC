'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed designations
    await queryInterface.bulkInsert('designations', [
      {
        id: 1,
        name: 'Administrator',
        description: 'System Administrator',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Project Manager',
        description: 'Project Manager Role',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Test Lead',
        description: 'Testing Team Lead',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Test Engineer',
        description: 'Testing Engineer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Developer',
        description: 'Software Developer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed roles
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'Admin',
        description: 'System Administrator with full access',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Project Manager',
        description: 'Manages projects and team allocations',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Test Manager',
        description: 'Manages test cases and defects',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Tester',
        description: 'Executes test cases and reports defects',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Developer',
        description: 'Develops and fixes defects',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed privileges
    const privileges = [
      // User Management
      { name: 'Create User', description: 'Create new users', module: 'users', action: 'CREATE' },
      { name: 'View Users', description: 'View user details', module: 'users', action: 'READ' },
      { name: 'Edit User', description: 'Edit user information', module: 'users', action: 'UPDATE' },
      { name: 'Delete User', description: 'Delete users', module: 'users', action: 'DELETE' },
      { name: 'Manage Users', description: 'Full user management', module: 'users', action: 'MANAGE' },
      
      // Project Management
      { name: 'Create Project', description: 'Create new projects', module: 'projects', action: 'CREATE' },
      { name: 'View Projects', description: 'View project details', module: 'projects', action: 'READ' },
      { name: 'Edit Project', description: 'Edit project information', module: 'projects', action: 'UPDATE' },
      { name: 'Delete Project', description: 'Delete projects', module: 'projects', action: 'DELETE' },
      { name: 'Manage Projects', description: 'Full project management', module: 'projects', action: 'MANAGE' },
      
      // Defect Management
      { name: 'Create Defect', description: 'Create new defects', module: 'defects', action: 'CREATE' },
      { name: 'View Defects', description: 'View defect details', module: 'defects', action: 'READ' },
      { name: 'Edit Defect', description: 'Edit defect information', module: 'defects', action: 'UPDATE' },
      { name: 'Delete Defect', description: 'Delete defects', module: 'defects', action: 'DELETE' },
      { name: 'Manage Defects', description: 'Full defect management', module: 'defects', action: 'MANAGE' },
      
      // Test Case Management
      { name: 'Create Test Case', description: 'Create test cases', module: 'testcases', action: 'CREATE' },
      { name: 'View Test Cases', description: 'View test case details', module: 'testcases', action: 'READ' },
      { name: 'Edit Test Case', description: 'Edit test cases', module: 'testcases', action: 'UPDATE' },
      { name: 'Delete Test Case', description: 'Delete test cases', module: 'testcases', action: 'DELETE' },
      { name: 'Manage Test Cases', description: 'Full test case management', module: 'testcases', action: 'MANAGE' },
      
      // Release Management
      { name: 'Create Release', description: 'Create releases', module: 'releases', action: 'CREATE' },
      { name: 'View Releases', description: 'View release details', module: 'releases', action: 'READ' },
      { name: 'Edit Release', description: 'Edit releases', module: 'releases', action: 'UPDATE' },
      { name: 'Delete Release', description: 'Delete releases', module: 'releases', action: 'DELETE' },
      { name: 'Manage Releases', description: 'Full release management', module: 'releases', action: 'MANAGE' }
    ];

    let privilegeId = 1;
    const privilegeData = privileges.map(privilege => ({
      id: privilegeId++,
      ...privilege,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('privileges', privilegeData);

    // Seed default admin user (only if not exists)
    const existingAdmin = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: ['admin@defectmanagement.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await queryInterface.bulkInsert('users', [
        {
          id: 1,
          username: 'US0001',
          first_name: 'System',
          last_name: 'Administrator',
          email: 'admin@defectmanagement.com',
          password: hashedPassword,
          phone: '+1234567890',
          designation_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } else {
      // Update existing admin user with username if missing
      await queryInterface.sequelize.query(
        'UPDATE users SET username = ? WHERE email = ?',
        {
          replacements: ['US0001', 'admin@defectmanagement.com'],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Seed default project
    await queryInterface.bulkInsert('projects', [
      {
        id: 1,
        name: 'Default Project',
        description: 'Default project for initial setup and testing',
        user_id: 1,
        start_date: new Date(),
        status: 'ACTIVE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed default module
    await queryInterface.bulkInsert('modules', [
      {
        id: 1,
        name: 'Authentication',
        description: 'User authentication and authorization module',
        project_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed default submodule
    await queryInterface.bulkInsert('sub_modules', [
      {
        id: 1,
        name: 'Login',
        description: 'User login functionality',
        modules_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed defect statuses
    await queryInterface.bulkInsert('defect_statuses', [
      {
        id: 1,
        name: 'New',
        description: 'Newly reported defect',
        is_closed_status: false,
        color_code: '#3498db',
        order_sequence: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Assigned',
        description: 'Defect assigned to developer',
        is_closed_status: false,
        color_code: '#f39c12',
        order_sequence: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'In Progress',
        description: 'Defect is being worked on',
        is_closed_status: false,
        color_code: '#e67e22',
        order_sequence: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Fixed',
        description: 'Defect has been fixed',
        is_closed_status: false,
        color_code: '#27ae60',
        order_sequence: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Closed',
        description: 'Defect is verified and closed',
        is_closed_status: true,
        color_code: '#95a5a6',
        order_sequence: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Rejected',
        description: 'Defect was rejected',
        is_closed_status: true,
        color_code: '#e74c3c',
        order_sequence: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed priorities
    await queryInterface.bulkInsert('priorities', [
      {
        id: 1,
        name: 'Critical',
        description: 'Critical priority - must be fixed immediately',
        level: 1,
        color_code: '#e74c3c',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'High',
        description: 'High priority - should be fixed soon',
        level: 2,
        color_code: '#f39c12',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Medium',
        description: 'Medium priority - normal timeline',
        level: 3,
        color_code: '#3498db',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Low',
        description: 'Low priority - can be fixed later',
        level: 4,
        color_code: '#95a5a6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed severities
    await queryInterface.bulkInsert('severities', [
      {
        id: 1,
        name: 'Critical',
        description: 'System crash or data loss',
        level: 1,
        color_code: '#e74c3c',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Major',
        description: 'Major functionality not working',
        level: 2,
        color_code: '#f39c12',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Minor',
        description: 'Minor functionality issue',
        level: 3,
        color_code: '#3498db',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Trivial',
        description: 'Cosmetic or documentation issue',
        level: 4,
        color_code: '#95a5a6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed defect types
    await queryInterface.bulkInsert('defect_types', [
      {
        id: 1,
        name: 'Functional',
        description: 'Functional defect in the system',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'UI/UX',
        description: 'User interface or user experience issue',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Performance',
        description: 'Performance related issue',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Security',
        description: 'Security vulnerability',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Compatibility',
        description: 'Browser or system compatibility issue',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed release types
    await queryInterface.bulkInsert('release_types', [
      {
        id: 1,
        name: 'Major Release',
        description: 'Major version release with significant changes',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Minor Release',
        description: 'Minor version release with bug fixes',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Hotfix',
        description: 'Emergency fix release',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Beta Release',
        description: 'Beta version for testing',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed default SMTP config
    await queryInterface.bulkInsert('smtp_configs', [
      {
        id: 1,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'your-email@gmail.com',
        password: 'your-email-password',
        from_email: 'your-email@gmail.com',
        from_name: 'Defect Management System',
        is_active: true,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Assign all privileges to admin role
    const groupPrivileges = [];
    for (let i = 1; i <= privilegeData.length; i++) {
      groupPrivileges.push({
        id: i,
        role_id: 1, // Admin role
        privilege_id: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    await queryInterface.bulkInsert('group_privileges', groupPrivileges);

    // Assign admin user to admin role for default project
    await queryInterface.bulkInsert('project_allocations', [
      {
        id: 1,
        project_id: 1,
        user_id: 1,
        role_id: 1,
        start_date: new Date(),
        allocation_percentage: 100.00,
        is_active: true,
        notes: 'Default admin allocation',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Set default email preferences for admin user
    const emailTypes = ['DEFECT_ASSIGNED', 'DEFECT_STATUS_CHANGED', 'PROJECT_ASSIGNED', 'RELEASE_CREATED', 'GENERAL_NOTIFICATION'];
    const emailPreferences = emailTypes.map((type, index) => ({
      id: index + 1,
      user_id: 1,
      email_type: type,
      is_enabled: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await queryInterface.bulkInsert('email_users', emailPreferences);
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'email_users', 'project_allocations', 'group_privileges', 'smtp_configs', 
      'release_types', 'defect_types', 'severities', 'priorities', 'defect_statuses', 
      'sub_modules', 'modules', 'projects', 'users', 'privileges', 'roles', 'designations'
    ];

    for (const table of tables) {
      await queryInterface.bulkDelete(table, null, {});
    }
  }
};