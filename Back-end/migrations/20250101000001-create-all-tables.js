'use strict';

/*
  # Complete Database Schema for Defect Management System

  1. New Tables
    - All core tables for defect management system
    - User management with roles and privileges
    - Project structure with modules and submodules
    - Test case and release management
    - Defect tracking with history and comments
    - SMTP configuration for email notifications

  2. Security
    - Enable proper indexes for performance
    - Foreign key constraints for data integrity
    - Proper data types and validations

  3. Features
    - Complete user authentication system
    - Project allocation and bench management
    - Release and test case management
    - Comprehensive defect tracking
    - Email notification system
*/

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create designations table
    await queryInterface.createTable('designations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create privileges table
    await queryInterface.createTable('privileges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create projects table
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'ON_HOLD'),
        defaultValue: 'ACTIVE'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      designation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'designations',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      profile_picture: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create modules table
    await queryInterface.createTable('modules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create sub_modules table
    await queryInterface.createTable('sub_modules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      modules_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create project_allocations table
    await queryInterface.createTable('project_allocations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      allocation_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create project_allocation_history table
    await queryInterface.createTable('project_allocation_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      allocation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'project_allocations',
          key: 'id'
        }
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.ENUM('ALLOCATED', 'DEALLOCATED', 'ROLE_CHANGED', 'PERCENTAGE_CHANGED'),
        allowNull: false
      },
      old_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      new_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create bench table
    await queryInterface.createTable('bench', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      availability_status: {
        type: Sequelize.ENUM('AVAILABLE', 'PARTIALLY_AVAILABLE', 'NOT_AVAILABLE'),
        defaultValue: 'AVAILABLE'
      },
      availability_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100.00
      },
      skills: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create release_types table
    await queryInterface.createTable('release_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create releases table
    await queryInterface.createTable('releases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      release_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'release_types',
          key: 'id'
        }
      },
      planned_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PLANNED', 'IN_PROGRESS', 'TESTING', 'RELEASED', 'CANCELLED'),
        defaultValue: 'PLANNED'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create severities table
    await queryInterface.createTable('severities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      color_code: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create priorities table
    await queryInterface.createTable('priorities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      color_code: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create test_cases table
    await queryInterface.createTable('test_cases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      preconditions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      steps: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'modules',
          key: 'id'
        }
      },
      sub_module_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sub_modules',
          key: 'id'
        }
      },
      severity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'severities',
          key: 'id'
        }
      },
      test_type: {
        type: Sequelize.ENUM('FUNCTIONAL', 'NON_FUNCTIONAL', 'REGRESSION', 'INTEGRATION', 'UNIT', 'UI', 'API', 'PERFORMANCE'),
        defaultValue: 'FUNCTIONAL'
      },
      automation_status: {
        type: Sequelize.ENUM('MANUAL', 'AUTOMATED', 'TO_BE_AUTOMATED'),
        defaultValue: 'MANUAL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create release_test_cases table
    await queryInterface.createTable('release_test_cases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      release_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'releases',
          key: 'id'
        }
      },
      test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_cases',
          key: 'id'
        }
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      execution_status: {
        type: Sequelize.ENUM('NOT_EXECUTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'),
        defaultValue: 'NOT_EXECUTED'
      },
      execution_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      execution_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      actual_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create defect_statuses table
    await queryInterface.createTable('defect_statuses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_closed_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      color_code: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      order_sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create defect_types table
    await queryInterface.createTable('defect_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create defects table
    await queryInterface.createTable('defects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      steps_to_reproduce: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      actual_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      modules_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'modules',
          key: 'id'
        }
      },
      sub_module_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sub_modules',
          key: 'id'
        }
      },
      release_test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'release_test_cases',
          key: 'id'
        }
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      defect_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'defect_statuses',
          key: 'id'
        }
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'defect_types',
          key: 'id'
        }
      },
      priority_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'priorities',
          key: 'id'
        }
      },
      severity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'severities',
          key: 'id'
        }
      },
      environment: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      attachments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolution_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_duplicate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      duplicate_of: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'defects',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create defect_history table
    await queryInterface.createTable('defect_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      defect_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'defects',
          key: 'id'
        }
      },
      release_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'releases',
          key: 'id'
        }
      },
      field_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      old_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      new_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create comments table
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      defect_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'defects',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create user_privileges table
    await queryInterface.createTable('user_privileges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      privilege_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'privileges',
          key: 'id'
        }
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      granted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      granted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create project_user_privileges table
    await queryInterface.createTable('project_user_privileges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      privilege_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'privileges',
          key: 'id'
        }
      },
      granted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      granted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create group_privileges table
    await queryInterface.createTable('group_privileges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      privilege_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'privileges',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create email_users table
    await queryInterface.createTable('email_users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      email_type: {
        type: Sequelize.ENUM('DEFECT_ASSIGNED', 'DEFECT_STATUS_CHANGED', 'PROJECT_ASSIGNED', 'RELEASE_CREATED', 'GENERAL_NOTIFICATION'),
        allowNull: false
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create smtp_configs table
    await queryInterface.createTable('smtp_configs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      host: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      port: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      secure: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      from_email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      from_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('users', {
      fields: ['designation_id'],
      type: 'foreign key',
      name: 'fk_users_designation',
      references: {
        table: 'designations',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('projects', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_projects_user',
      references: {
        table: 'users',
        field: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'smtp_configs', 'email_users', 'group_privileges', 'project_user_privileges', 
      'user_privileges', 'comments', 'defect_history', 'defects', 'defect_types', 
      'defect_statuses', 'release_test_cases', 'test_cases', 'priorities', 'severities', 
      'releases', 'release_types', 'bench', 'project_allocation_history', 
      'project_allocations', 'sub_modules', 'modules', 'users', 'projects', 
      'privileges', 'roles', 'designations'
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  }
};