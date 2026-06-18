const svc = require('./review.service');

const createReview = async (req, res, next) => {
  try {
    const data = await svc.createReview(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const updateDraft = async (req, res, next) => {
  try {
    const data = await svc.updateDraft(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const submitReview = async (req, res, next) => {
  try {
    const data = await svc.submitReview(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const forwardReview = async (req, res, next) => {
  try {
    const data = await svc.forwardReview(req.params.id, req.body.comment, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const finalizeReview = async (req, res, next) => {
  try {
    const data = await svc.finalizeReview(req.params.id, req.body.comment, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getReview = async (req, res, next) => {
  try {
    const data = await svc.getReview(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getInbox = async (req, res, next) => {
  try {
    const data = await svc.getInbox(req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyReviews = async (req, res, next) => {
  try {
    const data = await svc.getMyReviews(req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getBuddyReviews = async (req, res, next) => {
  try {
    const data = await svc.getBuddyReviews(req.user);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { createReview, updateDraft, submitReview, forwardReview, finalizeReview, getReview, getInbox, getMyReviews, getBuddyReviews };
