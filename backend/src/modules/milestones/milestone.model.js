const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  phase: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  completedDate: { type: Date },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
    default: 'Not Started'
  },
  ownerRole: { type: String, enum: ['Intern', 'Buddy', 'Manager', 'Tech Lead', 'HR'] },
  weekOffset: { type: Number },
  order: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
