const router = require('express').Router();
const svc = require('./attendance.service');
const Holiday = require('../holidays/holiday.model');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/intern/:internId', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await svc.getAttendance(req.params.internId, from, to);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/compliance/:internId', async (req, res, next) => {
  try {
    const data = await svc.getCompliance(req.params.internId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:internId/:date', authorize('HR'), async (req, res, next) => {
  try {
    const data = await svc.manualCorrection(req.params.internId, req.params.date, req.body.status);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/holidays', async (req, res, next) => {
  try {
    const data = await Holiday.find().sort({ date: 1 }).lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/holidays', authorize('HR'), async (req, res, next) => {
  try {
    const data = await Holiday.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
