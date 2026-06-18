const Standup = require('./standup.model');
const Assignment = require('../assignments/assignment.model');
const Attendance = require('../attendance/attendance.model');
const Notification = require('../notifications/notification.model');
const AuditLog = require('../audit/auditLog.model');
const Intern = require('../interns/intern.model');

const SLA_MINUTES = parseInt(process.env.SLA_REPLY_MINUTES) || 120;

// Returns IST midnight for a given date
const istMidnight = (d = new Date()) => {
  const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setHours(0, 0, 0, 0);
  return ist;
};

const computeSla = (submittedAt, repliedAt) => {
  const minutes = Math.round((new Date(repliedAt) - new Date(submittedAt)) / 60000);
  return { status: minutes <= SLA_MINUTES ? 'MET' : 'BREACHED', minutes };
};

const createStandup = async (internId, data, actorUser) => {
  const date = istMidnight();
  const existing = await Standup.findOne({ internId, date });
  if (existing) throw Object.assign(new Error('Standup already submitted for today'), { status: 409 });

  const assignment = await Assignment.findOne({ internId });
  if (!assignment?.buddyId) throw Object.assign(new Error('No buddy assigned yet'), { status: 400 });

  const standup = await Standup.create({
    internId,
    buddyId: assignment.buddyId,
    date,
    yesterday: data.yesterday,
    today: data.today,
    blockers: data.blockers || '',
    submittedAt: new Date(),
    slaStatus: 'PENDING',
  });

  // Derive attendance
  await Attendance.findOneAndUpdate(
    { internId, date },
    { internId, date, status: 'PRESENT', source: 'STANDUP', standupId: standup._id },
    { upsert: true, new: true }
  );

  // Notify buddy if blocker
  if (data.blockers) {
    await Notification.create({
      userId: assignment.buddyId,
      type: 'SYSTEM',
      title: 'Intern has a blocker',
      body: `${actorUser.name} reported: ${data.blockers.substring(0, 100)}`,
      link: `/standups/${standup._id}`,
    });
  }

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'STANDUP_SUBMITTED', entity: 'standups', entityId: standup._id,
    after: { date, internId }, meta: { hasBlocker: !!data.blockers },
  });

  return standup;
};

const getMyStandups = async (internId) =>
  Standup.find({ internId })
    .sort({ date: -1 })
    .limit(50)
    .lean();

const getFeedForBuddy = async (buddyId) =>
  Standup.find({ buddyId })
    .populate('internId', 'name email employeeCode')
    .sort({ date: -1 })
    .limit(100)
    .lean();

const getPendingForBuddy = async (buddyId) =>
  Standup.find({ buddyId, slaStatus: 'PENDING' })
    .populate('internId', 'name email')
    .sort({ submittedAt: 1 })
    .lean();

const replyToStandup = async (standupId, buddyId, text, actorUser) => {
  const standup = await Standup.findById(standupId);
  if (!standup) throw Object.assign(new Error('Standup not found'), { status: 404 });
  if (standup.reply) throw Object.assign(new Error('Already replied'), { status: 409 });

  const repliedAt = new Date();
  const { status, minutes } = computeSla(standup.submittedAt, repliedAt);

  standup.reply = { buddyId, text, repliedAt };
  standup.slaStatus = status;
  standup.responseMinutes = minutes;
  await standup.save();

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'STANDUP_REPLIED', entity: 'standups', entityId: standup._id,
    after: { slaStatus: status, responseMinutes: minutes },
  });

  return standup;
};

const getStandupById = async (id) => {
  const s = await Standup.findById(id).populate('internId', 'name email').lean();
  if (!s) throw Object.assign(new Error('Standup not found'), { status: 404 });
  return s;
};

// Called by cron: mark PENDING standups past SLA window as BREACHED_OPEN
const sweepSlaBreaches = async () => {
  const cutoff = new Date(Date.now() - SLA_MINUTES * 60 * 1000);
  const breached = await Standup.find({
    slaStatus: 'PENDING',
    submittedAt: { $lt: cutoff },
  });

  for (const s of breached) {
    s.slaStatus = 'BREACHED_OPEN';
    await s.save();

    await Notification.create({
      userId: s.buddyId,
      type: 'SLA_BREACH',
      title: 'Standup reply overdue',
      body: `A standup is awaiting your reply for more than ${SLA_MINUTES} minutes.`,
      link: `/standups/${s._id}`,
    });
  }
  return breached.length;
};

module.exports = { createStandup, getMyStandups, getFeedForBuddy, getPendingForBuddy, replyToStandup, getStandupById, sweepSlaBreaches, computeSla };
