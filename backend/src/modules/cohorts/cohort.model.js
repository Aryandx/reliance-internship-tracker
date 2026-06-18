const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  defaultStartDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Upcoming', 'Active', 'Completed'], default: 'Active' },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Cohort', cohortSchema);
