const reviewService = require("../services/review.service")

// ***Create Review****

const createReview = async (req, res) => {
  try {
    const result = await reviewService.createReview(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



// ****Get Event Reviews***

const getEventReviews = async (req, res) => {
  try {
    const result = await reviewService.getEventReviews(
      req.params.eventId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ***Get Review By ID***
const getReviewById = async (req, res) => {
  try {
    const result = await reviewService.getReviewById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ***Update Review***

const updateReview = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ***Delete Review***
const deleteReview = async (req, res) => {
  try {
    const result = await reviewService.deleteReview(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createReview,
  getEventReviews,
  getReviewById,
  updateReview,
  deleteReview,
};