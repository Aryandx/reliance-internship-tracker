const svc = require('./standup.service');
const Intern = require('../interns/intern.model');

const createStandup = async (req, res, next) => {
  try {
    let internId = req.body.internId;
    if (!internId) {
      const intern = await Intern.findOne({ email: req.user.email });
      if (!intern) throw Object.assign(new Error('Intern profile not found'), { status: 404 });
      internId = intern._id;
    }
    const standup = await svc.createStandup(internId, req.body, req.user);
    res.status(201).json({ success: true, data: standup });
  } catch (err) { next(err); }
};

const getMyStandups = async (req, res, next) => {
  try {
    const intern = await Intern.findOne({ email: req.user.email });
    const data = intern ? await svc.getMyStandups(intern._id) : [];
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getFeed = async (req, res, next) => {
  try {
    const data = await svc.getFeedForBuddy(req.user._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getPending = async (req, res, next) => {
  try {
    const data = await svc.getPendingForBuddy(req.user._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getStandupById = async (req, res, next) => {
  try {
    const data = await svc.getStandupById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const replyToStandup = async (req, res, next) => {
  try {
    const data = await svc.replyToStandup(req.params.id, req.user._id, req.body.text, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { createStandup, getMyStandups, getFeed, getPending, getStandupById, replyToStandup };
