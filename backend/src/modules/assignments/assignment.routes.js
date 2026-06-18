const router = require('express').Router();
const ctrl = require('./assignment.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/my', authorize('MANAGER', 'TECH_LEAD', 'BUDDY'), ctrl.getMyAssignments);
router.get('/', authorize('HR', 'MANAGER', 'TECH_LEAD'), ctrl.getAllAssignments);
router.get('/:internId', ctrl.getAssignment);
router.patch('/:internId/manager', authorize('HR'), ctrl.assignManager);
router.patch('/:internId/techlead', authorize('HR', 'MANAGER'), ctrl.assignTechLead);
router.patch('/:internId/buddy', authorize('HR', 'MANAGER', 'TECH_LEAD'), ctrl.assignBuddy);

module.exports = router;
