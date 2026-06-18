const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
  appliesTo: { type: String, default: 'ALL' },
}, { timestamps: true });

holidaySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
