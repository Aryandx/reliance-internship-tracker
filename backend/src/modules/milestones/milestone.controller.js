const service = require('./milestone.service');

const getMilestones = async (req, res, next) => {
  try {
    const ms = await service.getMilestones(req.params.internId);
    res.json({ success: true, data: ms });
  } catch (err) { next(err); }
};

const updateMilestone = async (req, res, next) => {
  try {
    const m = await service.updateMilestone(req.params.id, req.body);
    res.json({ success: true, data: m });
  } catch (err) { next(err); }
};

const getMilestoneStats = async (req, res, next) => {
  try {
    const stats = await service.getMilestoneStats(req.params.internId);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { getMilestones, updateMilestone, getMilestoneStats };
