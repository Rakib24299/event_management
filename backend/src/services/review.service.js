const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const AppError = require("../utils/AppError");



// Update Event Rating Summary***

const updateEventRatingSummary = async (eventId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        event: eventId,
      },
    },
    {
      $group: {
        _id: "$event",
        totalReviews: {
          $sum: 1,
        },
        avgRating: {
          $avg: "$rating",
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: Number(stats[0].avgRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};


// Create Review****

const createReview = async (userId, payload) => {
  const event = await Event.findById(payload.event);

  if (!event || event.isDeleted) 
    {
    throw new AppError("Event not found.",404);
  }

  const booking = await Booking.findOne({
    user: userId,
    event: payload.event,
    bookingStatus: "completed",
  });

  if (!booking) 
    {
    throw new AppError("You can review only events you have attended.",403);
  }

  const existingReview = await Review.findOne({
    user: userId,
    event: payload.event,
  });

  if (existingReview) 
  {
    throw new AppError("You have already reviewed this event.",409);
  }

  const review = await Review.create({
    user: userId,
    event: payload.event,
    rating: payload.rating,
    comment: payload.comment,
  });

  await updateEventRatingSummary(payload.event);

  return review;
};


// Get Event Reviews


const getEventReviews = async (eventId) => {
  return await Review.find({
    event: eventId,
  })
    .populate("user", "name profileImage")
    .sort({
      createdAt: -1,
    });
};


// Get Review By ID


const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate("user", "name profileImage")
    .populate("event", "title");

  if (!review) 
  {
    throw new AppError("Review not found.",404);
  }

  return review;
};



// Update Review****

const updateReview = async (reviewId,userId,payload) => {

  const review = await Review.findById(reviewId);

  if (!review) 
    {
    throw new AppError("Review not found.",404);
  }

  if (review.user.toString() !== userId.toString()) 
    {
    throw new AppError("You are not authorized to update this review.",403);
  }

  review.rating = payload.rating ?? review.rating;

  review.comment = payload.comment ?? review.comment;

  await review.save();

  await updateEventRatingSummary(review.event);

  return review;
};


// Delete Review

const deleteReview = async (reviewId,userId) => {

  const review = await Review.findById(reviewId);

  if (!review) 
    {
    throw new AppError("Review not found.",404);
  }

  if (review.user.toString() !== userId.toString()) 
    {
    throw new AppError("You are not authorized to delete this review.",403);
  }

  const eventId = review.event;

  await review.deleteOne();

  await updateEventRatingSummary(eventId);

  return {message: "Review deleted successfully.",};
};
module.exports = {
  createReview,
  getEventReviews,
  getReviewById,
  updateReview,
  deleteReview,
};