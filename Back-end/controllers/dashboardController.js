const { Sequelize } = require('sequelize');
const { Defect, Severity, DefectStatus, DefectHistory } = require('../models');

// Helper function to compute DSI using severity.weight and highest possible weight
const computeDSIInternal = async (projectId) => {
  const Op = require('sequelize').Op;
  const statuses = ['NEW', 'OPEN', 'FIXED', 'CLOSED', 'REOPEN', 'HOLD'];
  const rows = await Defect.findAll({
    where: { project_id: projectId, is_active: true },
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
    include: [
      { model: Severity, as: 'severity', attributes: ['name', 'weight'], required: true },
      { model: DefectStatus, as: 'defectStatus', attributes: [], required: true, where: { name: { [Op.in]: statuses } } }
    ],
    group: ['severity.name', 'severity.weight'],
    raw: true
  });

  const highestWeight = (await Severity.max('weight', { where: { is_active: true } })) || 1;
  let total = 0; let weighted = 0;
  rows.forEach(r => { const w = parseInt(r['severity.weight'], 10) || 1; const c = parseInt(r['count'], 10) || 0; total += c; weighted += c * w; });
  const max = total * highestWeight; const dsiPercentage = max > 0 ? Number(((weighted / max) * 100).toFixed(2)) : 0;
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
      const Op = require('sequelize').Op;
      const statuses = ['NEW', 'OPEN', 'FIXED', 'CLOSED', 'REOPEN', 'HOLD'];
      const rows = await Defect.findAll({
      
        where: { project_id: projectId, is_active: true },
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Defect.id')), 'count']],
        include: [
          { model: Severity, as: 'severity', attributes: ['name', 'level', 'weight'], required: true },
          { model: DefectStatus, as: 'defectStatus', attributes: [], required: true, where: { name: { [Op.in]: statuses } } }
        ],
        group: ['severity.name', 'severity.level', 'severity.weight'],
        raw: true
      });

      let total = 0;
      let weighted = 0;
      rows.forEach(r => {
        const weight = parseInt(r['severity.weight'], 10) || 1;
        const count = parseInt(r['count'], 10) || 0;
        total += count;
        weighted += count * weight;
      });

      const highestWeight = (await Severity.max('weight', { where: { is_active: true } })) || 1;
      const max = total * highestWeight;
      const dsiPercentage = max > 0 ? Number(((weighted / max) * 100).toFixed(2)) : 0;
      // Color bands for DSI:
      // 0 - 25   -> green (Low Risk)
      // 26 - 50  -> yellow (Medium Risk)
      // 51 - 100 -> red (High Risk)
      let interpretation = 'Low Risk';
      let color = 'green';
      if (dsiPercentage >= 51) { interpretation = 'High Risk'; color = 'red'; }
      else if (dsiPercentage >= 26) { interpretation = 'Medium Risk'; color = 'yellow'; }

      res.status(200).json({
        success: true,
        message: 'DSI calculated successfully',
        data: { dsiPercentage, interpretation, color }
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
      // remark means total defects in the project
      const totalDefectsAll = await Defect.count({ where: { project_id: projectId, is_active: true } });

      // defects means count by statuses: NEW, OPEN, FIXED, CLOSED, REOPEN, HOLD
      const statuses = ['NEW', 'OPEN', 'FIXED', 'CLOSED', 'REOPEN', 'HOLD'];
      const Op = require('sequelize').Op;
      const totalDefectsSelected = await Defect.count({
        where: { project_id: projectId, is_active: true },
        include: [{
          model: DefectStatus,
          as: 'defectStatus',
          where: { name: { [Op.in]: statuses } },
          attributes: []
        }]
      });

      // ratio = (defects / remark) * 100
      // remark = total defects; defects = selected-status defects
      const ratioNum = totalDefectsAll > 0 ? Number(((totalDefectsSelected / totalDefectsAll) * 100).toFixed(2)) : 0;
      let category = 'low';
      let color = 'green';
      if (ratioNum >= 90 && ratioNum <= 98) { category = 'medium'; color = 'yellow'; }
      else if (ratioNum < 90) { category = 'high'; color = 'red'; }

      res.status(200).json({ success: true, message: 'Defect to remark ratio calculated', data: { ratio: `${ratioNum}%`, category, color, totals: { defects: totalDefectsSelected, remarks: totalDefectsAll } } });
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

  // GET /api/dashboard/reopen-multiple-summary/:projectId
  async getReopenMultipleSummary(req, res, next) {
    try {
      const { projectId } = req.params;
      // Find all reopen transitions in history for defects of this project
      const historyRows = await DefectHistory.findAll({
        attributes: [
          'defect_id',
          [Sequelize.fn('COUNT', Sequelize.col('DefectHistory.id')), 'reopenCount']
        ],
        include: [{
          model: Defect,
          as: 'defect',
          attributes: [],
          where: { project_id: projectId, is_active: true }
        }],
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('new_value')),
          { [require('sequelize').Op.like]: '%reopen%'
          }
        ),
        group: ['defect_id'],
        raw: true
      });

      // Bucketize counts: 1,2,3,4,5,5+
      const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '5+': 0 };
      historyRows.forEach(r => {
        const c = parseInt(r.reopenCount, 10) || 0;
        if (c <= 0) return;
        if (c >= 6) buckets['5+'] += 1;
        else if (c >= 5) buckets[5] += 1;
        else buckets[c] += 1;
      });

      const data = [1,2,3,4,5].map(n => ({ label: `${n} ${n === 1 ? 'time' : 'times'}`, count: buckets[n] }))
        .concat([{ label: '5+ times', count: buckets['5+'] }]);

      res.status(200).json({ status: 'OK', message: 'Retrieved successfully.', data, statusCode: 2000 });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/defect-density/:projectId
  async getDefectDensity(req, res, next) {
    try {
      const { projectId } = req.params;
      const { Project } = require('../models');
      const defects = await Defect.count({ where: { project_id: projectId, is_active: true } });
      const project = await Project.findByPk(projectId, { attributes: ['id', 'kloc'] });

      const klocRaw = project?.kloc;
      const kloc = klocRaw !== null && klocRaw !== undefined ? Number(klocRaw) : null;
      const density = kloc && kloc > 0 ? Number((defects / kloc).toFixed(2)) : null;

      let category = null;
      let color = null;
      if (density !== null) {
        if (density <= 1) { category = 'Good'; color = 'green'; }
        else if (density <= 5) { category = 'Moderate Quality'; color = 'yellow'; }
        else { category = 'High Risk'; color = 'red'; }
      }

      res.status(200).json({
        success: true,
        message: 'Defect density calculated successfully',
        data: {
          defectDensity: density,
          sizeMetricKLOC: kloc,
          totals: { defects },
          category,
          color
        }
      });
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

