const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

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
    User.countDocuments({
      role: "user",
      status: "active",
    }),

    User.countDocuments({
      role: "organizer",
      status: "active",
    }),

    User.countDocuments({
      role: "organizer",
      approvalStatus: "pending",
      status: "active",
    }),

    Event.countDocuments({
      isDeleted: false,
    }),

    Event.countDocuments({
      isDeleted: false,
      status: "published",
    }),

    Event.countDocuments({
      isDeleted: false,
      status: "completed",
    }),

    Event.countDocuments({
      isDeleted: false,
      status: "cancelled",
    }),

    Booking.countDocuments({
      bookingStatus: {
        $ne: "cancelled",
      },
    }),

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

    User.find({
      status: "active",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .limit(5),

    Event.find({
      isDeleted: false,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5),

    Booking.find({
      bookingStatus: {
        $ne: "cancelled",
      },
    })
      .populate("user", "name")
      .populate("event", "title")
      .sort({
        createdAt: -1,
      })
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

// Organizer Dashboard****


const getOrganizerDashboard = async (organizerId) => {
  const myEvents = await Event.find({
    organizer: organizerId,
    isDeleted: false,
  });

  const eventIds = myEvents.map((event) => event._id);

  const [
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    draftEvents,
    totalBookings,
    recentReviews,
  ] = await Promise.all([
    Event.countDocuments({
      organizer: organizerId,
      isDeleted: false,
    }),

    Event.countDocuments({
      organizer: organizerId,
      isDeleted: false,
      status: "published",
    }),

    Event.countDocuments({
      organizer: organizerId,
      isDeleted: false,
      status: "completed",
    }),

    Event.countDocuments({
      organizer: organizerId,
      isDeleted: false,
      status: "cancelled",
    }),

    Event.countDocuments({
      organizer: organizerId,
      isDeleted: false,
      status: "draft",
    }),

    Booking.countDocuments({
      event: {
        $in: eventIds,
      },
      bookingStatus: {
        $ne: "cancelled",
      },
    }),

    Review.find({
      event: {
        $in: eventIds,
      },
    })
      .populate("user", "name")
      .sort({
        createdAt: -1,
      })
      .limit(5),
  ]);

  const totalRevenue = await Payment.aggregate([
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
    {
      $unwind: "$booking",
    },
    {
      $match: {
        "booking.event": {
          $in: eventIds,
        },
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
  ]);

  return {
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    draftEvents,
    totalBookings,

    totalRevenue:
      totalRevenue.length > 0
        ? totalRevenue[0].totalRevenue
        : 0,

    recentReviews,
  };
};


// User Dashboard*****


const getUserDashboard = async (userId) => {
  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    myReviews,
    unreadNotifications,
    totalSpent,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments({
      user: userId,
      bookingStatus: {
        $ne: "cancelled",
      },
    }),

    Booking.countDocuments({
      user: userId,
      bookingStatus: "pending",
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

    Booking.find({
      user: userId,
    })
      .populate("event", "title eventDate")
      .sort({
        createdAt: -1,
      })
      .limit(5),
  ]);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    myReviews,
    unreadNotifications,

    totalSpent:
      totalSpent.length > 0
        ? totalSpent[0].totalSpent
        : 0,

    recentBookings,
  };
};

module.exports = {
  getAdminDashboard,
  getOrganizerDashboard,
  getUserDashboard,
};