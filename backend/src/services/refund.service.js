const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const AppError = require("../utils/AppError");


// Calculate Refund

const calculateRefund = (eventDateTime, totalAmount) => {

  const now = new Date();
  const eventDate = new Date(eventDateTime);

  const differenceInMilliseconds =
    eventDate.getTime() - now.getTime();

  const daysUntilEvent =
    Math.floor(
      differenceInMilliseconds /
        (1000 * 60 * 60 * 24)
    );

  let refundPercentage = 0;

  // 6 or more days before event = 70%
  if (daysUntilEvent >= 6) {
    refundPercentage = 70;
  }

  // 3-5 days before event = 50%
  else if (
    daysUntilEvent >= 3 &&
    daysUntilEvent <= 5
  ) {
    refundPercentage = 50;
  }

  // 1-2 days before event = 20%
  else if (
    daysUntilEvent >= 1 &&
    daysUntilEvent <= 2
  ) {
    refundPercentage = 20;
  }

  // Less than 1 day = 0%
  else {
    refundPercentage = 0;
  }

  const refundAmount =
    (Number(totalAmount) * refundPercentage) / 100;

  return {
    daysUntilEvent,
    refundPercentage,
    refundAmount,
  };
};


// Get Refund Information
// User Only

const getRefundInformation = async (
  bookingId,
  userId
) => {

  const booking = await Booking.findById(
    bookingId
  ).populate("event");


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // User Ownership

  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to access this refund information.",
      403
    );
  }


  // Already cancelled

  if (
    booking.bookingStatus === "cancelled"
  ) {

    return {
      bookingId: booking._id,
      bookingStatus: booking.bookingStatus,
      refundPercentage: booking.refundPercentage,
      refundAmount: booking.refundAmount,
      refundStatus: booking.refundStatus,
      message:
        booking.refundStatus === "processed"
          ? "Refund has already been processed."
          : "Booking has already been cancelled.",
    };
  }


  // Event Check

  if (!booking.event) {

    throw new AppError(
      "Event no longer exists. Refund cannot be processed.",
      400
    );

  }


  // Event DateTime

   let eventDateTime = new Date(booking.event.eventDate);

  if (booking.event.startTime) {
    const timeParts =
      String(booking.event.startTime)
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


  // Calculate Refund

  const refund = calculateRefund(
    eventDateTime,
    booking.totalAmount
  );


  return {

    bookingId: booking._id,

    eventId: booking.event._id,

    eventDate: booking.event.eventDate,

    bookingStatus: booking.bookingStatus,

    totalAmount: booking.totalAmount,

    daysUntilEvent:
      refund.daysUntilEvent,

    refundPercentage:
      refund.refundPercentage,

    refundAmount:
      refund.refundAmount,

    refundStatus:
      booking.refundStatus,

  };
};


// Get My Refunds
// User Only

const getMyRefunds = async (userId) => {

  const bookings = await Booking.find({

    user: userId,

    refundStatus: {
      $in: ["pending", "processed"],
    },

  })

    .populate(
      "event",
      "title eventDate bannerImage"
    )

    .populate(
      "payment"
    )

    .sort({
      createdAt: -1,
    });


  return bookings;
};


// Process Refund
// Admin Only

const processRefund = async (
  paymentId
) => {

  const payment = await Payment.findById(
    paymentId
  );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  // Already refunded

  if (
    payment.status === "refunded"
  ) {

    throw new AppError(
      "This payment has already been refunded.",
      400
    );
  }


  // Payment must be paid

  if (
    payment.status !== "paid"
  ) {

    throw new AppError(
      "Only paid payments can be refunded.",
      400
    );
  }


  // Find Booking

  const booking = await Booking.findById(
    payment.booking
  );


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // Refund must be pending

  if (
    booking.refundStatus !== "pending"
  ) {

    throw new AppError(
      "This booking does not have a pending refund.",
      400
    );
  }


  // Refund Amount

  const refundAmount =
    Number(booking.refundAmount || 0);


  // No Refund

  if (refundAmount <= 0) {

    booking.refundStatus = "none";

    await booking.save();


    payment.status =
      "cancelled";

    payment.refundAmount = 0;

    payment.refundDate = null;

    await payment.save();


    return {

      payment,

      booking,

      message:
        "No refund is applicable for this booking.",

    };
  }


  // Process Dummy Refund

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


  return {

    payment,

    booking,

    message:
      `Refund of ৳${refundAmount} processed successfully.`,

  };
};


// Export

module.exports = {

  calculateRefund,

  getRefundInformation,

  getMyRefunds,

  processRefund,

};