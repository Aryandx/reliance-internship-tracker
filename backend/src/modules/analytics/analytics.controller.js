const Intern = require('../interns/intern.model');
const Standup = require('../standups/standup.model');
const Milestone = require('../milestones/milestone.model');
const Assignment = require('../assignments/assignment.model');
const Notification = require('../notifications/notification.model');
const Review = require('../reviews/review.model');
const { getCompliance } = require('../attendance/attendance.service');

const getManagerDashboard = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ managerId: req.user._id }).select('internId');
    const internIds = assignments.map((a) => a.internId);

    const [total, active, standupCount, milestones] = await Promise.all([
      Intern.countDocuments({ _id: { $in: internIds } }),
      Intern.countDocuments({ _id: { $in: internIds }, status: 'ACTIVE' }),
      Standup.countDocuments({ internId: { $in: internIds } }),
      Milestone.find({ internId: { $in: internIds } }).lean(),
    ]);

    const completedMs = milestones.filter((m) => m.status === 'Completed').length;
    const overdueMs = milestones.filter(
      (m) => m.status !== 'Completed' && m.dueDate && new Date(m.dueDate) < new Date()
    ).length;

    const [recentInterns, recentStandups] = await Promise.all([
      Intern.find({ _id: { $in: internIds } }).sort({ createdAt: -1 }).limit(5).lean(),
      Standup.find({ internId: { $in: internIds } }).populate('internId', 'name').sort({ date: -1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      data: { totalInterns: total, activeInterns: active, standupCount, milestonesCompleted: completedMs, milestonesOverdue: overdueMs, recentInterns, recentStandups }
    });
  } catch (err) { next(err); }
};

const getInternDashboard = async (req, res, next) => {
  try {
    const intern = await Intern.findOne({ email: req.user.email }).lean();

    if (!intern) return res.json({ success: true, data: { hasProfile: false } });

    const [standups, milestones, assignment, compliance] = await Promise.all([
      Standup.find({ internId: intern._id }).sort({ date: -1 }).limit(7).lean(),
      Milestone.find({ internId: intern._id }).sort({ order: 1 }).lean(),
      Assignment.findOne({ internId: intern._id })
        .populate('managerId', 'name email')
        .populate('techLeadId', 'name email')
        .populate('buddyId', 'name email')
        .lean(),
      getCompliance(intern._id).catch(() => null),
    ]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStandup = standups.find((s) => new Date(s.date) >= today);
    const completedMs = milestones.filter((m) => m.status === 'Completed').length;

    res.json({
      success: true,
      data: {
        hasProfile: true,
        intern,
        assignment,
        compliance,
        standupCount: standups.length,
        todayStandupSubmitted: !!todayStandup,
        milestonesCompleted: completedMs,
        totalMilestones: milestones.length,
        progressPercent: milestones.length ? Math.round((completedMs / milestones.length) * 100) : 0,
        recentStandups: standups.slice(0, 5),
        upcomingMilestones: milestones.filter((m) => m.status !== 'Completed').slice(0, 3),
      }
    });
  } catch (err) { next(err); }
};

const getHRDashboard = async (req, res, next) => {
  try {
    const [total, active, onboarding, completed, terminated] = await Promise.all([
      Intern.countDocuments(),
      Intern.countDocuments({ status: 'ACTIVE' }),
      Intern.countDocuments({ status: 'ONBOARDING' }),
      Intern.countDocuments({ status: 'COMPLETED' }),
      Intern.countDocuments({ status: 'TERMINATED' }),
    ]);

    const [recentInterns, reviewsPending] = await Promise.all([
      Intern.find().sort({ createdAt: -1 }).limit(5).lean(),
      Review.countDocuments({ state: 'HR_FINAL' }),
    ]);

    res.json({
      success: true,
      data: { total, active, onboarding, completed, terminated, recentInterns, reviewsPending }
    });
  } catch (err) { next(err); }
};

const getBuddyDashboard = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ buddyId: req.user._id }).select('internId');
    const internIds = assignments.map((a) => a.internId);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayStandups, pending, breached] = await Promise.all([
      internIds.length,
      Standup.countDocuments({ internId: { $in: internIds }, date: { $gte: today } }),
      Standup.countDocuments({ buddyId: req.user._id, slaStatus: 'PENDING' }),
      Standup.countDocuments({ buddyId: req.user._id, slaStatus: 'BREACHED_OPEN' }),
    ]);

    const recentStandups = await Standup.find({ buddyId: req.user._id })
      .populate('internId', 'name email')
      .sort({ date: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: { totalMentees: total, todayStandups, pendingReplies: pending, slaBreaches: breached, recentStandups }
    });
  } catch (err) { next(err); }
};

const getNotifications = async (req, res, next) => {
  try {
    const { read } = req.query;
    const filter = { userId: req.user._id };
    if (read !== undefined) filter.read = read === 'true';
    const notes = await Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, data: notes, unreadCount });
  } catch (err) { next(err); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = {
  getManagerDashboard, getInternDashboard, getHRDashboard, getBuddyDashboard,
  getNotifications, markNotificationRead, markAllRead
};
