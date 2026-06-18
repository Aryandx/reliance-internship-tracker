const mongoose = require('mongoose');

const REVIEW_STATES = ['DRAFT', 'TL_REVIEW', 'MGR_REVIEW', 'HR_FINAL', 'PUBLISHED'];

const stageSchema = new mongoose.Schema({
  stage: { type: String, enum: ['TL_REVIEW', 'MGR_REVIEW', 'HR_FINAL'], required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, default: '' },
  enteredAt: { type: Date, default: Date.now },
  exitedAt: { type: Date, default: null },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  cycle: { type: String, required: true },
  authorBuddyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  draft: {
    strengths: { type: String, required: true },
    improvements: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    summary: { type: String, required: true },
  },
  stages: { type: [stageSchema], default: [] },
  state: { type: String, enum: REVIEW_STATES, default: 'DRAFT' },
  locked: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

reviewSchema.index({ internId: 1, cycle: 1 }, { unique: true });
reviewSchema.index({ state: 1, updatedAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
module.exports.REVIEW_STATES = REVIEW_STATES;
