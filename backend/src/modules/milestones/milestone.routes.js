const router = require('express').Router();
const ctrl = require('./milestone.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/:internId', ctrl.getMilestones);
router.get('/:internId/stats', ctrl.getMilestoneStats);
router.patch('/:id', ctrl.updateMilestone);

module.exports = router;
