const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HOLIDAY'], required: true },
  source: { type: String, enum: ['STANDUP', 'MANUAL', 'SYSTEM'], default: 'SYSTEM' },
  standupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standup', default: null },
}, { timestamps: true });

attendanceSchema.index({ internId: 1, date: -1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
