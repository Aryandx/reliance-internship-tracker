const router = require('express').Router();
const ctrl = require('./standup.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/feed', authorize('BUDDY', 'MANAGER', 'TECH_LEAD', 'HR'), ctrl.getFeed);
router.get('/pending', authorize('BUDDY'), ctrl.getPending);
router.get('/my', authorize('INTERN'), ctrl.getMyStandups);
router.post('/', authorize('INTERN'), ctrl.createStandup);
router.get('/:id', ctrl.getStandupById);
router.post('/:id/reply', authorize('BUDDY', 'MANAGER', 'TECH_LEAD'), ctrl.replyToStandup);

module.exports = router;
