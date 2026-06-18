const mongoose = require('mongoose');

const ASSIGNMENT_STATES = ['UNASSIGNED', 'MANAGER_ASSIGNED', 'TECHLEAD_ASSIGNED', 'BUDDY_ASSIGNED', 'ACTIVE'];

const historySchema = new mongoose.Schema({
  field: { type: String, enum: ['managerId', 'techLeadId', 'buddyId'], required: true },
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  at: { type: Date, default: Date.now },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true, unique: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  techLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  buddyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  state: { type: String, enum: ASSIGNMENT_STATES, default: 'UNASSIGNED' },
  history: { type: [historySchema], default: [] },
}, { timestamps: true });

assignmentSchema.index({ managerId: 1, state: 1 });
assignmentSchema.index({ techLeadId: 1, state: 1 });
assignmentSchema.index({ buddyId: 1, state: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
module.exports.ASSIGNMENT_STATES = ASSIGNMENT_STATES;
