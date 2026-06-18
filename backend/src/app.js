const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check — must be before auth middleware
app.get('/api/v1/health', (_, res) => {
  const mongoose = require('mongoose');
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', time: new Date(), db: dbState[mongoose.connection.readyState] || 'unknown' });
});
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() })); // backwards compat

// API v1 routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/interns', require('./modules/interns/intern.routes'));
app.use('/api/v1/assignments', require('./modules/assignments/assignment.routes'));
app.use('/api/v1/standups', require('./modules/standups/standup.routes'));
app.use('/api/v1/milestones', require('./modules/milestones/milestone.routes'));
app.use('/api/v1/reviews', require('./modules/reviews/review.routes'));
app.use('/api/v1/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/v1/audit', require('./modules/audit/audit.routes'));
app.use('/api/v1', require('./modules/analytics/analytics.routes'));

// Legacy /api routes (keep old frontend working during transition)
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/interns', require('./modules/interns/intern.routes'));
app.use('/api/assignments', require('./modules/assignments/assignment.routes'));
app.use('/api/standups', require('./modules/standups/standup.routes'));
app.use('/api/milestones', require('./modules/milestones/milestone.routes'));
app.use('/api/reviews', require('./modules/reviews/review.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/audit', require('./modules/audit/audit.routes'));
app.use('/api', require('./modules/analytics/analytics.routes'));

app.use(errorHandler);

module.exports = app;
