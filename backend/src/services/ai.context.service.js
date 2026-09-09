const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Category = require("../models/Category");
const Review = require("../models/Review");
const { isEventExpired } = require("../utils/eventDateTime");

const buildAIContext = async (userId, userRole, userMessage) => {
  const trimmedMessage = (userMessage || "").trim();
  const lowerMessage = trimmedMessage.toLowerCase();

  const context = {};
  const promises = [];
  const keys = [];

  const isProfileIntent =
    /\b(profile|my info|my account|who am i|about me|my details|account info)\b/.test(
      lowerMessage
    );

  const isBookingIntent =
    /\b(booking|bookings|my bookings|ticket|tickets|reservation|reservations)\b/.test(
      lowerMessage
    );

  const isPaymentIntent =
    /\b(payment|payments|paid|refund|transaction|payment status|my payment)\b/.test(
      lowerMessage
    );

  const isEventIntent =
    /\b(event|events|upcoming|available|show me events|list events|what events)\b/.test(
      lowerMessage
    );

  const isCategoryIntent =
    /\b(category|categories)\b/.test(lowerMessage);

  const isReviewIntent =
    /\b(review|reviews|rating|ratings|feedback)\b/.test(lowerMessage);

  if (isProfileIntent && userId) {
    promises.push(
      User.findById(userId).select(
        "name email role phone address profileImage organizationName approvalStatus status"
      )
    );
    keys.push("profile");
  }

  if (isBookingIntent && userId) {
    promises.push(
      Booking.find({ user: userId, bookingStatus: { $in: ["pending", "confirmed"] } })
        .populate("event", "title eventDate startTime endTime eventType ticketPrice status")
        .sort({ createdAt: -1 })
        .limit(20)
    );
    keys.push("bookings");
  }

  if (isPaymentIntent && userId) {
    promises.push(
      Payment.find({ user: userId })
        .populate("event", "title")
        .populate("booking")
        .sort({ createdAt: -1 })
        .limit(20)
    );
    keys.push("payments");
  }

  if (isEventIntent || isCategoryIntent || isReviewIntent) {
    promises.push(
      Event.find({ isDeleted: false, status: "published" })
        .populate("organizer", "name organizationName")
        .populate("category", "name slug")
        .select(
          "title description eventDate startTime endTime eventType ticketPrice totalSeats availableSeats venue averageRating totalReviews"
        )
        .sort({ eventDate: 1 })
        .limit(30)
    );
    keys.push("events");
  }

  if (isCategoryIntent) {
    promises.push(
      Category.find({ isDeleted: false, status: "active" })
        .select("name slug description")
        .sort({ name: 1 })
    );
    keys.push("categories");
  }

  const rawResults = await Promise.allSettled(promises);

  const results = {};
  keys.forEach((key, index) => {
    const result = rawResults[index];
    if (result.status === "fulfilled") {
      results[key] = result.value;
    } else {
      console.error(`AI context query failed for ${key}:`, result.reason);
    }
  });

  if (results.profile) {
    context.user = {
      name: results.profile.name,
      role: results.profile.role,
      phone: results.profile.phone,
      address: results.profile.address,
      organizationName: results.profile.organizationName,
      approvalStatus: results.profile.approvalStatus,
      status: results.profile.status,
    };
  }

  if (results.bookings) {
    context.myBookings = results.bookings.map((b) => ({
      id: b._id,
      eventTitle: b.event?.title,
      bookingStatus: b.bookingStatus,
      ticketQuantity: b.ticketQuantity,
      totalAmount: b.totalAmount,
      eventDate: b.event?.eventDate,
      eventType: b.event?.eventType,
      isOtpVerified: b.isOtpVerified,
    }));
  }

  if (results.payments) {
    context.myPayments = results.payments.map((p) => ({
      id: p._id,
      eventTitle: p.event?.title,
      bookingId: p.booking?._id,
      grossAmount: p.grossAmount,
      platformFee: p.platformFee,
      organizerAmount: p.organizerAmount,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      status: p.status,
      paidAt: p.paidAt,
      refundAmount: p.refundAmount,
      refundStatus: p.refundStatus,
    }));
  }

  if (results.events) {
    let events = results.events;

    if (isCategoryIntent && results.categories) {
      const mentionedCategory = results.categories.find((c) =>
        lowerMessage.includes(c.name.toLowerCase())
      );
      if (mentionedCategory) {
        events = events.filter(
          (e) => e.category && e.category.name === mentionedCategory.name
        );
      }
    }

    const now = new Date();
    events = events.filter((e) => !isEventExpired(e));

    context.upcomingEvents = events.map((e) => ({
      id: e._id,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      startTime: e.startTime,
      endTime: e.endTime,
      eventType: e.eventType,
      ticketPrice: e.ticketPrice,
      totalSeats: e.totalSeats,
      availableSeats: e.availableSeats,
      venue: e.venue,
      averageRating: e.averageRating,
      totalReviews: e.totalReviews,
      category: e.category?.name,
      organizer: e.organizer?.name || e.organizer?.organizationName,
    }));
  }

  if (results.categories) {
    context.categories = results.categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
    }));
  }

  if (isReviewIntent && results.events) {
    const events = results.events;
    let matchedEvent = null;

    if (events) {
      matchedEvent = events.find((e) =>
        lowerMessage.includes(e.title.toLowerCase())
      );
    }

    if (!matchedEvent) {
      const stopWords = new Set([
        "review",
        "reviews",
        "rating",
        "ratings",
        "feedback",
        "for",
        "about",
        "of",
        "the",
        "what",
        "how",
        "many",
        "are",
        "is",
        "show",
        "me",
        "tell",
        "event",
        "events",
        "do",
        "does",
        "can",
        "could",
        "would",
        "should",
        "will",
        "shall",
        "may",
        "might",
        "must",
        "have",
        "has",
        "had",
      ]);
      const words = lowerMessage
        .split(" ")
        .filter((w) => !stopWords.has(w) && w.length > 2);
      const searchTerm = words.join(" ");

      if (searchTerm) {
        matchedEvent = await Event.findOne({
          isDeleted: false,
          status: "published",
          title: { $regex: searchTerm, $options: "i" },
        });
      }
    }

    let reviews = [];
    if (matchedEvent) {
      reviews = await Review.find({ event: matchedEvent._id })
        .populate("user", "name profileImage")
        .sort({ createdAt: -1 })
        .limit(20);
    } else if (events && events.length > 0) {
      reviews = await Review.find({
        event: { $in: events.slice(0, 5).map((e) => e._id) },
      })
        .populate("user", "name profileImage")
        .sort({ createdAt: -1 })
        .limit(20);
    }

    if (reviews.length > 0) {
      context.reviews = reviews.map((r) => ({
        eventId: r.event?._id,
        eventTitle: r.event?.title,
        rating: r.rating,
        review: r.review,
        reviewerName: r.user?.name,
        createdAt: r.createdAt,
      }));
    }
  }

  return context;
};

module.exports = { buildAIContext };
