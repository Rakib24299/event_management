const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const AppError = require("../utils/AppError");

const {
  createBulkNotifications,
} = require("./notification.service");

const { getPlatformFeePercentage } =
  require("./payment.service");

const {
  getEventEndDateTime,
  isEventExpired,
  isEventInAdminHistory,
} = require("../utils/eventDateTime");


// Get Pending Organizers

const getPendingOrganizers = async () => {

  const organizers =
    await User.find({
      role: "organizer",
      approvalStatus: "pending",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

  return organizers;
};


// Approve Organizer

const approveOrganizer = async (
  organizerId
) => {

  const organizer =
    await User.findById(
      organizerId
    );

  if (!organizer) {

    throw new AppError(
      "Organizer not found.",
      404
    );

  }

  if (
    organizer.role !== "organizer"
  ) {

    throw new AppError(
      "This user is not an organizer.",
      400
    );

  }

  if (
    organizer.approvalStatus ===
    "approved"
  ) {

    throw new AppError(
      "Organizer is already approved.",
      400
    );

  }

  organizer.approvalStatus =
    "approved";

  await organizer.save();


  // Notification To Organizer

  await createBulkNotifications({

    users: [
      organizer._id,
    ],

    title:
      "Organizer Account Created",

    message:
      "Your organizer account has been successfully created by the admin.",

    type:
      "account",

  });


  return organizer;
};


// Reject Organizer

const rejectOrganizer = async (
  organizerId
) => {

  const organizer =
    await User.findById(
      organizerId
    );

  if (!organizer) {

    throw new AppError(
      "Organizer not found.",
      404
    );

  }

  if (
    organizer.role !== "organizer"
  ) {

    throw new AppError(
      "This user is not an organizer.",
      400
    );

  }

  if (
    organizer.approvalStatus ===
    "rejected"
  ) {

    throw new AppError(
      "Organizer is already rejected.",
      400
    );

  }

  organizer.approvalStatus =
    "rejected";

  await organizer.save();


  // Notification To Organizer

  await createBulkNotifications({

    users: [
      organizer._id,
    ],

    title:
      "Organizer Account Rejected",

    message:
      "Your organizer account request has been rejected by the admin.",

    type:
      "approval",

  });


  return organizer;
};


// Get Dashboard Statistics

const getDashboardStats = async () => {

  const totalUsers =
    await User.countDocuments({
      role: "user",
      status: "active",
    });


  const totalOrganizers =
    await User.countDocuments({
      role: "organizer",
    });


  const pendingOrganizers =
    await User.countDocuments({
      role: "organizer",
      approvalStatus: "pending",
    });


  const totalEvents =
    await Event.find({

      isDeleted: false,

    });


  const activeTotalEvents =
    totalEvents.filter(
      (event) =>
        !isEventExpired(event)
    );


  const totalEventsCount =
    activeTotalEvents.length;


  const activeEvents =
    await Event.countDocuments({

      isDeleted: false,

      status: "published",

    });


  const publishedEventsForCount =
    await Event.find({

      isDeleted: false,

      status: "published",

    });


  const activePublishedEventsCount =
    publishedEventsForCount.filter(
      (event) =>
        !isEventExpired(event)
    ).length;


  const allEventsForHistory =
    await Event.find({

      isDeleted: false,

    });


  const completedEvents =
    allEventsForHistory.filter(
      isEventInAdminHistory
    ).length;


  const totalBookings =
    await Booking.aggregate([

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
          bookingStatus: { $ne: "cancelled" },
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

    ]);


  const totalBookingsCount =
    totalBookings.length > 0
      ? totalBookings[0].totalBookings
      : 0;


  const confirmedBookings =
    await Booking.aggregate([

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
          bookingStatus: "confirmed",
          "event.isDeleted": false,
          eventEndDateTime: { $gt: new Date() },
        },
      },

      {
        $group: {
          _id: null,
          confirmedBookings: { $sum: 1 },
        },
      },

    ]);


  const confirmedBookingsCount =
    confirmedBookings.length > 0
      ? confirmedBookings[0].confirmedBookings
      : 0;


  const ticketResult =
    await Booking.aggregate([

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
          bookingStatus: "confirmed",
          "event.isDeleted": false,
          eventEndDateTime: { $gt: new Date() },
        },
      },

      {
        $group: {
          _id: null,
          totalTickets: {
            $sum: "$ticketQuantity",
          },
        },
      },

    ]);


  const totalTickets =
    ticketResult.length > 0
      ? ticketResult[0].totalTickets
      : 0;


  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const tomorrowStart = new Date(
    todayStart.getTime() + 24 * 60 * 60 * 1000
  );
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthStart = new Date(
    oneMonthAgo.getFullYear(),
    oneMonthAgo.getMonth(),
    oneMonthAgo.getDate()
  );

  const revenueResult =
    await Payment.aggregate([

      {
        $match: {
          status: "paid",
          $or: [
            { paidAt: { $gte: monthStart, $lt: tomorrowStart } },
            {
              paidAt: { $exists: false },
              createdAt: { $gte: monthStart, $lt: tomorrowStart },
            },
          ],
        },
      },

      {
        $group: {

          _id: null,

          totalRevenue: {
            $sum:
              "$grossAmount",
          },

        },
      },

    ]);


  const totalRevenue =
    revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;


  return {

    totalUsers,

    totalOrganizers,

    pendingOrganizers,

    totalEvents: totalEventsCount,

    activeEvents: activePublishedEventsCount,

    completedEvents,

    totalBookings: totalBookingsCount,

    confirmedBookings: confirmedBookingsCount,

    totalTickets,

    totalRevenue,

  };
};


