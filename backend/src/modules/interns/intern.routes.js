const router = require('express').Router();
const ctrl = require('./intern.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/my', authorize('MANAGER', 'TECH_LEAD', 'BUDDY'), ctrl.getMyInterns);
router.get('/', ctrl.getAllInterns);
router.post('/', authorize('HR', 'MANAGER'), ctrl.createIntern);
router.get('/:id', ctrl.getInternById);
router.patch('/:id', authorize('HR', 'MANAGER'), ctrl.updateIntern);
router.patch('/:id/status', authorize('HR'), ctrl.updateInternStatus);
router.delete('/:id', authorize('HR'), ctrl.deleteIntern);

module.exports = router;
