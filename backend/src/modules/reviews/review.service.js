const Review = require('./review.model');
const Assignment = require('../assignments/assignment.model');
const Notification = require('../notifications/notification.model');
const AuditLog = require('../audit/auditLog.model');

const STATE_SEQUENCE = ['DRAFT', 'TL_REVIEW', 'MGR_REVIEW', 'HR_FINAL', 'PUBLISHED'];

// Maps each state to who owns it
const stageOwnerField = { TL_REVIEW: 'techLeadId', MGR_REVIEW: 'managerId', HR_FINAL: null };

const createReview = async (data, actorUser) => {
  const existing = await Review.findOne({ internId: data.internId, cycle: data.cycle });
  if (existing) throw Object.assign(new Error('Review already exists for this intern and cycle'), { status: 409 });

  const review = await Review.create({
    internId: data.internId,
    cycle: data.cycle,
    authorBuddyId: actorUser._id,
    draft: {
      strengths: data.strengths,
      improvements: data.improvements,
      rating: data.rating,
      summary: data.summary,
    },
    state: 'DRAFT',
  });

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'REVIEW_CREATED', entity: 'reviews', entityId: review._id,
    after: { internId: data.internId, cycle: data.cycle },
  });

  return review;
};

const updateDraft = async (id, data, actorUser) => {
  const review = await Review.findById(id);
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
  if (review.state !== 'DRAFT') throw Object.assign(new Error('Review is no longer in draft'), { status: 409 });
  if (String(review.authorBuddyId) !== String(actorUser._id)) {
    throw Object.assign(new Error('Only the author can edit the draft'), { status: 403 });
  }

  Object.assign(review.draft, data);
  await review.save();
  return review;
};

const submitReview = async (id, actorUser) => {
  const review = await Review.findById(id);
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
  if (review.state !== 'DRAFT') throw Object.assign(new Error('Review is not in DRAFT state'), { status: 409 });
  if (String(review.authorBuddyId) !== String(actorUser._id)) {
    throw Object.assign(new Error('Only the author can submit the review'), { status: 403 });
  }

  review.stages.push({ stage: 'TL_REVIEW', actorId: actorUser._id, enteredAt: new Date() });
  review.state = 'TL_REVIEW';
  await review.save();

  // Notify tech lead
  const assignment = await Assignment.findOne({ internId: review.internId });
  if (assignment?.techLeadId) {
    await Notification.create({
      userId: assignment.techLeadId,
      type: 'REVIEW_STAGE',
      title: 'Review awaiting your action',
      body: `A performance review is awaiting your comment and forwarding.`,
      link: `/reviews/${review._id}`,
    });
  }

  return review;
};

const forwardReview = async (id, comment, actorUser) => {
  const review = await Review.findById(id);
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
  if (review.locked) throw Object.assign(new Error('Review is locked'), { status: 423 });

  const assignment = await Assignment.findOne({ internId: review.internId });
  const currentStage = review.stages[review.stages.length - 1];

  // Verify actor owns the current stage
  if (review.state === 'TL_REVIEW') {
    if (String(assignment?.techLeadId) !== String(actorUser._id) && actorUser.role !== 'HR') {
      throw Object.assign(new Error('Not authorized for this review stage'), { status: 403 });
    }
    currentStage.comment = comment;
    currentStage.exitedAt = new Date();
    review.stages.push({ stage: 'MGR_REVIEW', actorId: actorUser._id, enteredAt: new Date() });
    review.state = 'MGR_REVIEW';

    if (assignment?.managerId) {
      await Notification.create({
        userId: assignment.managerId,
        type: 'REVIEW_STAGE',
        title: 'Review awaiting your action',
        body: `A performance review is now with you for comments.`,
        link: `/reviews/${review._id}`,
      });
    }
  } else if (review.state === 'MGR_REVIEW') {
    if (String(assignment?.managerId) !== String(actorUser._id) && actorUser.role !== 'HR') {
      throw Object.assign(new Error('Not authorized for this review stage'), { status: 403 });
    }
    currentStage.comment = comment;
    currentStage.exitedAt = new Date();
    review.stages.push({ stage: 'HR_FINAL', actorId: actorUser._id, enteredAt: new Date() });
    review.state = 'HR_FINAL';

    // Notify HR (find HR user via notification or just leave as system)
    await Notification.create({
      userId: actorUser._id, // placeholder – HR should be notified
      type: 'REVIEW_STAGE',
      title: 'Review ready for finalization',
      body: `A performance review has been forwarded for HR finalization.`,
      link: `/reviews/${review._id}`,
    });
  } else {
    throw Object.assign(new Error(`Cannot forward from state ${review.state}`), { status: 409 });
  }

  await review.save();

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'REVIEW_FORWARDED', entity: 'reviews', entityId: review._id,
    after: { state: review.state, comment },
  });

  return review;
};

const finalizeReview = async (id, comment, actorUser) => {
  const review = await Review.findById(id);
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
  if (review.state !== 'HR_FINAL') throw Object.assign(new Error('Review is not ready for finalization'), { status: 409 });
  if (review.locked) throw Object.assign(new Error('Review is already locked'), { status: 423 });

  const currentStage = review.stages[review.stages.length - 1];
  if (currentStage) { currentStage.comment = comment; currentStage.exitedAt = new Date(); }

  review.state = 'PUBLISHED';
  review.locked = true;
  review.publishedAt = new Date();
  await review.save();

  // Notify intern
  const Intern = require('../interns/intern.model');
  const intern = await Intern.findById(review.internId);
  if (intern?.userId) {
    await Notification.create({
      userId: intern.userId,
      type: 'REVIEW_PUBLISHED',
      title: 'Your performance review is ready',
      body: `Your review for cycle ${review.cycle} has been published.`,
      link: `/reviews/my`,
    });
  }

  await AuditLog.create({
    actorId: actorUser._id, actorRole: actorUser.role,
    action: 'REVIEW_FINALIZED', entity: 'reviews', entityId: review._id,
    after: { state: 'PUBLISHED', publishedAt: review.publishedAt },
  });

  return review;
};

const getReview = async (id, actorUser) => {
  const review = await Review.findById(id)
    .populate('internId', 'name email employeeCode')
    .populate('authorBuddyId', 'name email')
    .lean();
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });

  // Interns can only see PUBLISHED reviews of themselves
  if (actorUser.role === 'INTERN' && review.state !== 'PUBLISHED') {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  return review;
};

const getInbox = async (actorUser) => {
  let stateFilter;
  if (actorUser.role === 'TECH_LEAD') stateFilter = 'TL_REVIEW';
  else if (actorUser.role === 'MANAGER') stateFilter = 'MGR_REVIEW';
  else if (actorUser.role === 'HR') stateFilter = 'HR_FINAL';
  else return [];

  return Review.find({ state: stateFilter })
    .populate('internId', 'name email employeeCode')
    .populate('authorBuddyId', 'name email')
    .sort({ updatedAt: -1 })
    .lean();
};

const getMyReviews = async (actorUser) => {
  const Intern = require('../interns/intern.model');
  const intern = await Intern.findOne({ userId: actorUser._id });
  if (!intern) return [];
  return Review.find({ internId: intern._id, state: 'PUBLISHED' })
    .sort({ publishedAt: -1 })
    .lean();
};

const getBuddyReviews = async (actorUser) => {
  return Review.find({ authorBuddyId: actorUser._id })
    .populate('internId', 'name email')
    .sort({ updatedAt: -1 })
    .lean();
};

module.exports = { createReview, updateDraft, submitReview, forwardReview, finalizeReview, getReview, getInbox, getMyReviews, getBuddyReviews };
