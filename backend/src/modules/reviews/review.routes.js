const router = require('express').Router();
const ctrl = require('./review.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/inbox', authorize('TECH_LEAD', 'MANAGER', 'HR'), ctrl.getInbox);
router.get('/my', authorize('INTERN'), ctrl.getMyReviews);
router.get('/submitted', authorize('BUDDY'), ctrl.getBuddyReviews);
router.post('/', authorize('BUDDY'), ctrl.createReview);
router.get('/:id', ctrl.getReview);
router.patch('/:id/draft', authorize('BUDDY'), ctrl.updateDraft);
router.post('/:id/submit', authorize('BUDDY'), ctrl.submitReview);
router.post('/:id/forward', authorize('TECH_LEAD', 'MANAGER'), ctrl.forwardReview);
router.post('/:id/finalize', authorize('HR'), ctrl.finalizeReview);

module.exports = router;
