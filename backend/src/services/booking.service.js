const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const notificationService = require("../services/notification.service");

// ======================================================
// ERROR HELPER
// ======================================================

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// GENERATE BOOKING OTP
// ======================================================

const generateBookingOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// ======================================================
// OTP EXPIRY
// ======================================================
// 5 minutes
// ======================================================

const getOtpExpiry = () => {
  return new Date(
    Date.now() + 5 * 60 * 1000
  );
};

// ======================================================
// POPULATE BOOKING
// ======================================================

const populateBooking = (query) => {
  return query
    .populate(
      "user",
      "name email profileImage role organizationName organizationLogo"
    )
    .populate({
      path: "event",
      populate: [
        {
          path: "organizer",
          select:
            "name email organizationName organizationLogo",
        },
        {
          path: "category",
          select: "name",
        },
      ],
    })
    .populate("payment");
};

// ======================================================
// CREATE BOOKING
// ======================================================
//
// FREE EVENT:
//
// Select Event
//      ↓
// Check Seats
//      ↓
// Check Max Tickets
//      ↓
// Create Booking
//      ↓
// Reserve Seats
//      ↓
// Booking Confirmed
//      ↓
// isOtpVerified = true
//
// PAID EVENT:
//
// Select Event
//      ↓
// Check Seats
//      ↓
// Create Booking
//      ↓
// Reserve Seats
//      ↓
// Booking Pending
//      ↓
// Payment Pending
// ======================================================

