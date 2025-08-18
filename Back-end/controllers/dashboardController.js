const { Sequelize } = require('sequelize');
const { Defect, Severity, DefectStatus } = require('../models');

// Helper function to compute DSI without relying on `this` binding
const computeDSIInternal = async (projectId) => {
  const rows = await Defect.findAll({
    where: { project_id: projectId, is_active: true },
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
    include: [{ model: Severity, as: 'severity', attributes: ['name'], required: true }],
    group: ['severity.name'],
    raw: true
  });
  let total = 0; let weighted = 0;
  rows.forEach(r => { const sevName = (r['severity.name'] || '').toLowerCase(); const w = sevName === 'high' ? 3 : sevName === 'medium' ? 2 : 1; const c = parseInt(r['count'], 10) || 0; total += c; weighted += c * w; });
  const max = total * 3; const dsiPercentage = max > 0 ? Number(((weighted / max) * 100).toFixed(2)) : 0;
  return { dsiPercentage };
};

class DashboardController {
  // GET /api/dashboard/defect_severity_summary/:projectId
  async getDefectSeveritySummary(req, res, next) {
    try {
      const { projectId } = req.params;

      // Aggregate counts by severity and status
      const rows = await Defect.findAll({
        where: { project_id: projectId, is_active: true },
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
        include: [
          {
            model: Severity,
            as: 'severity',
            attributes: ['id', 'name', 'level'],
            required: true
          },
          {
            model: DefectStatus,
            as: 'defectStatus',
            attributes: ['id', 'name', 'is_closed_status'],
            required: true
          }
        ],
        group: ['severity.id', 'severity.name', 'severity.level', 'defectStatus.id', 'defectStatus.name', 'defectStatus.is_closed_status'],
        raw: true
      });

      // Transform into desired structure
      const summaryBySeverity = {};
      let totalDefects = 0;

      rows.forEach((r) => {
        const sevName = (r['severity.name'] || '').toLowerCase();
        const statusName = r['defectStatus.name'] || 'Unknown';
        const count = parseInt(r['count'], 10) || 0;

        if (!summaryBySeverity[sevName]) {
          summaryBySeverity[sevName] = { severity: sevName, totalDefects: 0, statuses: {} };
        }

        summaryBySeverity[sevName].totalDefects += count;
        totalDefects += count;
        summaryBySeverity[sevName].statuses[statusName] = (summaryBySeverity[sevName].statuses[statusName] || 0) + count;
      });

      // Ensure keys for common severities exist
      const order = ['high', 'medium', 'low'];
      const defectSummary = order.map((k) => ({
        severity: k,
        totalDefects: summaryBySeverity[k]?.totalDefects || 0,
        statuses: summaryBySeverity[k]?.statuses || {}
      }));

      res.status(200).json({
        success: true,
        message: 'Defect severity summary retrieved successfully',
        data: {
          projectId: Number(projectId),
          totalDefects,
          defectSummary
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/dsi/:projectId
  async getDSI(req, res, next) {
    try {
      const { projectId } = req.params;
      const rows = await Defect.findAll({
        where: { project_id: projectId, is_active: true },
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
        include: [
          { model: Severity, as: 'severity', attributes: ['name', 'level'], required: true }
        ],
        group: ['severity.name', 'severity.level'],
        raw: true
      });

      let total = 0;
      let weighted = 0;
      rows.forEach(r => {
        const sevName = (r['severity.name'] || '').toLowerCase();
        const weight = sevName === 'high' ? 3 : sevName === 'medium' ? 2 : 1;
        const count = parseInt(r['count'], 10) || 0;
        total += count;
        weighted += count * weight;
      });

      const max = total * 3;
      const dsiPercentage = max > 0 ? Number(((weighted / max) * 100).toFixed(2)) : 0;
      let interpretation = 'Low Risk';
      if (dsiPercentage >= 67) interpretation = 'High Risk';
      else if (dsiPercentage >= 34) interpretation = 'Medium Risk';

      res.status(200).json({
        success: true,
        message: 'DSI calculated successfully',
        data: { dsiPercentage, interpretation }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/defect-type/:projectId
  async getDefectTypes(req, res, next) {
    try {
      const { projectId } = req.params;
      const { DefectType } = require('../models');
      const rows = await Defect.findAll({
        where: { project_id: projectId, is_active: true },
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
        include: [{ model: DefectType, as: 'defectType', attributes: ['id', 'name'], required: true }],
        group: ['defectType.id', 'defectType.name'],
        raw: true
      });
      const defectTypes = rows.map(r => ({ id: r['defectType.id'], name: r['defectType.name'], count: parseInt(r['count'], 10) || 0 }));
      res.status(200).json({ success: true, message: 'Defect types summary retrieved successfully', data: { defectTypes } });
    } catch (error) { next(error); }
  }

  // GET /api/dashboard/defect-remark-ratio?projectId=1
  async getDefectRemarkRatio(req, res, next) {
    try {
      const projectId = req.query.projectId || req.params.projectId;
      const { Comment } = require('../models');

      const totalDefects = await Defect.count({ where: { project_id: projectId, is_active: true } });
      const totalComments = await Comment.count({
        include: [{ model: Defect, as: 'defect', where: { project_id: projectId, is_active: true }, attributes: [] }]
      });

      const ratioNum = totalDefects > 0 ? Number(((totalComments / totalDefects) * 100).toFixed(2)) : 0;
      let category = 'Low';
      let color = 'green';
      if (ratioNum >= 60) { category = 'High'; color = 'blue'; }
      else if (ratioNum >= 30) { category = 'Medium'; color = 'yellow'; }

      res.status(200).json({ success: true, message: 'Defect to remark ratio calculated', data: { ratio: `${ratioNum}%`, category, color, totals: { defects: totalDefects, remarks: totalComments } } });
    } catch (error) { next(error); }
  }

  // GET /api/dashboard/module?projectId=1
  async getDefectsByModule(req, res, next) {
    try {
      const projectId = req.query.projectId || req.params.projectId;
      const { Module } = require('../models');
      const rows = await Defect.findAll({
        where: { project_id: projectId, is_active: true },
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
        include: [{ model: Module, as: 'module', attributes: ['id', 'name'], required: false }],
        group: ['module.id', 'module.name'],
        raw: true
      });
      const modules = rows.map(r => ({ id: r['module.id'] || null, module: r['module.name'] || 'Unassigned', defects: parseInt(r['count'], 10) || 0 }));
      res.status(200).json({ success: true, message: 'Defects by module retrieved successfully', data: { modules } });
    } catch (error) { next(error); }
  }

  // GET /api/dashboard/reopen-count_summary/:projectId
  async getReopenCountSummary(req, res, next) {
    try {
      const { projectId } = req.params;
      const reopenStatuses = await DefectStatus.findAll({
        where: { name: { [require('sequelize').Op.like]: '%reopen%' } },
        attributes: ['id', 'name']
      });
      const ids = reopenStatuses.map(s => s.id);
      const count = ids.length > 0 ? await Defect.count({ where: { project_id: projectId, is_active: true, defect_status_id: ids } }) : 0;
      res.status(200).json({ success: true, message: 'Reopen count summary retrieved successfully', data: { reopenCount: count } });
    } catch (error) { next(error); }
  }

  // GET /api/dashboard/defect-density/:projectId
  async getDefectDensity(req, res, next) {
    try {
      const { projectId } = req.params;
      const { Module } = require('../models');
      const defects = await Defect.count({ where: { project_id: projectId, is_active: true } });
      const modules = await Module.count({ where: { project_id: projectId, is_active: true } });
      const density = modules > 0 ? Number((defects / modules).toFixed(2)) : Number(defects.toFixed(2));
      res.status(200).json({ success: true, message: 'Defect density calculated successfully', data: { defectDensity: density } });
    } catch (error) { next(error); }
  }

  // GET /api/dashboard/project-card-color/:projectId
  async getProjectCardColor(req, res, next) {
    try {
      const { projectId } = req.params;
      // Compute DSI to determine color
      const dsiRes = await computeDSIInternal(projectId);
      const pct = dsiRes.dsiPercentage;
      let projectCardColor = 'bg-gradient-to-r from-emerald-600 to-emerald-800'; // green
      if (pct >= 67) projectCardColor = 'bg-gradient-to-r from-red-600 to-red-800';
      else if (pct >= 34) projectCardColor = 'bg-gradient-to-r from-amber-500 to-amber-700';
      res.status(200).json({ success: true, message: 'Project card color determined', data: { projectCardColor, basis: { dsiPercentage: pct } } });
    } catch (error) { next(error); }
  }

}

module.exports = new DashboardController();

