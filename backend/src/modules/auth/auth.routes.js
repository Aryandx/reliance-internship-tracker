const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' } },
});

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/refresh', authLimiter, ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.patch('/profile', authenticate, ctrl.updateProfile);
router.get('/users', authenticate, ctrl.getUsers);

module.exports = router;
