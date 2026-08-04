const reviewService = require("../services/review.service")
const catchAsync = require("../utils/catchAsync");



// *** Create Review ***

const createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReview(
    req.user.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Review created successfully.",
    data: result,
  });
});



// *** Get Event Reviews ***

const getEventReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getEventReviews(
    req.params.eventId
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
});



// *** Get Review By ID ***

const getReviewById = catchAsync(async (req, res) => {
  const result = await reviewService.getReviewById(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// *** Update Review ***

const updateReview = catchAsync(async (req, res) => {
  const result = await reviewService.updateReview(
    req.params.id,
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    data: result,
  });
});


// *** Delete Review ***

const deleteReview = catchAsync(async (req, res) => {
  const result = await reviewService.deleteReview(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createReview,
  getEventReviews,
  getReviewById,
  updateReview,
  deleteReview,
};