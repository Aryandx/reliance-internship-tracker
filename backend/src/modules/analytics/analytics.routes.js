const router = require('express').Router();
const ctrl = require('./analytics.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/dashboard/manager', authorize('MANAGER', 'TECH_LEAD'), ctrl.getManagerDashboard);
router.get('/dashboard/intern', authorize('INTERN'), ctrl.getInternDashboard);
router.get('/dashboard/hr', authorize('HR', 'MANAGER', 'TECH_LEAD'), ctrl.getHRDashboard);
router.get('/dashboard/buddy', authorize('BUDDY'), ctrl.getBuddyDashboard);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/read-all', ctrl.markAllRead);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);

module.exports = router;
