const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const {
  calculateRefund,
} = require("./refund.service");

const {
  generateQRCode,
} = require("./qr.service");

const generateOTP = require("../utils/generateOTP");

const {
  createNotification,
} = require("./notification.service");


// ======================================================
// Create Booking
// ======================================================

const createBooking = async (userId, payload) => {

  const event = await Event.findById(
    payload.event
  );

  if (!event || event.isDeleted) {
    throw new AppError(
      "Event not found.",
      404
    );
  }


  if (event.status !== "published") {
    throw new AppError(
      "This event is not available for booking.",
      400
    );
  }


  if (
    event.availableSeats <
    payload.ticketQuantity
  ) {
    throw new AppError(
      "Not enough seats available.",
      400
    );
  }


  if (
    payload.ticketQuantity >
    event.maxTicketsPerUser
  ) {
    throw new AppError(
      `You can book maximum ${event.maxTicketsPerUser} tickets.`,
      400
    );
  }


  // Check previous booking

  const previousBooking =
    await Booking.findOne({
      user: userId,
      event: event._id,

      bookingStatus: {
        $in: [
          "pending",
          "confirmed",
        ],
      },

      paymentStatus: {
        $ne: "failed",
      },
    });


  if (previousBooking) {
    throw new AppError(
      "You have already booked this event.",
      409
    );
  }


  const otp = generateOTP();


  const booking =
    await Booking.create({

      user: userId,

      event: event._id,

      ticketQuantity:
        payload.ticketQuantity,

      totalAmount:
        event.ticketPrice *
        payload.ticketQuantity,

      bookingOtp: otp,

      bookingOtpExpires:
        new Date(
          Date.now() +
          10 * 60 * 1000
        ),

      bookingStatus:
        event.eventType === "free"
          ? "confirmed"
          : "pending",

      paymentStatus:
        event.eventType === "free"
          ? "paid"
          : "pending",

      payment: null,

      isOtpVerified:
        event.eventType === "free"
          ? true
          : false,
    });


  // Reduce available seats

  event.availableSeats -=
    payload.ticketQuantity;

  await event.save();


  // Populate booking data

  await booking.populate([
    {
      path: "event",
      select:
        "title ticketPrice eventDate",
    },

    {
      path: "user",
      select:
        "name email",
    },
  ]);


  // ====================================================
  // Booking Notification
  // ====================================================

  await createNotification({
    user: userId,

    title: "Booking Created",

    message:
      `Your booking for "${event.title}" has been created successfully.`,

    type: "booking",
  });


  return booking;
};



// ======================================================
// Verify Booking OTP
// ======================================================

const verifyBookingOtp = async (
  bookingId,
  otp
) => {

  const booking =
    await Booking.findById(
      bookingId
    );


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  if (
    booking.bookingStatus ===
    "confirmed"
  ) {
    throw new AppError(
      "Booking is already confirmed.",
      400
    );
  }


  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw new AppError(
      "This booking has been cancelled.",
      400
    );
  }


  if (
    booking.bookingOtp !== otp
  ) {
    throw new AppError(
      "Invalid OTP.",
      400
    );
  }


  if (
    !booking.bookingOtpExpires ||
    booking.bookingOtpExpires < new Date()
  ) {
    throw new AppError(
      "OTP has expired.",
      400
    );
  }


  booking.bookingStatus =
    "confirmed";

  booking.bookingOtp = null;

  booking.bookingOtpExpires = null;

  await booking.save();


  return {
    message:
      "Booking confirmed successfully.",
  };
};



// ======================================================
// Cancel Booking
// ======================================================

const cancelBooking = async (
  bookingId,
  userId
) => {

  const booking =
    await Booking.findById(
      bookingId
    );


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to cancel this booking.",
      403
    );
  }


  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw new AppError(
      "Booking is already cancelled.",
      400
    );
  }


  const event =
    await Event.findById(
      booking.event
    );


  if (!event) {
    throw new AppError(
      "Event not found.",
      404
    );
  }


  // Calculate refund

  const refund =
    calculateRefund(
      event.eventDate,
      booking.totalAmount
    );


  // Restore available seats

  event.availableSeats +=
    booking.ticketQuantity;

  await event.save();


  // Update booking

  booking.bookingStatus =
    "cancelled";


  booking.refundPercentage =
    refund.refundPercentage;


  booking.refundAmount =
    refund.refundAmount;


  booking.refundStatus =
    refund.refundPercentage > 0
      ? "pending"
      : "none";


  booking.cancelledAt =
    new Date();


  booking.bookingOtp = null;

  booking.bookingOtpExpires = null;


  await booking.save();


  // Cancellation notification

  await createNotification({
    user: userId,

    title: "Booking Cancelled",

    message:
      `Your booking for "${event.title}" has been cancelled. Refund amount: ${refund.refundAmount} BDT.`,

    type: "refund",
  });


  return {

    message:
      "Booking cancelled successfully.",

    refundPercentage:
      refund.refundPercentage,

    refundAmount:
      refund.refundAmount,

    refundStatus:
      booking.refundStatus,
  };
};



// ======================================================
// Get My Bookings
// ======================================================

const getMyBookings = async (
  userId
) => {

  const bookings =
    await Booking.find({
      user: userId,
    })
      .populate("event")
      .sort({
        createdAt: -1,
      });


  return bookings;
};



// ======================================================
// Get Booking By ID
// ======================================================

const getBookingById = async (
  bookingId
) => {

  const booking =
    await Booking.findById(
      bookingId
    )
      .populate(
        "user",
        "name email"
      )
      .populate("event");


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  return booking;
};



// ======================================================
// Update Booking Status
// ======================================================

const updateBookingStatus = async (
  bookingId,
  payload
) => {

  const booking =
    await Booking.findById(
      bookingId
    );


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  const allowedStatus = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ];


  if (
    !allowedStatus.includes(
      payload.bookingStatus
    )
  ) {
    throw new AppError(
      "Invalid booking status.",
      400
    );
  }


  booking.bookingStatus =
    payload.bookingStatus;


  await booking.save();


  return booking;
};



// ======================================================
// Generate QR Code for Confirmed Booking
// ======================================================

const generateBookingQRCode =
  async (bookingId) => {

    const booking =
      await Booking.findById(
        bookingId
      )
        .populate(
          "event",
          "title eventDate"
        )
        .populate(
          "user",
          "name email"
        );


    if (!booking) {
      throw new AppError(
        "Booking not found.",
        404
      );
    }


    if (
      booking.bookingStatus !==
      "confirmed"
    ) {
      throw new AppError(
        "QR code can only be generated for confirmed bookings.",
        400
      );
    }


    const qrData = {

      bookingId:
        booking._id.toString(),

      eventId:
        booking.event._id.toString(),

      userId:
        booking.user._id.toString(),
    };


    const qrCode =
      await generateQRCode(
        qrData
      );


    booking.qrCode =
      qrCode;


    await booking.save();


    return booking;
  };



module.exports = {

  createBooking,

  verifyBookingOtp,

  cancelBooking,

  getMyBookings,

  getBookingById,

  updateBookingStatus,

  generateBookingQRCode,

};