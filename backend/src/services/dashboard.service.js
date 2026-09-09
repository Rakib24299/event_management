const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const {
  getEventEndDateTime,
  isEventExpired,
} = require("../utils/eventDateTime");

// Admin Dashboard

const getAdminDashboard = async () => {

  const [
    totalUsers,
    totalOrganizers,
    pendingOrganizers,
    totalBookingsResult,
    totalRevenue,
    recentUsers,
    recentBookings,
    totalTicketsResult,
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

    Booking.aggregate([
      {
        $match: {
          bookingStatus: {
            $ne: "cancelled",
          },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $addFields: {
          eventEndDateTime: {
            $dateFromString: {
              dateString: {
                $concat: [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$event.eventDate",
                    },
                  },
                  "T",
                  { $ifNull: ["$event.endTime", "23:59:59"] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          "event.isDeleted": false,
          eventEndDateTime: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
        },
      },
    ]),

    Booking.aggregate([
      {
        $match: {
          bookingStatus: {
            $ne: "cancelled",
          },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $addFields: {
          eventEndDateTime: {
            $dateFromString: {
              dateString: {
                $concat: [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$event.eventDate",
                    },
                  },
                  "T",
                  { $ifNull: ["$event.endTime", "23:59:59"] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          "event.isDeleted": false,
          eventEndDateTime: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: "$ticketQuantity" },
        },
      },
    ]),

    Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$grossAmount",
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


  const totalEventsResult =
    await Event.find({
      isDeleted: false,
    });


  const totalEvents =
    totalEventsResult.filter(
      (event) =>
        !isEventExpired(event)
    ).length;


  const publishedEventsResult =
    await Event.find({
      isDeleted: false,
      status: "published",
    });


  const publishedEvents =
    publishedEventsResult.filter(
      (event) =>
        !isEventExpired(event)
    ).length;


  const allEventsForHistory =
    await Event.find({
      isDeleted: false,
    });


  const completedEvents =
    allEventsForHistory.filter(
      isEventExpired
    ).length;


  const cancelledEvents =
    await Event.countDocuments({
      isDeleted: false,
      status: "cancelled",
    });


  const recentEventsResult =
    await Event.find({
      isDeleted: false,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);


  const recentEvents =
    recentEventsResult.filter(
      (event) =>
        !isEventExpired(event)
    );


  return {
    totalUsers,
    totalOrganizers,
    pendingOrganizers,
    totalEvents,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    totalBookings:
      totalBookingsResult.length > 0
        ? totalBookingsResult[0].totalBookings
        : 0,

    totalTickets:
      totalTicketsResult.length > 0
        ? totalTicketsResult[0].totalTickets
        : 0,

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

  const upcomingEvents = myEvents.filter(
    (event) => !isEventExpired(event)
  );

  const upcomingEventIds = upcomingEvents.map(
    (event) => event._id
  );

    const [
     totalEvents,
     publishedEvents,
     completedEvents,
     cancelledEvents,
     draftEvents,
     ticketsSold,
     recentEvents,
     recentReviews,
    ] = await Promise.all([
      Event.countDocuments({
        organizer: organizerId,
        isDeleted: false,
        _id: {
          $in: upcomingEventIds,
        },
      }),

      Event.countDocuments({
        organizer: organizerId,
        isDeleted: false,
        status: "published",
        _id: {
          $in: upcomingEventIds,
        },
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

      Booking.aggregate([
        {
          $match: {
            event: {
              $in: upcomingEventIds,
            },
            bookingStatus: {
              $ne: "cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            ticketsSold: {
              $sum: "$ticketQuantity",
            },
          },
        },
      ]),

      Event.find({
        organizer: organizerId,
        isDeleted: false,
        _id: {
          $in: upcomingEventIds,
        },
      })
        .sort({
          createdAt: -1,
        })
        .limit(5),

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
        status: "paid",
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
          $sum: "$grossAmount",
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
    ticketsSold: ticketsSold.length > 0 ? ticketsSold[0].ticketsSold : 0,

    totalRevenue:
      totalRevenue.length > 0
        ? totalRevenue[0].totalRevenue
        : 0,

    recentEvents,

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
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: "$grossAmount",
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