const express = require("express");

const reviewController = require("../controllers/review.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validations/review.validation");

const router = express.Router();


// Create Review

router.post(
  "/",
  authMiddleware,
  validateRequest(createReviewSchema),
  reviewController.createReview
);

// Get Event Reviews
router.get(
  "/event/:eventId",
  reviewController.getEventReviews
);

// Get Review By ID

router.get(
  "/:id",
  reviewController.getReviewById
);

// Update Review

router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updateReviewSchema),
  reviewController.updateReview
);

// Delete Review
router.delete(
  "/:id",
  authMiddleware,
  reviewController.deleteReview
);

module.exports = router;