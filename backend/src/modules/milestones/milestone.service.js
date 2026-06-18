const Milestone = require('./milestone.model');

const getMilestones = async (internId) => {
  return Milestone.find({ internId }).sort({ order: 1 }).lean();
};

const updateMilestone = async (id, data) => {
  const allowed = ['status', 'completedDate', 'notes'];
  const update = {};
  allowed.forEach((k) => { if (data[k] !== undefined) update[k] = data[k]; });
  if (data.status === 'Completed' && !data.completedDate) update.completedDate = new Date();

  const m = await Milestone.findByIdAndUpdate(id, update, { new: true });
  if (!m) throw Object.assign(new Error('Milestone not found'), { status: 404 });
  return m;
};

const getMilestoneStats = async (internId) => {
  const milestones = await Milestone.find({ internId }).lean();
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'Completed').length;
  const overdue = milestones.filter(
    (m) => m.status !== 'Completed' && m.dueDate && new Date(m.dueDate) < new Date()
  ).length;
  return { total, completed, overdue, inProgress: total - completed - overdue };
};

module.exports = { getMilestones, updateMilestone, getMilestoneStats };
