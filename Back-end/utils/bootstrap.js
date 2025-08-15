const { sequelize, User, Privilege, Role, GroupPrivilege, Project, ProjectAllocation } = require('../models');

/**
 * Idempotent bootstrap that ensures:
 * - Core privileges exist (users:READ, users:MANAGE, projects:READ)
 * - An Admin role exists and has ALL privileges
 * - A default project exists
 * - The configured admin user is allocated to the default project with Admin role
 *
 * Controlled by env flags:
 * - BOOTSTRAP_ON_START=true|false
 * - ADMIN_EMAIL, or ADMIN_USER_ID
 * - DEFAULT_PROJECT_NAME (optional)
 */
module.exports = async function bootstrap() {
  const t = await sequelize.transaction();
  try {
    const log = (...args) => console.log('🧩 Bootstrap:', ...args);

    // 1) Ensure core privileges exist (plus keep it extensible)
    const requiredPrivileges = [
      { module: 'users', action: 'READ', name: 'View Users', description: 'View user details' },
      { module: 'users', action: 'MANAGE', name: 'Manage Users', description: 'Full user management' },
      { module: 'projects', action: 'READ', name: 'View Projects', description: 'View project details' },
    ];

    for (const p of requiredPrivileges) {
      // Find by module+action (no unique index, so be careful about name uniqueness)
      let priv = await Privilege.findOne({ where: { module: p.module, action: p.action }, transaction: t });
      if (!priv) {
        // If a privilege with the intended name exists, reuse it; else create
        priv = await Privilege.findOne({ where: { name: p.name }, transaction: t });
        if (!priv) {
          priv = await Privilege.create({ ...p, is_active: true }, { transaction: t });
          log(`Created missing privilege ${p.module}:${p.action}`);
        } else {
          // Update module/action to the intended values if name exists
          priv.module = p.module; priv.action = p.action; priv.is_active = true;
          await priv.save({ transaction: t });
          log(`Updated existing privilege name=${p.name} to ${p.module}:${p.action}`);
        }
      } else if (!priv.is_active) {
        priv.is_active = true; await priv.save({ transaction: t });
        log(`Reactivated privilege ${p.module}:${p.action}`);
      }
    }

    // 2) Ensure Admin role exists
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'Admin' },
      defaults: { description: 'System Administrator with full access', is_active: true },
      transaction: t,
    });

    // 3) Ensure Admin role has ALL privileges
    const allPrivs = await Privilege.findAll({ where: { is_active: true }, transaction: t });
    for (const priv of allPrivs) {
      await GroupPrivilege.findOrCreate({
        where: { role_id: adminRole.id, privilege_id: priv.id },
        defaults: { is_active: true },
        transaction: t,
      });
    }

    // 4) Ensure default project exists
    const defaultProjectName = process.env.DEFAULT_PROJECT_NAME || 'Default Project';
    const [project] = await Project.findOrCreate({
      where: { name: defaultProjectName },
      defaults: { description: 'Default project for bootstrap', status: 'ACTIVE', is_active: true },
      transaction: t,
    });

    // 5) Find the admin user
    let adminUser = null;
    if (process.env.ADMIN_USER_ID) {
      adminUser = await User.findByPk(process.env.ADMIN_USER_ID, { transaction: t });
    }
    if (!adminUser && process.env.ADMIN_EMAIL) {
      adminUser = await User.findOne({ where: { email: process.env.ADMIN_EMAIL }, transaction: t });
    }
    if (!adminUser) {
      // Fallback: first active user
      adminUser = await User.findOne({ where: { is_active: true }, order: [['id', 'ASC']], transaction: t });
    }

    if (adminUser) {
      // 6) Ensure allocation to default project with Admin role
      await ProjectAllocation.findOrCreate({
        where: { user_id: adminUser.id, project_id: project.id },
        defaults: { role_id: adminRole.id, is_active: true, allocation_percentage: 100.0, start_date: new Date() },
        transaction: t,
      });
      // Also ensure there is at least one allocation (even if project_id changes in future)
      await ProjectAllocation.findOrCreate({
        where: { user_id: adminUser.id, role_id: adminRole.id },
        defaults: { project_id: project.id, is_active: true, allocation_percentage: 100.0, start_date: new Date() },
        transaction: t,
      });
      log(`Admin user ensured: id=${adminUser.id}, email=${adminUser.email}`);
    } else {
      log('No admin user found to grant admin role. Set ADMIN_EMAIL or ADMIN_USER_ID in .env');
    }

    await t.commit();
    log('Bootstrap complete');
  } catch (err) {
    await t.rollback();
    console.error('Bootstrap failed:', err);
  }
};