const createBooking = async (
  userId,
  payload
) => {
  const {
    eventId,
    ticketQuantity,
  } = payload;

  // --------------------------------------------------
  // EVENT ID
  // --------------------------------------------------

  if (!eventId) {
    throw createError(
      "Event ID is required.",
      400
    );
  }

  // --------------------------------------------------
  // FIND EVENT
  // --------------------------------------------------

  const eventData =
    await Event.findById(eventId);

  if (
    !eventData ||
    eventData.isDeleted
  ) {
    throw createError(
      "Event not found.",
      404
    );
  }

  // --------------------------------------------------
  // EVENT STATUS
  // --------------------------------------------------

  if (
    eventData.status !== "published"
  ) {
    throw createError(
      "This event is not available for booking.",
      400
    );
  }

  // --------------------------------------------------
  // EVENT DATE CHECK
  // --------------------------------------------------

  if (
    eventData.eventDate &&
    new Date(eventData.eventDate) <= new Date()
  ) {
    throw createError(
      "This event is no longer available for booking.",
      400
    );
  }

  // --------------------------------------------------
  // QUANTITY
  // --------------------------------------------------

  const quantity =
    Number(ticketQuantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw createError(
      "Invalid ticket quantity.",
      400
    );
  }

  // --------------------------------------------------
  // MAX TICKETS PER USER
  // --------------------------------------------------

  if (
    eventData.maxTicketsPerUser &&
    quantity >
      eventData.maxTicketsPerUser
  ) {
    throw createError(
      `You can book maximum ${eventData.maxTicketsPerUser} tickets.`,
      400
    );
  }

  // --------------------------------------------------
  // AVAILABLE SEATS
  // --------------------------------------------------

  if (
    Number(eventData.availableSeats) <
    quantity
  ) {
    throw createError(
      "Not enough seats available.",
      400
    );
  }

  // --------------------------------------------------
  // DUPLICATE BOOKING CHECK
  // --------------------------------------------------
  //
  // Only BLOCK if the user already has a CONFIRMED booking.
  // A pending (unpaid) booking is NOT a final booking and
  // must be returned so the user can complete payment.
  // --------------------------------------------------

  const confirmedBooking =
    await Booking.findOne({
      user: userId,
      event: eventData._id,
      bookingStatus: "confirmed",
    });

  if (confirmedBooking) {
    throw createError(
      "You have already booked this event.",
      409
    );
  }

  // --------------------------------------------------
  // REUSE EXISTING PENDING BOOKING
  // --------------------------------------------------

  const existingPendingBooking =
    await Booking.findOne({
      user: userId,
      event: eventData._id,
      bookingStatus: "pending",
      isOtpVerified: false,
    });

  if (existingPendingBooking) {
    const pendingResult =
      await populateBooking(
        Booking.findById(
          existingPendingBooking._id
        )
      );

    let existingPayment = null;

    if (
      existingPendingBooking.payment
    ) {
      existingPayment =
        await Payment.findById(
          existingPendingBooking.payment
        );
    }

    return {
      booking: pendingResult,
      payment: existingPayment,
      message:
        "You have an existing pending booking. Please complete payment.",
      isExistingPending: true,
    };
  }

  // ==================================================
  // FREE EVENT
  // ==================================================

  if (
    eventData.eventType === "free"
  ) {

    const otp =
      generateBookingOtp();

    const otpExpiresAt =
      getOtpExpiry();

    const booking =
      await Booking.create({
        user: userId,
        event: eventData._id,

        ticketQuantity: quantity,

        totalAmount: 0,

        bookingStatus: "pending",

        bookingOtp: otp,

        bookingOtpExpires: otpExpiresAt,

        isOtpVerified: false,

        payment: null,

        refundPercentage: 0,
        refundAmount: 0,
        refundStatus: "none",

        cancelledAt: null,
      });

    // ------------------------------------------------
    // RESERVE SEATS
    // ------------------------------------------------

    eventData.availableSeats -=
      quantity;

    await eventData.save();

    // ------------------------------------------------
    // GET USER
    // ------------------------------------------------

    const user =
      await User.findById(userId)
        .select("name email");

    // ------------------------------------------------
    // OTP EMAIL
    // ------------------------------------------------

    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,

          subject:
            "Verify Your Free Booking OTP",

          text:
            `Hello ${user.name}, your OTP for booking ${eventData.title} is ${otp}. It is valid for 5 minutes.`,

          html: `
            <h2>Verify Your Booking</h2>

            <p>Hello ${user.name},</p>

            <p>
              Your booking for
              <strong>${eventData.title}</strong>
              is ready. Please use the following OTP
              to confirm your booking:
            </p>

            <h1>${otp}</h1>

            <p>
              This OTP is valid for 5 minutes.
            </p>

            <p>
              Thank you for using EventEase.
            </p>
          `,
        });
      } catch (error) {
        console.error(
          "Free booking OTP email failed:",
          error.message
        );
      }
    }

    // ------------------------------------------------
    // RETURN BOOKING
    // ------------------------------------------------

    const result =
      await populateBooking(
        Booking.findById(booking._id)
      );

    return {
      booking: result,

      payment: null,

      message:
        "Free booking created successfully. Please verify OTP.",

      otp,

      otpExpiresAt,

    };
  }

  // ==================================================
  // PAID EVENT
  // ==================================================

  const totalAmount =
    Number(
      eventData.ticketPrice || 0
    ) * quantity;

  if (totalAmount <= 0) {
    throw createError(
      "Invalid ticket price.",
      400
    );
  }

  // --------------------------------------------------
  // CREATE PENDING BOOKING
  // --------------------------------------------------

  const booking =
    await Booking.create({
      user: userId,
      event: eventData._id,

      ticketQuantity: quantity,

      totalAmount,

      bookingStatus: "pending",

      bookingOtp: null,
      bookingOtpExpires: null,

      isOtpVerified: false,

      payment: null,

      refundPercentage: 0,
      refundAmount: 0,
      refundStatus: "none",

      cancelledAt: null,
    });

  // --------------------------------------------------
  // RESERVE SEATS
  // --------------------------------------------------

  eventData.availableSeats -= quantity;

  await eventData.save();

  // --------------------------------------------------
  // PLATFORM FEE
  // --------------------------------------------------

  const platformFeePercentage =
    Number(
      process.env.PLATFORM_FEE_PERCENTAGE || 10
    );

  const platformFee =
    Number(
      (
        totalAmount *
        platformFeePercentage /
        100
      ).toFixed(2)
    );

  const organizerAmount =
    Number(
      (
        totalAmount -
        platformFee
      ).toFixed(2)
    );

  // --------------------------------------------------
  // CREATE PAYMENT
  // --------------------------------------------------

  const payment =
    await Payment.create({
      user: userId,

      booking: booking._id,

      event: eventData._id,

      organizer:
        eventData.organizer,

      grossAmount: totalAmount,

      platformFee,

      organizerAmount,

      paymentMethod: "sslcommerz",

      status: "pending",

      refundAmount: 0,

      refundStatus: "none",
    });

  // --------------------------------------------------
  // LINK PAYMENT
  // --------------------------------------------------

  booking.payment =
    payment._id;

  await booking.save();

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  const result =
    await populateBooking(
      Booking.findById(booking._id)
    );

  return {
    booking: result,

    payment,

    message:
      "Booking created successfully. Please complete payment.",
  };
};

