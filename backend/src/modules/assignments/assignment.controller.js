const svc = require('./assignment.service');

const getAllAssignments = async (req, res, next) => {
  try {
    const data = await svc.getAllAssignments();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getAssignment = async (req, res, next) => {
  try {
    const data = await svc.getAssignment(req.params.internId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const assignManager = async (req, res, next) => {
  try {
    const data = await svc.assignManager(req.params.internId, req.body.managerId, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const assignTechLead = async (req, res, next) => {
  try {
    const data = await svc.assignTechLead(req.params.internId, req.body.techLeadId, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const assignBuddy = async (req, res, next) => {
  try {
    const data = await svc.assignBuddy(req.params.internId, req.body.buddyId, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyAssignments = async (req, res, next) => {
  try {
    const data = await svc.getMyAssignments(req.user._id, req.user.role);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAllAssignments, getAssignment, assignManager, assignTechLead, assignBuddy, getMyAssignments };
