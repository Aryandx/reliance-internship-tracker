const internService = require('./intern.service');

const createIntern = async (req, res, next) => {
  try {
    const intern = await internService.createIntern(req.body, req.user);
    res.status(201).json({ success: true, data: intern });
  } catch (err) { next(err); }
};

const getAllInterns = async (req, res, next) => {
  try {
    const result = await internService.getAllInterns(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getInternById = async (req, res, next) => {
  try {
    const intern = await internService.getInternById(req.params.id);
    res.json({ success: true, data: intern });
  } catch (err) { next(err); }
};

const updateIntern = async (req, res, next) => {
  try {
    const intern = await internService.updateIntern(req.params.id, req.body, req.user);
    res.json({ success: true, data: intern });
  } catch (err) { next(err); }
};

const updateInternStatus = async (req, res, next) => {
  try {
    const intern = await internService.updateInternStatus(req.params.id, req.body.status, req.user);
    res.json({ success: true, data: intern });
  } catch (err) { next(err); }
};

const deleteIntern = async (req, res, next) => {
  try {
    await internService.deleteIntern(req.params.id);
    res.json({ success: true, message: 'Intern deleted' });
  } catch (err) { next(err); }
};

const getMyInterns = async (req, res, next) => {
  try {
    const interns = await internService.getInternsByUser(req.user._id, req.user.role);
    res.json({ success: true, data: interns });
  } catch (err) { next(err); }
};

module.exports = { createIntern, getAllInterns, getInternById, updateIntern, updateInternStatus, deleteIntern, getMyInterns };
