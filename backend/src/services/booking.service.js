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
// GET EVENT END DATETIME
// ======================================================
// Combines eventDate (Date) with startTime (String "HH:mm")
// to produce the moment the event begins.
// Returns null if event data is missing or invalid.

const getEventEndDateTime = (event) => {
  if (!event) return null;

  const eventDate = event.eventDate || event.date;

  if (!eventDate) return null;

  const dateTime = new Date(eventDate);

  if (Number.isNaN(dateTime.getTime())) return null;

  const startTime = event.startTime;

  if (startTime) {
    const timeParts = String(startTime)
      .split(":")
      .map(Number);

    if (
      timeParts.length >= 2 &&
      !Number.isNaN(timeParts[0]) &&
      !Number.isNaN(timeParts[1])
    ) {
      dateTime.setHours(
        timeParts[0],
        timeParts[1] || 0,
        0,
        0
      );
    }
  }

  return dateTime;
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
// Create Booking (NO OTP, NO payment)
//      ↓
// Booking Pending
//      ↓
// my-bookings.html
//      ↓
// [Make Payment] → Event Details → OTP → Confirm
//
// PAID EVENT:
//
// Select Event
//      ↓
// Check Seats
//      ↓
// Create Booking (NO payment)
//      ↓
// Reserve Seats
//      ↓
// Booking Pending
//      ↓
// my-bookings.html
//      ↓
// [Make Payment] → Event Details → SSLCommerz → OTP → Confirm
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
  // AVAILABLE SEATS (paid events only)
  // --------------------------------------------------

  if (
      eventData.eventType !== "free" &&
      Number(
          eventData.availableSeats
      ) < quantity
  ) {

      throw createError(
          "Not enough seats available.",
          400
      );

  }

  // --------------------------------------------------
  // DUPLICATE BOOKING CHECK
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
    const otp = generateBookingOtp();
    const otpExpiresAt = getOtpExpiry();

    if (existingPendingBooking.ticketQuantity !== quantity) {
      existingPendingBooking.ticketQuantity = quantity;
      existingPendingBooking.totalAmount =
        eventData.eventType === "free"
          ? 0
          : Number(eventData.ticketPrice || 0) * quantity;
    }

    existingPendingBooking.bookingOtp = otp;
    existingPendingBooking.bookingOtpExpires = otpExpiresAt;
    await existingPendingBooking.save();

    const user = await User.findById(userId).select("name email");
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `EventEase Booking Verification OTP - ${eventData.title}`,
          text: `Hello ${user.name}, your verification OTP for booking "${eventData.title}" is ${otp}. It is valid for 5 minutes.`,
          html: `
            <h2>Verify Your Booking</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your booking for <strong>${eventData.title}</strong> is ready for verification.</p>
            <p>Please use the following 6-digit OTP to verify your booking:</p>
            <h1 style="color: #059669; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
            <p>This code is valid for <strong>5 minutes</strong>.</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send booking OTP email:", emailError.message);
      }
    }

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
      otp,
      otpExpiresAt,
      message:
        "Booking updated. Please check your email for the verification OTP.",
      isExistingPending: true,
    };
  }

  // ==================================================
  // GENERATE OTP FOR VERIFICATION
  // ==================================================

  const otp = generateBookingOtp();
  const otpExpiresAt = getOtpExpiry();
  const isFree = eventData.eventType === "free";

  const totalAmount =
    isFree
      ? 0
      : Number(eventData.ticketPrice || 0) * quantity;

  if (!isFree && totalAmount <= 0) {
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
      bookingOtp: otp,
      bookingOtpExpires: otpExpiresAt,
      isOtpVerified: false,
      payment: null,
      refundPercentage: 0,
      refundAmount: 0,
      refundStatus: "none",
      cancelledAt: null,
    });

  // --------------------------------------------------
  // RESERVE SEATS (paid events only)
  // --------------------------------------------------

  if (!isFree) {
    eventData.availableSeats -= quantity;
    await eventData.save();
  }

  // --------------------------------------------------
  // SEND OTP EMAIL
  // --------------------------------------------------

  const user = await User.findById(userId).select("name email");
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: `EventEase Booking Verification OTP - ${eventData.title}`,
        text: `Hello ${user.name}, your verification OTP for booking "${eventData.title}" is ${otp}. It is valid for 5 minutes.`,
        html: `
          <h2>Verify Your Booking</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your booking for <strong>${eventData.title}</strong> has been created.</p>
          <p>Please use the following 6-digit OTP to verify your booking:</p>
          <h1 style="color: #059669; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          <p>This code is valid for <strong>5 minutes</strong>.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send booking OTP email:", emailError.message);
    }
  }

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  const result =
    await populateBooking(
      Booking.findById(booking._id)
    );

  return {
    booking: result,
    payment: null,
    otp,
    otpExpiresAt,
    isFree,
    message:
      "Booking created successfully. Please check your email for the verification OTP.",
  };
};