// ======================================================
// VERIFY BOOKING OTP
// ======================================================
//
// Payment Paid
//      ↓
// OTP Generated
//      ↓
// User enters OTP
//      ↓
// OTP Verified
//      ↓
// Booking Confirmed
// ======================================================

const verifyBookingOtp = async (
  bookingId,
  userId,
  otp
) => {
  const booking =
    await Booking.findById(
      bookingId
    );

  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }

  // --------------------------------------------------
  // OWNER CHECK
  // --------------------------------------------------

  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw createError(
      "You are not authorized to verify this booking.",
      403
    );
  }

  // --------------------------------------------------
  // CANCELLED
  // --------------------------------------------------

  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw createError(
      "This booking has already been cancelled.",
      400
    );
  }

  // --------------------------------------------------
  // ALREADY VERIFIED
  // --------------------------------------------------

  if (
    booking.isOtpVerified
  ) {
    return {
      booking,
      message:
        "Booking OTP has already been verified.",
    };
  }

  // --------------------------------------------------
  // PAYMENT CHECK
  // --------------------------------------------------

  let payment = null;

  if (
    booking.totalAmount > 0
  ) {
    if (!booking.payment) {
      throw createError(
        "Payment is required before OTP verification.",
        400
      );
    }

    payment =
      await Payment.findById(
        booking.payment
      );

    if (
      !payment ||
      payment.status !== "paid"
    ) {
      throw createError(
        "Payment must be completed before OTP verification.",
        400
      );
    }
  }

  // --------------------------------------------------
  // OTP EXISTS
  // --------------------------------------------------

  if (!booking.bookingOtp) {
    throw createError(
      "Booking OTP has not been generated yet.",
      400
    );
  }

  // --------------------------------------------------
  // OTP EXPIRY
  // --------------------------------------------------

  if (
    !booking.bookingOtpExpires ||
    booking.bookingOtpExpires < new Date()
  ) {
    const event =
      await Event.findById(
        booking.event
      );

    if (event) {
      event.availableSeats +=
        booking.ticketQuantity;

      if (
        event.availableSeats >
        event.totalSeats
      ) {
        event.availableSeats =
          event.totalSeats;
      }

      await event.save();
    }

    booking.bookingStatus =
      "cancelled";

    booking.bookingOtp = null;

    booking.bookingOtpExpires =
      null;

    booking.isOtpVerified = false;

    booking.cancelledAt =
      new Date();

    await booking.save();

    // ------------------------------------------------
    // PAYMENT CANCEL
    // ------------------------------------------------

    if (payment) {
      payment.status = "cancelled";

      payment.refundStatus = "none";

      await payment.save();
    }

    throw createError(
      "Booking OTP has expired. Booking has been cancelled.",
      400
    );
  }

  // --------------------------------------------------
  // OTP MATCH
  // --------------------------------------------------

  if (
    booking.bookingOtp !==
    String(otp)
  ) {
    throw createError(
      "Invalid booking OTP.",
      400
    );
  }

  // ==================================================
  // SUCCESS
  // ==================================================

  booking.isOtpVerified =
    true;

  booking.bookingStatus =
    "confirmed";

  booking.bookingOtp = null;

  booking.bookingOtpExpires =
    null;

   await booking.save();


   // --------------------------------------------------
   // NOTIFY ORGANIZER
   // --------------------------------------------------

   try {

     const eventForNotification =
       await Event.findById(
         booking.event
       ).select(
         "title organizer"
       );

     if (
       eventForNotification?.organizer
     ) {

       await notificationService.createNotification({

         user:
           eventForNotification.organizer,

         title:
           "New Ticket Booking",

         message:
           `A user has successfully booked a ticket for your event "${eventForNotification.title}". Ticket Quantity: ${booking.ticketQuantity}.`,

         type:
           "booking",

       });

     }

   } catch (
     notificationError
   ) {

     console.error(
       "Organizer booking notification failed:",
       notificationError.message
     );

   }


   // --------------------------------------------------
   // CONFIRMATION EMAIL
   // --------------------------------------------------

  const user =
    await User.findById(userId)
      .select("name email");

  const event =
    await Event.findById(
      booking.event
    ).select(
      "title eventDate"
    );

  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,

        subject:
          "Booking Confirmed - EventEase",

        text:
          `Hello ${user.name}, your booking for ${event?.title || "the event"} has been confirmed successfully.`,

        html: `
          <h2>Booking Confirmed</h2>

          <p>Hello ${user.name},</p>

          <p>
            Your payment has been verified and your
            booking is now confirmed.
          </p>

          <p>
            Event:
            <strong>${event?.title || "Event"}</strong>
          </p>

          <p>
            Ticket Quantity:
            <strong>${booking.ticketQuantity}</strong>
          </p>

          <p>
            Please keep your booking information
            for event attendance.
          </p>
        `,
      });
    } catch (error) {
      console.error(
        "Booking confirmation email failed:",
        error.message
      );
    }
  }

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  const result =
    await populateBooking(
      Booking.findById(
        booking._id
      )
    );

  return {
    booking: result,

    message:
      "Booking confirmed successfully.",
  };
};

