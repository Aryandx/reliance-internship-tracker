const Assignment = require('./assignment.model');
const Notification = require('../notifications/notification.model');
const AuditLog = require('../audit/auditLog.model');

const populate = (q) => q
  .populate('internId', 'name email employeeCode')
  .populate('managerId', 'name email role')
  .populate('techLeadId', 'name email role')
  .populate('buddyId', 'name email role');

const getAssignment = async (internId) => {
  const a = await populate(Assignment.findOne({ internId }));
  if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });
  return a;
};

const assignManager = async (internId, managerId, actorUser) => {
  const a = await Assignment.findOne({ internId });
  if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });

  a.history.push({ field: 'managerId', fromId: a.managerId, toId: managerId, byUserId: actorUser._id });
  a.managerId = managerId;
  a.state = 'MANAGER_ASSIGNED';
  await a.save();

  await Notification.create({
    userId: managerId,
    type: 'ASSIGNMENT',
    title: 'You have been assigned an intern',
    body: `You are now the Manager for intern ${internId}`,
    link: `/interns/${internId}`,
  });

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'MANAGER_ASSIGNED', entity: 'assignments', entityId: a._id,
    before: { managerId: null }, after: { managerId }, meta: { internId },
  });

  return populate(Assignment.findById(a._id));
};

const assignTechLead = async (internId, techLeadId, actorUser) => {
  const a = await Assignment.findOne({ internId });
  if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });

  if (!['MANAGER_ASSIGNED', 'TECHLEAD_ASSIGNED', 'BUDDY_ASSIGNED', 'ACTIVE'].includes(a.state)) {
    throw Object.assign(new Error('Manager must be assigned before Tech Lead'), { status: 409 });
  }
  // Only the assigned manager can assign a tech lead (or HR)
  if (actorUser.role === 'MANAGER' && String(a.managerId) !== String(actorUser._id)) {
    throw Object.assign(new Error('You can only assign Tech Leads for your own interns'), { status: 403 });
  }

  a.history.push({ field: 'techLeadId', fromId: a.techLeadId, toId: techLeadId, byUserId: actorUser._id });
  a.techLeadId = techLeadId;
  a.state = a.buddyId ? 'ACTIVE' : 'TECHLEAD_ASSIGNED';
  await a.save();

  await Notification.create({
    userId: techLeadId,
    type: 'ASSIGNMENT',
    title: 'You have been assigned as Tech Lead',
    body: `You are now the Tech Lead for intern ${internId}`,
    link: `/interns/${internId}`,
  });

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'TECHLEAD_ASSIGNED', entity: 'assignments', entityId: a._id,
    after: { techLeadId }, meta: { internId },
  });

  return populate(Assignment.findById(a._id));
};

const assignBuddy = async (internId, buddyId, actorUser) => {
  const a = await Assignment.findOne({ internId });
  if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });

  if (!['TECHLEAD_ASSIGNED', 'BUDDY_ASSIGNED', 'ACTIVE'].includes(a.state)) {
    throw Object.assign(new Error('Tech Lead must be assigned before Buddy'), { status: 409 });
  }
  if (actorUser.role === 'TECH_LEAD' && String(a.techLeadId) !== String(actorUser._id)) {
    throw Object.assign(new Error('You can only assign Buddies for your own interns'), { status: 403 });
  }

  a.history.push({ field: 'buddyId', fromId: a.buddyId, toId: buddyId, byUserId: actorUser._id });
  a.buddyId = buddyId;
  a.state = 'ACTIVE';
  await a.save();

  await Notification.create({
    userId: buddyId,
    type: 'ASSIGNMENT',
    title: 'You have a new mentee',
    body: `You are now the Buddy for intern ${internId}`,
    link: `/interns/${internId}`,
  });

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'BUDDY_ASSIGNED', entity: 'assignments', entityId: a._id,
    after: { buddyId }, meta: { internId },
  });

  return populate(Assignment.findById(a._id));
};

const getMyAssignments = async (userId, role) => {
  let filter = {};
  if (role === 'MANAGER') filter = { managerId: userId };
  else if (role === 'TECH_LEAD') filter = { techLeadId: userId };
  else if (role === 'BUDDY') filter = { buddyId: userId };
  return populate(Assignment.find(filter));
};

const getAllAssignments = async () =>
  populate(Assignment.find());

module.exports = { getAssignment, assignManager, assignTechLead, assignBuddy, getMyAssignments, getAllAssignments };
