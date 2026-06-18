const mongoose = require('mongoose');

const internSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  employeeCode: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  department: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['ONBOARDING', 'ACTIVE', 'COMPLETED', 'TERMINATED'],
    default: 'ONBOARDING',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // extended fields kept for richer profiles
  stream: { type: String, trim: true },
  domain: { type: String, trim: true },
  university: { type: String, trim: true },
  notes: { type: String },
}, { timestamps: true });

internSchema.index({ status: 1, department: 1 });

internSchema.virtual('assignment', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'internId',
  justOne: true,
});

module.exports = mongoose.model('Intern', internSchema);