// ======================================================
// CANCEL BOOKING
// ======================================================

const cancelBooking = async (
  bookingId,
  userId,
  userRole
) => {
  const booking =
    await Booking.findById(
      bookingId
    );

  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }

  // --------------------------------------------------
  // CUSTOMER OWNER CHECK
  // --------------------------------------------------

  if (
    userRole === "user" ||
    userRole === "customer"
  ) {
    if (
      booking.user.toString() !==
      userId.toString()
    ) {
      throw createError(
        "You are not authorized to cancel this booking.",
        403
      );
    }
  }

  // --------------------------------------------------
  // ALREADY CANCELLED
  // --------------------------------------------------

  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw createError(
      "This booking has already been cancelled.",
      400
    );
  }

  // --------------------------------------------------
  // COMPLETED
  // --------------------------------------------------

  if (
    booking.bookingStatus ===
    "completed"
  ) {
    throw createError(
      "Completed bookings cannot be cancelled.",
      400
    );
  }

  // --------------------------------------------------
  // ATTENDED
  // --------------------------------------------------

  if (booking.isAttended) {
    throw createError(
      "You have already attended this event. Cancellation is not allowed.",
      400
    );
  }

  // --------------------------------------------------
  // EVENT
  // --------------------------------------------------

  const event =
    await Event.findById(
      booking.event
    );

  if (!event) {
    throw createError(
      "Event not found.",
      404
    );
  }

  // ==================================================
  // EVENT DATETIME
  // ==================================================

  let eventDateTime =
    new Date(event.eventDate);

  if (event.startTime) {
    const timeParts =
      String(event.startTime)
        .split(":")
        .map(Number);

    if (
      timeParts.length >= 2 &&
      !Number.isNaN(timeParts[0]) &&
      !Number.isNaN(timeParts[1])
    ) {
      eventDateTime.setHours(
        timeParts[0],
        timeParts[1] || 0,
        0,
        0
      );
    }
  }

  // ==================================================
  // EVENT STARTED CHECK
  // ==================================================

  if (new Date() >= eventDateTime) {
    throw createError(
      "This event has already started. Cancellation is not allowed.",
      400
    );
  }

  // ==================================================
  // REFUND CALCULATION
  // ==================================================

  let refundPercentage = 0;

  if (
    Number(booking.totalAmount) > 0
  ) {
    const now = new Date();

    const differenceMs =
      eventDateTime.getTime() -
      now.getTime();

    const daysRemaining =
      differenceMs /
      (
        1000 *
        60 *
        60 *
        24
      );

    const fullDaysRemaining =
      Math.floor(daysRemaining);

    if (fullDaysRemaining >= 6) {
      refundPercentage = 70;
    } else if (
      fullDaysRemaining >= 3
    ) {
      refundPercentage = 50;
    } else if (
      fullDaysRemaining >= 1
    ) {
      refundPercentage = 20;
    } else {
      refundPercentage = 0;
    }
  }

  const refundAmount =
    Number(
      (
        Number(
          booking.totalAmount || 0
        ) *
        refundPercentage /
        100
      ).toFixed(2)
    );

  // ==================================================
  // RESTORE SEATS
  // ==================================================

  event.availableSeats +=
    booking.ticketQuantity;

  if (
    event.availableSeats >
    event.totalSeats
  ) {
    event.availableSeats =
      event.totalSeats;
  }

  await event.save();

  // ==================================================
  // UPDATE BOOKING
  // ==================================================

  booking.bookingStatus =
    "cancelled";

  booking.cancelledAt =
    new Date();

  booking.refundPercentage =
    refundPercentage;

  booking.refundAmount =
    refundAmount;

  booking.bookingOtp = null;

  booking.bookingOtpExpires =
    null;

  booking.isOtpVerified =
    false;

  booking.refundStatus =
    refundAmount > 0
      ? "pending"
      : "none";

  await booking.save();

  // ==================================================
  // UPDATE PAYMENT
  // ==================================================

  if (booking.payment) {
    const payment =
      await Payment.findById(
        booking.payment
      );

    if (payment) {
      payment.refundAmount =
        refundAmount;

      payment.refundStatus =
        refundAmount > 0
          ? "pending"
          : "none";

      await payment.save();
    }
  }

  // ==================================================
  // CREATE NOTIFICATION
  // ==================================================

  try {

    const notificationMessage =
      refundAmount > 0
        ? `Your booking for ${event.title} (Booking ID: ${booking._id}) has been cancelled successfully. Refund Amount: ৳${refundAmount}. Refund Status: Pending.`
        : `Your booking for ${event.title} (Booking ID: ${booking._id}) has been cancelled successfully. No refund is applicable.`;

    await notificationService.createNotification({

      user: booking.user,

      title: "Booking Cancelled",

      message: notificationMessage,

      type: "refund",

    });

  } catch (notificationError) {

    console.error(
      "Cancellation notification failed:",
      notificationError.message
    );

  }

  return {
    message:
      refundAmount > 0
        ? "Booking cancelled successfully. Refund request has been submitted."
        : "Booking cancelled successfully. No refund is applicable.",

    refundPercentage,

    refundAmount,

    refundStatus:
      refundAmount > 0
        ? "pending"
        : "none",
  };
};

