const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  buddyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  repliedAt: { type: Date, default: Date.now },
}, { _id: false });

const standupSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  buddyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  yesterday: { type: String, required: true, maxlength: 1000 },
  today: { type: String, required: true, maxlength: 1000 },
  blockers: { type: String, default: '', maxlength: 1000 },
  submittedAt: { type: Date, default: Date.now },
  reply: { type: replySchema, default: null },
  slaStatus: {
    type: String,
    enum: ['PENDING', 'MET', 'BREACHED', 'BREACHED_OPEN'],
    default: 'PENDING',
  },
  responseMinutes: { type: Number, default: null },
}, { timestamps: true });

standupSchema.index({ internId: 1, date: -1 }, { unique: true });
standupSchema.index({ buddyId: 1, slaStatus: 1, submittedAt: -1 });
standupSchema.index({ slaStatus: 1, submittedAt: 1 });

module.exports = mongoose.model('Standup', standupSchema);
