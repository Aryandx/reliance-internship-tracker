const mongoose = require('mongoose');

const NOTIFICATION_TYPES = ['ASSIGNMENT', 'SLA_BREACH', 'REVIEW_STAGE', 'REVIEW_PUBLISHED', 'SYSTEM'];

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