// ======================================================
// GET MY CONFIRMED BOOKINGS
// ======================================================
// Returns only bookings that have been successfully
// confirmed (bookingStatus = "confirmed").
// Source of truth: backend only.

const getMyConfirmedBookings = async (
  userId
) => {
  return await populateBooking(
    Booking.find({
      user: userId,
      bookingStatus: "confirmed",
    }).sort({
      createdAt: -1,
    })
  );
};

// ======================================================
// GET MY BOOKINGS
// ======================================================

const getMyBookings = async (
  userId
) => {
  return await populateBooking(
    Booking.find({
      user: userId,
      bookingStatus: {
        $in: [
          "pending",
          "confirmed",
        ],
      },
    }).sort({
      createdAt: -1,
    })
  );
};

// ======================================================
// GET ORGANIZER / ADMIN BOOKINGS
// ======================================================

const getOrganizerBookings = async (
  userId,
  userRole
) => {
  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  if (
    userRole === "admin"
  ) {
    return await populateBooking(
      Booking.find().sort({
        createdAt: -1,
      })
    );
  }

  // --------------------------------------------------
  // ORGANIZER
  // --------------------------------------------------

  const events =
    await Event.find({
      organizer: userId,
      isDeleted: false,
    }).select("_id");

  const eventIds =
    events.map(
      (item) => item._id
    );

  return await populateBooking(
    Booking.find({
      event: {
        $in: eventIds,
      },
    }).sort({
      createdAt: -1,
    })
  );
};

// ======================================================
// GET BOOKINGS FOR SPECIFIC EVENT
// ======================================================

const getEventBookings = async (
  eventId,
  userId,
  userRole
) => {
  const event =
    await Event.findById(
      eventId
    );

  if (!event) {
    throw createError(
      "Event not found.",
      404
    );
  }

  // --------------------------------------------------
  // ORGANIZER CHECK
  // --------------------------------------------------

  if (
    userRole === "organizer"
  ) {
    if (
      event.organizer.toString() !==
      userId.toString()
    ) {
      throw createError(
        "You are not authorized to view bookings for this event.",
        403
      );
    }
  }

  return await populateBooking(
    Booking.find({
      event: eventId,
    }).sort({
      createdAt: -1,
    })
  );
};