// Get All Users

const getAllUsers = async () => {

  const users =
    await User.find({

      role: {
        $in: [
          "user",
          "organizer",
        ],
      },

    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

  return users;
};


// Block User

const blockUser = async (
  userId
) => {

  const user =
    await User.findById(
      userId
    );

  if (!user) {

    throw new AppError(
      "User not found.",
      404
    );

  }

  if (
    user.role === "admin"
  ) {

    throw new AppError(
      "Admin user cannot be blocked.",
      403
    );

  }

  if (
    user.status === "blocked"
  ) {

    throw new AppError(
      "User is already blocked.",
      400
    );

  }

  user.status =
    "blocked";

  await user.save();


  return user;
};


// Unblock User

const unblockUser = async (
  userId
) => {

  const user =
    await User.findById(
      userId
    );

  if (!user) {

    throw new AppError(
      "User not found.",
      404
    );

  }

  if (
    user.status === "active"
  ) {

    throw new AppError(
      "User is already active.",
      400
    );

  }

  user.status =
    "active";

  await user.save();


  return user;
};


// Get All Events

const getAllEvents = async () => {

  const events =
    await Event.find({

      isDeleted: false,

    })
      .populate(
        "organizer",
        "name email organizationName"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

  return events.filter(
    (event) => !isEventExpired(event)
  );
};


// Delete Event By Admin
// Hard Delete

const deleteEventByAdmin = async (
   eventId,
   adminId
) => {

   const event =
     await Event.findById(
       eventId
     );

   if (!event) {

     throw new AppError(
       "Event not found.",
       404
     );

   }


   const eventTitle =
     event.title;

   const organizerId =
     event.organizer;


   await Event.findByIdAndDelete(
     eventId
   );


   // Notify Organizer

   if (organizerId) {

     await createBulkNotifications({

       users: [
         organizerId,
       ],

       title:
         "Event Removed",

       message:
         `Your event "${eventTitle}" has been removed by the admin.`,

       type:
         "system",

     });

   }


   return {

     message:
       "Event deleted successfully.",

   };

};


// Get All Payments

const getAllPayments = async () => {

  const payments =
    await Payment.find()

      .populate(
        "user",
        "name email"
      )

      .populate({
        path: "booking",

        populate: {

          path: "event",

          select:
            "title eventDate organizer",

        },

      })

      .sort({
        createdAt: -1,
      });


  return payments;
};


// Get Payment Statistics

const getPaymentStatistics =
  async () => {

    const totalPayments =
      await Payment.countDocuments();


    const paidPayments =
      await Payment.countDocuments({

        status:
          "paid",

      });


    const pendingPayments =
      await Payment.countDocuments({

        status: {
          $in: [
            "pending",
            "processing",
          ],
        },

      });


    const failedPayments =
      await Payment.countDocuments({

        status:
          "failed",

      });


    const refundedPayments =
      await Payment.countDocuments({

        status:
          "refunded",

      });


    const refundPending =
      await Booking.countDocuments({

        refundStatus:
          "pending",

      });


    const revenueResult =
      await Payment.aggregate([

        {
          $match: {

            status:
              "paid",

          },
        },

        {
          $group: {

            _id: null,

            total: {
              $sum:
                "$grossAmount",
            },

          },
        },

      ]);


    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;


    return {

      totalPayments,

      paidPayments,

      pendingPayments,

      failedPayments,

      refundedPayments,

      refundPending,

      totalRevenue,

    };

  };


// Get Admin Revenue History

const getAdminRevenueHistory =
  async () => {

    const now =
      new Date();

    const todayStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    const tomorrowStart =
      new Date(
        todayStart.getTime() +
          24 * 60 * 60 * 1000
      );

    const sevenDaysAgo =
      new Date(
        todayStart.getTime() -
          7 * 24 * 60 * 60 * 1000
      );

    const oneMonthAgo =
      new Date(now);

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );

    const monthStart =
      new Date(
        oneMonthAgo.getFullYear(),
        oneMonthAgo.getMonth(),
        oneMonthAgo.getDate()
      );


    const aggregateForPeriod =
      async (start, end) => {

        const result =
          await Payment.aggregate([

            {

              $match: {

                status: "paid",

                $or: [

                  { paidAt: { $gte: start, $lt: end } },

                  {

                    paidAt: { $exists: false },

                    createdAt: { $gte: start, $lt: end },

                  },

                ],

              },

            },

            {

              $group: {

                _id: null,

                totalPayments: { $sum: 1 },

                totalRevenue: { $sum: "$grossAmount" },

                platformFee: { $sum: "$platformFee" },

                organizerRevenue: { $sum: "$organizerAmount" },

              },

            },

          ]);


        return {

          totalPayments:
            result.length > 0
              ? result[0].totalPayments
              : 0,

          totalRevenue:
            result.length > 0
              ? result[0].totalRevenue
              : 0,

          platformFee:
            result.length > 0
              ? result[0].platformFee
              : 0,

          organizerRevenue:
            result.length > 0
              ? result[0].organizerRevenue
              : 0,

        };

      };


    const [today, last7Days, last1Month, dailyPayments] =
      await Promise.all([

        aggregateForPeriod(
          todayStart,
          tomorrowStart
        ),

        aggregateForPeriod(
          sevenDaysAgo,
          tomorrowStart
        ),

        aggregateForPeriod(
          monthStart,
          tomorrowStart
        ),

        Payment.aggregate([
          {
            $match: {
              status: "paid",
              $or: [
                { paidAt: { $gte: sevenDaysAgo, $lt: tomorrowStart } },
                {
                  paidAt: { $exists: false },
                  createdAt: { $gte: sevenDaysAgo, $lt: tomorrowStart },
                },
              ],
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $ifNull: ["$paidAt", "$createdAt"] },
                },
              },
              totalRevenue: { $sum: "$grossAmount" },
              platformFee: { $sum: "$platformFee" },
              organizerRevenue: { $sum: "$organizerAmount" },
              totalPayments: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

      ]);

    const dailyMap = new Map();
    (dailyPayments || []).forEach((item) => {
      dailyMap.set(item._id, item);
    });

    const dailyLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayData = dailyMap.get(dateKey) || {
        totalRevenue: 0,
        platformFee: 0,
        organizerRevenue: 0,
        totalPayments: 0,
      };

      dailyLast7Days.push({
        date: dateKey,
        label: `${dayName} (${day}/${month})`,
        totalRevenue: dayData.totalRevenue,
        platformFee: dayData.platformFee,
        organizerRevenue: dayData.organizerRevenue,
        totalPayments: dayData.totalPayments,
      });
    }

    return {

      platformFeePercentage:
        getPlatformFeePercentage(),

      today,

      last7Days,

      last1Month,

      dailyLast7Days,

    };

  };


// Get Pending Refunds

const getPendingRefunds =
  async () => {

    const bookings =
      await Booking.find({

        refundStatus:
          "pending",

      })

        .populate(
          "user",
          "name email"
        )

        .populate(
          "event",
          "title eventDate"
        )

        .populate(
          "payment"
        )

        .sort({

          updatedAt: -1,

        });


    return bookings;

  };


// Process Refund By Admin

const processRefundByAdmin =
  async (paymentId) => {

    const payment =
      await Payment.findById(
        paymentId
      );


    if (!payment) {

      throw new AppError(
        "Payment not found.",
        404
      );

    }


    if (
      payment.status !==
      "paid"
    ) {

      throw new AppError(
        "Only paid payments can be refunded.",
        400
      );

    }


    const booking =
      await Booking.findById(
        payment.booking
      );


    if (!booking) {

      throw new AppError(
        "Booking not found.",
        404
      );

    }


    if (
      booking.refundStatus !==
      "pending"
    ) {

      throw new AppError(
        "This booking does not have a pending refund.",
        400
      );

    }


    // Calculate Refund

    const refundAmount =
      booking.refundAmount || 0;


    // Update Payment

    payment.status =
      "refunded";

    payment.refundAmount =
      refundAmount;

    payment.refundDate =
      new Date();

    await payment.save();


    // Update Booking

    booking.refundStatus =
      "processed";

    await booking.save();


    // Restore Event Seats

    const event =
      await Event.findById(
        booking.event
      );


    if (event) {

      event.availableSeats =
        Math.min(

          event.totalSeats,

          event.availableSeats +
            booking.ticketQuantity

        );

      await event.save();

    }


    // Notify User

    await createBulkNotifications({

      users: [
        payment.user,
      ],

      title:
        "Refund Processed",

      message:
        `Your refund of BDT ${refundAmount} for your booking has been processed successfully.`,

      type:
        "refund",

    });


    return {

      payment,

      booking,

      message:
        "Refund processed successfully.",

    };

  };


// Get Event History
// Expired events within 30-day retention period
//event history 30days

const getEventHistory = async () => {

  const events =
    await Event.find({

      isDeleted: false,

    })
      .populate(
        "organizer",
        "name email organizationName"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });


  return events.filter(
    isEventExpired
  );

};


// Export

module.exports = {

  getPendingOrganizers,

  approveOrganizer,

  rejectOrganizer,

  getDashboardStats,

  getAllUsers,

  blockUser,

  unblockUser,

  getAllEvents,

  getEventHistory,

  deleteEventByAdmin,

  getAllPayments,

  getPaymentStatistics,

  getAdminRevenueHistory,

  getPendingRefunds,

  processRefundByAdmin,

};