const bcrypt = require('bcryptjs');
const Intern = require('./intern.model');
const Assignment = require('../assignments/assignment.model');
const Milestone = require('../milestones/milestone.model');
const User = require('../users/user.model');
const AuditLog = require('../audit/auditLog.model');

const MILESTONE_TEMPLATES = [
  { phase: 'Onboarding', title: 'Complete Day 1 induction checklist', weekOffset: 0, ownerRole: 'Intern', order: 1 },
  { phase: 'Onboarding', title: 'Setup development environment', weekOffset: 0, ownerRole: 'Buddy', order: 2 },
  { phase: 'Onboarding', title: 'Submit first standup', weekOffset: 1, ownerRole: 'Intern', order: 3 },
  { phase: 'Development', title: 'Complete assigned feature with TDD', weekOffset: 2, ownerRole: 'Intern', order: 4 },
  { phase: 'Development', title: 'First PR review passed', weekOffset: 3, ownerRole: 'Intern', order: 5 },
  { phase: 'Development', title: 'Mid-point check-in with Manager', weekOffset: 4, ownerRole: 'Manager', order: 6 },
  { phase: 'Development', title: 'Group session participation (4 sessions)', weekOffset: 5, ownerRole: 'Intern', order: 7 },
  { phase: 'Delivery', title: 'Mini demo completed', weekOffset: 6, ownerRole: 'Intern', order: 8 },
  { phase: 'Closure', title: 'Final presentation delivered', weekOffset: 7, ownerRole: 'Intern', order: 9 },
  { phase: 'Closure', title: 'Exit survey submitted', weekOffset: 8, ownerRole: 'Intern', order: 10 },
];

const generateMilestones = async (internId, startDate) => {
  const milestones = MILESTONE_TEMPLATES.map((t) => {
    const due = new Date(startDate);
    due.setDate(due.getDate() + t.weekOffset * 7);
    return { internId, ...t, dueDate: due };
  });
  await Milestone.insertMany(milestones);
};

let _empCodeCounter = null;
const nextEmployeeCode = async () => {
  if (_empCodeCounter === null) {
    const last = await Intern.findOne({}, { employeeCode: 1 }).sort({ createdAt: -1 });
    const match = last?.employeeCode?.match(/(\d+)$/);
    _empCodeCounter = match ? parseInt(match[1]) : 0;
  }
  _empCodeCounter += 1;
  return `INT-${new Date().getFullYear()}-${String(_empCodeCounter).padStart(3, '0')}`;
};

const createIntern = async (data, actorUser) => {
  const employeeCode = data.employeeCode || await nextEmployeeCode();
  const startDate = new Date(data.startDate);
  const endDate = data.endDate ? new Date(data.endDate) : (() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (data.programDuration || 8) * 7);
    return d;
  })();

  // Create INTERN login user if not provided
  let userId = data.userId;
  if (!userId) {
    const tempPassword = await bcrypt.hash('Welcome@123', 10);
    const loginUser = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: tempPassword,
      role: 'INTERN',
    });
    userId = loginUser._id;
  }

  const intern = await Intern.create({
    userId,
    employeeCode,
    name: data.name,
    email: data.email,
    phone: data.phone,
    department: data.department,
    startDate,
    endDate,
    status: 'ONBOARDING',
    createdBy: actorUser._id,
    stream: data.stream,
    domain: data.domain,
    university: data.university,
    notes: data.notes,
  });

  await Assignment.create({ internId: intern._id });
  await generateMilestones(intern._id, startDate);

  await AuditLog.create({
    actorId: actorUser._id,
    actorRole: actorUser.role,
    action: 'INTERN_CREATED',
    entity: 'interns',
    entityId: intern._id,
    after: { name: intern.name, email: intern.email, employeeCode },
    ip: '',
  });

  return intern;
};

const getAllInterns = async (filters = {}, user) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.department) query.department = filters.department;
  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: 'i' } },
      { email: { $regex: filters.q, $options: 'i' } },
    ];
  }

  // Scope by role
  if (user.role === 'MANAGER') {
    const assignments = await Assignment.find({ managerId: user._id }).select('internId');
    query._id = { $in: assignments.map((a) => a.internId) };
  } else if (user.role === 'TECH_LEAD') {
    const assignments = await Assignment.find({ techLeadId: user._id }).select('internId');
    query._id = { $in: assignments.map((a) => a.internId) };
  } else if (user.role === 'BUDDY') {
    const assignments = await Assignment.find({ buddyId: user._id }).select('internId');
    query._id = { $in: assignments.map((a) => a.internId) };
  } else if (user.role === 'INTERN') {
    const intern = await Intern.findOne({ email: user.email });
    query._id = intern?._id;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Intern.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Intern.countDocuments(query),
  ]);

  return { data, meta: { page, limit, total } };
};

const getInternById = async (id) => {
  const intern = await Intern.findById(id).lean();
  if (!intern) throw Object.assign(new Error('Intern not found'), { status: 404 });

  const assignment = await Assignment.findOne({ internId: id })
    .populate('managerId', 'name email role')
    .populate('techLeadId', 'name email role')
    .populate('buddyId', 'name email role')
    .lean();

  return { ...intern, assignment };
};

const updateIntern = async (id, data, actorUser) => {
  const before = await Intern.findById(id).lean();
  if (!before) throw Object.assign(new Error('Intern not found'), { status: 404 });

  const intern = await Intern.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  await AuditLog.create({
    actorId: actorUser._id,
    actorRole: actorUser.role,
    action: 'INTERN_UPDATED',
    entity: 'interns',
    entityId: id,
    before: { name: before.name, status: before.status },
    after: { name: intern.name, status: intern.status },
  });

  return intern;
};

const updateInternStatus = async (id, status, actorUser) => {
  const intern = await Intern.findByIdAndUpdate(id, { status }, { new: true });
  if (!intern) throw Object.assign(new Error('Intern not found'), { status: 404 });
  return intern;
};

const deleteIntern = async (id) => {
  const intern = await Intern.findByIdAndDelete(id);
  if (!intern) throw Object.assign(new Error('Intern not found'), { status: 404 });
  await Assignment.deleteOne({ internId: id });
  await Milestone.deleteMany({ internId: id });
};

const getInternsByUser = async (userId, role) => {
  let filter = {};
  if (role === 'MANAGER') filter = { managerId: userId };
  else if (role === 'TECH_LEAD') filter = { techLeadId: userId };
  else if (role === 'BUDDY') filter = { buddyId: userId };
  else return [];

  const assignments = await Assignment.find(filter).lean();
  const internIds = assignments.map((a) => a.internId);
  return Intern.find({ _id: { $in: internIds } }).lean();
};

module.exports = {
  createIntern, getAllInterns, getInternById, updateIntern, updateInternStatus, deleteIntern, getInternsByUser
};