// ======================================================
// GET BOOKING BY ID
// ======================================================

const getBookingById = async (
  bookingId,
  userId,
  userRole
) => {
  const booking =
    await populateBooking(
      Booking.findById(
        bookingId
      )
    );

  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  if (
    userRole === "admin"
  ) {
    return booking;
  }

  // --------------------------------------------------
  // CUSTOMER
  // --------------------------------------------------

  if (
    booking.user &&
    booking.user._id.toString() ===
      userId.toString()
  ) {
    return booking;
  }

  // --------------------------------------------------
  // ORGANIZER
  // --------------------------------------------------

  if (
    userRole === "organizer" &&
    booking.event &&
    booking.event.organizer &&
    booking.event.organizer._id.toString() ===
      userId.toString()
  ) {
    return booking;
  }

  throw createError(
    "You are not authorized to view this booking.",
    403
  );
};

// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatus = async (
  bookingId,
  status,
  userId,
  userRole
) => {
  const booking =
    await Booking.findById(
      bookingId
    );

  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }

  const allowedStatuses = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    throw createError(
      "Invalid booking status.",
      400
    );
  }

  // --------------------------------------------------
  // PREVENT MANUAL PENDING FOR VERIFIED BOOKING
  // --------------------------------------------------

  if (
    booking.isOtpVerified &&
    status === "pending"
  ) {
    throw createError(
      "A verified booking cannot be changed back to pending.",
      400
    );
  }

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  if (
    userRole === "admin"
  ) {
    booking.bookingStatus =
      status;

    await booking.save();

    return await populateBooking(
      Booking.findById(
        booking._id
      )
    );
  }

  // --------------------------------------------------
  // ORGANIZER
  // --------------------------------------------------

  if (
    userRole === "organizer"
  ) {
    const event =
      await Event.findById(
        booking.event
      );

    if (!event) {
      throw createError(
        "Event not found.",
        404
      );
    }

    if (
      event.organizer.toString() !==
      userId.toString()
    ) {
      throw createError(
        "You are not authorized to update this booking.",
        403
      );
    }

    booking.bookingStatus =
      status;

    await booking.save();

    return await populateBooking(
      Booking.findById(
        booking._id
      )
    );
  }

  throw createError(
    "You are not authorized to update this booking.",
    403
  );
};

// ======================================================
// EXPIRE PENDING BOOKINGS
// ======================================================
// Used by bookingExpiry.job.js
// Cancels bookings whose OTP has expired
// and restores available seats.
// ======================================================

const expirePendingBookings =
  async () => {
    const now = new Date();

    const expiredBookings =
      await Booking.find({
        bookingStatus: "pending",

        bookingOtpExpires: {
          $lt: now,
        },

        isOtpVerified: false,
      });


    let expiredCount = 0;


    for (
      const booking of expiredBookings
    ) {
      booking.bookingStatus =
        "cancelled";

      booking.bookingOtp = null;

      booking.bookingOtpExpires =
        null;

      booking.isOtpVerified =
        false;

      booking.cancelledAt =
        now;

      await booking.save();


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


      expiredCount++;

    }


    return expiredCount;

  };


// ======================================================
// GET BOOKING HISTORY
// ======================================================
// Returns bookings for events whose date has already passed.

const getBookingHistory = async (
  userId
) => {
  const now = new Date();

  const expiredEventIds =
    (
      await Event.find({
        eventDate: { $lt: now },
        isDeleted: false,
      }).select("_id")
    ).map((event) => event._id);


  return await populateBooking(
    Booking.find({
      user: userId,
      $or: [
        { bookingStatus: { $in: ["cancelled", "completed"] } },
        {
          bookingStatus: "confirmed",
          event: { $in: expiredEventIds },
        },
      ],
    }).sort({ createdAt: -1 })
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBooking,
  verifyBookingOtp,
  cancelBooking,
  getMyBookings,
  getMyConfirmedBookings,
  getOrganizerBookings,
  getEventBookings,
  getBookingById,
  updateBookingStatus,
  expirePendingBookings,
  getBookingHistory,
};