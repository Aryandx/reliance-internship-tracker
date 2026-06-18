const router = require('express').Router();
const AuditLog = require('./auditLog.model');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize('HR'));

router.get('/', async (req, res, next) => {
  try {
    const { entity, entityId, actorId, action, from, to, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;
    if (actorId) filter.actorId = actorId;
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      AuditLog.find(filter).populate('actorId', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ success: true, data, meta: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { next(err); }
});

router.get('/entity/:entity/:entityId', async (req, res, next) => {
  try {
    const data = await AuditLog.find({ entity: req.params.entity, entityId: req.params.entityId })
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
