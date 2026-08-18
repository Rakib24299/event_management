const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");


// Generate Dummy Transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `DUMMY-TXN-${timestamp}-${random}`;
};



// ======================================================
// Create Payment
// ======================================================

const createPayment = async (userId, payload) => {

  const booking = await Booking.findById(payload.booking);

  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // Check booking owner
  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to make payment for this booking.",
      403
    );
  }


  // Cancelled booking cannot be paid
  if (booking.bookingStatus === "cancelled") {
    throw new AppError(
      "Cancelled booking cannot be paid.",
      400
    );
  }


  // Already paid
  if (booking.paymentStatus === "paid") {
    throw new AppError(
      "Payment has already been completed.",
      400
    );
  }


  // Check existing pending/processing payment
  const existingPayment = await Payment.findOne({
    booking: booking._id,
    paymentStatus: {
      $in: ["pending", "processing"],
    },
  });


  if (existingPayment) {
    return existingPayment;
  }


  const payment = await Payment.create({
    booking: booking._id,
    user: userId,
    amount: booking.totalAmount,
    paymentMethod: payload.paymentMethod,
    currency: "BDT",
    paymentGateway: "Dummy",
    paymentStatus: "pending",
  });


  // Connect payment with booking
  booking.payment = payment._id;
  booking.paymentStatus = "pending";

  await booking.save();


  return payment;
};



// ======================================================
// Process Dummy Payment
// ======================================================

const processDummyPayment = async (
  paymentId,
  userId,
  payload
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


  // Check payment owner
  if (
    payment.user.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to process this payment.",
      403
    );
  }


  // Already paid
  if (payment.paymentStatus === "paid") {
    throw new AppError(
      "Payment has already been completed.",
      400
    );
  }


  // Cancelled / refunded payment
  if (
    payment.paymentStatus === "cancelled" ||
    payment.paymentStatus === "refunded"
  ) {
    throw new AppError(
      "This payment cannot be processed.",
      400
    );
  }


  // Set processing
  payment.paymentStatus = "processing";

  await payment.save();


  // Dummy payment decision
  // payload.paymentResult should be:
  // "success" or "failed"

  if (payload.paymentResult === "failed") {

    payment.paymentStatus = "failed";

    await payment.save();


    const booking = await Booking.findById(
      payment.booking
    );

    if (booking) {
      booking.paymentStatus = "failed";
      await booking.save();
    }


    return {
      payment,
      message: "Dummy payment failed.",
    };
  }


  // Successful Dummy Payment

  payment.paymentStatus = "paid";

  payment.transactionId =
    generateTransactionId();

  payment.paidAt = new Date();

  payment.paymentDate = new Date();

  await payment.save();


  // Update Booking

  const booking = await Booking.findById(
    payment.booking
  );

  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  booking.paymentStatus = "paid";

  booking.bookingStatus = "confirmed";

  booking.isOtpVerified = true;

  booking.bookingOtp = null;

  booking.otpExpiresAt = null;

  await booking.save();


  return {
    payment,
    booking,
    message: "Dummy payment successful.",
  };
};



// ======================================================
// Get Payment By ID
// ======================================================

const getPaymentById = async (
  paymentId,
  userId
) => {

  const payment = await Payment.findById(
    paymentId
  )
    .populate(
      "booking"
    )
    .populate(
      "user",
      "name email"
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  // User can only see own payment
  if (
    payment.user._id.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to access this payment.",
      403
    );
  }


  return payment;
};



// ======================================================
// Get Payment By Booking
// ======================================================

const getPaymentByBooking = async (
  bookingId,
  userId
) => {

  const booking = await Booking.findById(
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
      "You are not authorized to access this booking.",
      403
    );
  }


  const payment = await Payment.findOne({
    booking: bookingId,
  })
    .populate(
      "booking"
    )
    .populate(
      "user",
      "name email"
    );


  if (!payment) {
    throw new AppError(
      "Payment not found for this booking.",
      404
    );
  }


  return payment;
};



// ======================================================
// Process Refund
// ======================================================

const processRefund = async (
  paymentId,
  userId
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


  // Check payment owner
  if (
    payment.user.toString() !==
    userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to refund this payment.",
      403
    );
  }


  // Only paid payments can be refunded
  if (payment.paymentStatus !== "paid") {
    throw new AppError(
      "Only paid payments can be refunded.",
      400
    );
  }


  const booking = await Booking.findById(
    payment.booking
  );


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  if (booking.refundStatus !== "pending") {
    throw new AppError(
      "This booking is not eligible for refund.",
      400
    );
  }


  // Dummy refund

  payment.paymentStatus = "refunded";

  payment.refundAmount =
    booking.refundAmount;

  payment.refundDate = new Date();

  await payment.save();


  // Update Booking

  booking.refundStatus = "completed";

  await booking.save();


  return {
    payment,
    booking,
    message: "Dummy refund processed successfully.",
  };
};



// ======================================================
// Export
// ======================================================

module.exports = {
  createPayment,
  processDummyPayment,
  getPaymentById,
  getPaymentByBooking,
  processRefund,
};