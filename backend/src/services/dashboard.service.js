const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");


// Admin Dashboard

const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalOrganizers,
    pendingOrganizers,
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    totalBookings,
    totalRevenue,
    recentUsers,
    recentEvents,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),

    User.countDocuments({ role: "organizer" }),

    User.countDocuments({
      role: "organizer",
      approvalStatus: "pending",
    }),

    Event.countDocuments(),

    Event.countDocuments({
      status: "published",
    }),

    Event.countDocuments({
      status: "completed",
    }),

    Event.countDocuments({
      status: "cancelled",
    }),

    Booking.countDocuments(),

    Payment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]),

    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5),

    Event.find()
      .sort({ createdAt: -1 })
      .limit(5),

    Booking.find()
      .populate("user", "name")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    totalUsers,
    totalOrganizers,
    pendingOrganizers,
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    totalBookings,
    totalRevenue:
      totalRevenue.length > 0
        ? totalRevenue[0].totalRevenue
        : 0,
    recentUsers,
    recentEvents,
    recentBookings,
  };
};

// ======================
// Organizer Dashboard
// ======================

const getOrganizerDashboard = async (organizerId) => {
  const myEvents = await Event.find(
    {
        organizer: organizerId,
    });

  const eventIds = myEvents.map((event) => event._id);

  const [
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    totalBookings,
    totalRevenue,
    recentReviews,
  ] = await Promise.all(
    [
        Event.countDocuments(
            {
        organizer: organizerId,
            }),

        Event.countDocuments(
        {
            organizer: organizerId,
            status: "published",
        }),

        Event.countDocuments(
        {
            organizer: organizerId,
            status: "completed",
        }),

        Event.countDocuments(
        {
            organizer: organizerId,
            status: "cancelled",
        }),

        Booking.countDocuments(
        {
         event: {
               $in: eventIds,
                    },
        }),

        Payment.aggregate(
        [
            {
                $match: {
                paymentStatus: "paid",
                },
            },
            {
                $lookup: {
                from: "bookings",
                localField: "booking",
                foreignField: "_id",
                as: "booking",
                },
            },
        ]),

        Review.find(
         {
            event: {
                $in: eventIds,
        },
        })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

  return {
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    totalBookings,
    totalRevenue,
    recentReviews,
  };
};


// User Dashboard

const getUserDashboard = async (userId) => {
  const [
    totalBookings,
    completedBookings,
    cancelledBookings,
    myReviews,
    unreadNotifications,
    totalSpent,
  ] = await Promise.all([
    Booking.countDocuments({
      user: userId,
    }),

    Booking.countDocuments({
      user: userId,
      bookingStatus: "completed",
    }),

    Booking.countDocuments({
      user: userId,
      bookingStatus: "cancelled",
    }),

    Review.countDocuments({
      user: userId,
    }),

    Notification.countDocuments({
      user: userId,
      isRead: false,
    }),

    Payment.aggregate([
      {
        $match: {
          user: userId,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  return {
    totalBookings,
    completedBookings,
    cancelledBookings,
    myReviews,
    unreadNotifications,
    totalSpent:
      totalSpent.length > 0
        ? totalSpent[0].totalSpent
        : 0,
  };
};

module.exports = {
  getAdminDashboard,
  getOrganizerDashboard,
  getUserDashboard,
};