// ======================================================
// GENERATE FREE BOOKING OTP
// ======================================================
//
// Called when the user arrives at the Event Details page
// for a free event with an existing pending booking and
// clicks the confirmation/payment button.
//
// Creates OTP, sends email, updates booking.
// ======================================================

const generateFreeBookingOtp = async (
  bookingId,
  userId
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
  // BOOKING STATUS
  // --------------------------------------------------

  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw createError(
      "This booking has been cancelled.",
      400
    );
  }

  if (
    booking.bookingStatus ===
    "confirmed"
  ) {
    return {
      booking,
      message:
        "This booking is already confirmed.",
    };
  }

  // --------------------------------------------------
  // ALREADY VERIFIED
  // --------------------------------------------------

  if (booking.isOtpVerified) {
    return {
      booking,
      message:
        "This booking has already been verified.",
    };
  }

  // --------------------------------------------------
  // MUST BE FREE EVENT
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

  if (event.eventType !== "free") {
    throw createError(
      "This endpoint is only for free events. Paid events must use the payment flow.",
      400
    );
  }

  // --------------------------------------------------
  // GENERATE OTP
  // --------------------------------------------------

  const otp =
    generateBookingOtp();

  const otpExpiresAt =
    getOtpExpiry();

  // --------------------------------------------------
  // UPDATE BOOKING
  // --------------------------------------------------

  booking.bookingOtp = otp;
  booking.bookingOtpExpires = otpExpiresAt;
  booking.isOtpVerified = false;
  booking.bookingStatus = "pending";

  await booking.save();

  // --------------------------------------------------
  // GET USER
  // --------------------------------------------------

  const user =
    await User.findById(userId)
      .select("name email");

  // --------------------------------------------------
  // OTP EMAIL
  // --------------------------------------------------

  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,

        subject:
          "Verify Your Free Booking OTP",

        text:
          `Hello ${user.name}, your OTP for booking ${event.title} is ${otp}. It is valid for 5 minutes.`,

        html: `
          <h2>Verify Your Booking</h2>

          <p>Hello ${user.name},</p>

          <p>
            Your booking for
            <strong>${event.title}</strong>
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

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  const result =
    await populateBooking(
      Booking.findById(booking._id)
    );

  return {
    booking: result,

    message:
      "Free booking OTP generated successfully. Please verify OTP.",

    otp,

    otpExpiresAt,
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

  if (booking.isOtpVerified) {
    return {
      booking,
      requiresPayment: booking.totalAmount > 0 && booking.bookingStatus !== "confirmed",
      isFree: booking.totalAmount === 0,
      message: "Booking OTP has already been verified.",
    };
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
      if (event.eventType !== "free") {
        event.availableSeats +=
          booking.ticketQuantity;

        if (
          event.availableSeats >
          event.totalSeats
        ) {
          event.availableSeats =
            event.totalSeats;
        }
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
  // SUCCESS: OTP VERIFIED
  // ==================================================

  booking.isOtpVerified = true;

  // --------------------------------------------------
  // PAID EVENT: Keep pending until SSLCommerz payment
  // --------------------------------------------------
  if (booking.totalAmount > 0) {
    booking.bookingStatus = "pending";
    booking.bookingOtp = null;
    booking.bookingOtpExpires = null;
    await booking.save();

    const result = await populateBooking(
      Booking.findById(booking._id)
    );

    return {
      booking: result,
      requiresPayment: true,
      isFree: false,
      message: "OTP verified successfully. Please proceed to payment to confirm your booking.",
    };
  }

  // --------------------------------------------------
  // FREE EVENT: Confirm immediately & generate Gate OTP
  // --------------------------------------------------
  booking.bookingStatus = "confirmed";
  booking.bookingOtp = generateBookingOtp(); // Gate attendance OTP
  booking.bookingOtpExpires = null;
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
  // CONFIRMATION EMAIL FOR FREE BOOKING
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
          `Hello ${user.name}, your free booking for ${event?.title || "the event"} has been confirmed successfully. Your venue check-in OTP is ${booking.bookingOtp}.`,
        html: `
          <h2>Booking Confirmed</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your free booking for <strong>${event?.title || "Event"}</strong> is now confirmed.</p>
          <p>Ticket Quantity: <strong>${booking.ticketQuantity}</strong></p>
          <p>Venue Check-In OTP: <strong style="color:#059669; font-size: 20px;">${booking.bookingOtp}</strong></p>
          <p>Please keep your booking OTP for event attendance.</p>
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
    requiresPayment: false,
    isFree: true,
    message: "Free booking confirmed successfully.",
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
  // RESTORE SEATS (paid events only)
  // ==================================================

  if (event.eventType !== "free") {

    event.availableSeats +=
      booking.ticketQuantity;

    if (
      event.availableSeats >
      event.totalSeats
    ) {
      event.availableSeats =
        event.totalSeats;
    }

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
  const now = new Date();

  const upcomingEvents =
    await Event.find({
      isDeleted: false,
    }).select(
      "_id eventDate startTime"
    );

  const upcomingEventIds =
    upcomingEvents
      .filter(
        (event) => {
          const eventDateTime =
            getEventEndDateTime(
              event
            );

          return (
            eventDateTime !== null &&
            eventDateTime > now
          );
        }
      )
      .map(
        (event) => event._id
      );

  return await populateBooking(
    Booking.find({
      user: userId,
      bookingStatus: "confirmed",
      event: {
        $in: upcomingEventIds,
      },
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
  const now = new Date();

  const upcomingEvents =
    await Event.find({
      isDeleted: false,
    }).select(
      "_id eventDate startTime"
    );

  const upcomingEventIds =
    upcomingEvents
      .filter(
        (event) => {
          const eventDateTime =
            getEventEndDateTime(
              event
            );

          return (
            eventDateTime !== null &&
            eventDateTime > now
          );
        }
      )
      .map(
        (event) => event._id
      );

  return await populateBooking(
    Booking.find({
      user: userId,
      bookingStatus: {
        $in: [
          "pending",
          "confirmed",
        ],
      },
      event: {
        $in: upcomingEventIds,
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

        if (event.eventType !== "free") {

          event.availableSeats =
            Math.min(
              event.totalSeats,
              event.availableSeats +
                booking.ticketQuantity
            );

        }


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

  const expiredEvents =
    await Event.find({
      isDeleted: false,
    }).select(
      "_id eventDate startTime"
    );

  const expiredEventIds =
    expiredEvents
      .filter(
        (event) => {
          const eventDateTime =
            getEventEndDateTime(
              event
            );

          return (
            eventDateTime !== null &&
            eventDateTime <= now
          );
        }
      )
      .map(
        (event) => event._id
      );

  return await populateBooking(
    Booking.find({
      user: userId,
      bookingStatus: "confirmed",
      event: {
        $in: expiredEventIds,
      },
    }).sort({ createdAt: -1 })
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBooking,
  generateFreeBookingOtp,
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