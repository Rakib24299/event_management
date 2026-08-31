const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail");


// ======================================================
// ERROR HELPER
// ======================================================

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};


// ======================================================
// GENERATE TRANSACTION ID
// ======================================================

const generateTransactionId = () => {
  return `DUMMY-${Date.now()}-${Math.floor(
    Math.random() * 100000
  )}`;
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

const getOtpExpiry = () => {
  return new Date(
    Date.now() + 5 * 60 * 1000
  );
};


// ======================================================
// PLATFORM FEE
// ======================================================

const getPlatformFeePercentage = () => {
  return Number(
    process.env.PLATFORM_FEE_PERCENTAGE || 10
  );
};


// ======================================================
// CREATE PAYMENT
// ======================================================
// Creates a payment record for a pending booking
// if one does not already exist.
// ======================================================

const createPayment = async (
  userId,
  paymentData
) => {

  const { booking } = paymentData || {};

  if (!booking) {
    throw createError(
      "Booking ID is required.",
      400
    );
  }


  const bookingData =
    await Booking.findById(booking)
      .populate("event");


  if (!bookingData) {
    throw createError(
      "Booking not found.",
      404
    );
  }


  if (
    bookingData.user.toString() !==
    userId.toString()
  ) {
    throw createError(
      "You are not authorized to create payment for this booking.",
      403
    );
  }


  if (
    bookingData.bookingStatus !==
    "pending"
  ) {
    throw createError(
      "Payment can only be created for a pending booking.",
      400
    );
  }


  if (!bookingData.event) {
    throw createError(
      "Event not found.",
      404
    );
  }


  if (
    bookingData.event.eventType ===
    "free"
  ) {
    throw createError(
      "Payment is not required for a free event.",
      400
    );
  }


  let payment = null;


  if (bookingData.payment) {
    payment =
      await Payment.findById(
        bookingData.payment
      );
  }


  if (!payment) {

    const totalAmount =
      Number(
        bookingData.totalAmount || 0
      );

    const platformFeePercentage =
      Number(
        process.env.PLATFORM_FEE_PERCENTAGE ||
          10
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
          totalAmount - platformFee
        ).toFixed(2)
      );

    payment =
      await Payment.create({
        user: userId,

        booking: bookingData._id,

        event: bookingData.event._id,

        organizer:
          bookingData.event.organizer,

        grossAmount: totalAmount,

        platformFee,

        organizerAmount,

        paymentMethod: "dummy",

        status: "pending",

        refundAmount: 0,

        refundStatus: "none",
      });


    bookingData.payment =
      payment._id;

    await bookingData.save();

  }


  if (!payment) {
    throw createError(
      "Payment record not found.",
      404
    );
  }


  return payment;

};


// ======================================================
// PROCESS DUMMY PAYMENT
// ======================================================
//
// Payment pending
//       ↓
// User pays
//       ↓
// Payment paid
//       ↓
// Generate OTP
//       ↓
// Send OTP through Brevo
//       ↓
// User verifies OTP
// ======================================================

const processDummyPayment = async (
  paymentId,
  userId,
  paymentData
) => {

  const {
    paymentResult = "success",
  } = paymentData || {};


  // --------------------------------------------------
  // FIND PAYMENT
  // --------------------------------------------------

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw createError(
      "Payment not found.",
      404
    );
  }


  // --------------------------------------------------
  // OWNER CHECK
  // --------------------------------------------------

  if (
    payment.user.toString() !==
    userId.toString()
  ) {
    throw createError(
      "You are not authorized to process this payment.",
      403
    );
  }


  // --------------------------------------------------
  // PAYMENT METHOD
  // --------------------------------------------------

  if (
    payment.paymentMethod !==
    "dummy"
  ) {
    throw createError(
      "This payment is not a dummy payment.",
      400
    );
  }


  // --------------------------------------------------
  // ALREADY PAID
  // --------------------------------------------------

  if (
    payment.status ===
    "paid"
  ) {
    throw createError(
      "Payment has already been completed.",
      400
    );
  }


  // --------------------------------------------------
  // BOOKING
  // --------------------------------------------------

  const booking =
    await Booking.findById(
      payment.booking
    );


  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }


  if (
    booking.bookingStatus ===
    "cancelled"
  ) {
    throw createError(
      "This booking has already been cancelled.",
      400
    );
  }


  // ==================================================
  // FAILED PAYMENT
  // ==================================================

  if (
    paymentResult ===
    "failed"
  ) {

    payment.status =
      "failed";

    payment.gatewayResponse = {
      type: "dummy",
      result: "failed",
      processedAt: new Date(),
    };

    await payment.save();


    return {
      message:
        "Dummy payment failed.",

      payment,

      booking,

      otp: null,

      otpExpiresAt: null,
    };
  }


  // ==================================================
  // SUCCESSFUL PAYMENT
  // ==================================================

  const otp =
    generateBookingOtp();

  const otpExpiresAt =
    getOtpExpiry();


  // --------------------------------------------------
  // UPDATE PAYMENT
  // --------------------------------------------------

  payment.status =
    "paid";

  payment.paymentMethod =
    "dummy";

  payment.transactionId =
    generateTransactionId();

  payment.paidAt =
    new Date();

  payment.gatewayResponse = {
    type: "dummy",
    result: "success",
    processedAt: new Date(),
  };

  await payment.save();


  // --------------------------------------------------
  // UPDATE BOOKING
  // --------------------------------------------------

  booking.payment =
    payment._id;

  booking.bookingOtp =
    otp;

  booking.bookingOtpExpires =
    otpExpiresAt;

  booking.isOtpVerified =
    false;

  booking.bookingStatus =
    "pending";

  await booking.save();


  // ==================================================
  // GET USER EMAIL
  // ==================================================

  const user =
    await require("../models/User").findById(
      userId
    ).select(
      "name email"
    );


  if (!user) {
    throw createError(
      "User not found.",
      404
    );
  }


  // ==================================================
  // SEND OTP THROUGH BREVO
  // ==================================================

  if (user?.email) {
    try {
      await sendEmail({

        to: user.email,

        subject:
          "EventEase Booking Verification OTP",

        text:
          `Your EventEase booking verification OTP is ${otp}. This OTP is valid for 5 minutes.`,

        html: `
          <div>
            <h2>EventEase Booking Verification</h2>

            <p>Hello ${user.name},</p>

            <p>
              Your payment was successful.
              Please use the following OTP to confirm your booking:
            </p>

            <h1>${otp}</h1>

            <p>
              This OTP is valid for 5 minutes.
            </p>

            <p>
              If you did not make this booking, please contact support.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        "Dummy payment OTP email failed:",
        error.message
      );
    }
  }


  // ==================================================
  // RETURN UPDATED BOOKING
  // ==================================================

  const updatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "user",
        "name email profileImage"
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


  return {

    message:
      "Dummy payment successful. OTP has been sent to your email.",

    payment,

    booking:
      updatedBooking,

    otp,

    otpExpiresAt,
  };
};


// ======================================================
// GET PAYMENT BY ID
// ======================================================

const getPaymentById = async (
  paymentId,
  userId
) => {

  const payment =
    await Payment.findById(
      paymentId
    )
      .populate(
        "user",
        "name email profileImage"
      )
      .populate("event")
      .populate("booking")
      .populate(
        "organizer",
        "name email organizationName organizationLogo"
      );


  if (!payment) {
    throw createError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.user &&
    payment.user._id.toString() ===
    userId.toString()
  ) {
    return payment;
  }


  if (
    payment.organizer &&
    payment.organizer._id.toString() ===
    userId.toString()
  ) {
    return payment;
  }


  throw createError(
    "You are not authorized to view this payment.",
    403
  );
};


// ======================================================
// GET PAYMENT BY BOOKING
// ======================================================

const getPaymentByBooking = async (
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


  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw createError(
      "You are not authorized to view this payment.",
      403
    );
  }


  if (!booking.payment) {
    return null;
  }


  return await Payment.findById(
    booking.payment
  )
    .populate("event")
    .populate("booking")
    .populate(
      "organizer",
      "name email organizationName organizationLogo"
    );
};


// ======================================================
// PROCESS USER REFUND
// ======================================================

const processRefund = async (
  paymentId,
  userId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw createError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.user.toString() !==
    userId.toString()
  ) {
    throw createError(
      "You are not authorized to request this refund.",
      403
    );
  }


  if (
    payment.status !== "paid" &&
    payment.status !== "partially_refunded"
  ) {
    throw createError(
      "Only paid payments can be refunded.",
      400
    );
  }


  if (
    payment.refundStatus ===
    "processed"
  ) {
    throw createError(
      "This payment has already been refunded.",
      400
    );
  }


  const booking =
    await Booking.findById(
      payment.booking
    );


  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }


  if (
    booking.bookingStatus !==
    "cancelled"
  ) {
    throw createError(
      "Please cancel the booking before requesting a refund.",
      400
    );
  }


  if (
    Number(
      booking.refundAmount
    ) <= 0
  ) {
    throw createError(
      "No refund is applicable for this booking.",
      400
    );
  }


  payment.refundAmount =
    Number(
      booking.refundAmount
    );

  payment.refundStatus =
    "pending";

  await payment.save();


  booking.refundStatus =
    "pending";

  await booking.save();


  return {

    message:
      "Refund request submitted successfully.",

    payment,

    booking,
  };
};


// ======================================================
// GET ORGANIZER PAYMENTS
// ======================================================

const getOrganizerPayments = async (
  userId
) => {

  return await Payment.find({
    organizer: userId,
  })
    .populate(
      "user",
      "name email profileImage"
    )
    .populate(
      "event",
      "title eventDate"
    )
    .populate("booking")
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// GET ADMIN PAYMENTS
// ======================================================

const getAdminPayments = async () => {

  return await Payment.find()
    .populate(
      "user",
      "name email profileImage"
    )
    .populate(
      "organizer",
      "name email organizationName organizationLogo"
    )
    .populate(
      "event",
      "title eventDate"
    )
    .populate("booking")
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// GET PENDING REFUNDS
// ======================================================

const getPendingRefunds = async () => {

  return await Payment.find({
    refundStatus: "pending",
  })
    .populate(
      "user",
      "name email profileImage"
    )
    .populate(
      "organizer",
      "name email organizationName organizationLogo"
    )
    .populate(
      "event",
      "title eventDate"
    )
    .populate("booking")
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// ADMIN PROCESS REFUND
// ======================================================

const adminProcessRefund = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw createError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.refundStatus !==
    "pending"
  ) {
    throw createError(
      "This payment does not have a pending refund.",
      400
    );
  }


  const booking =
    await Booking.findById(
      payment.booking
    );


  if (!booking) {
    throw createError(
      "Booking not found.",
      404
    );
  }


  // --------------------------------------------------
  // DUMMY REFUND
  // --------------------------------------------------

  payment.status =
    payment.refundAmount >=
    payment.grossAmount
      ? "refunded"
      : "partially_refunded";

  payment.refundStatus =
    "processed";

  payment.refundedAt =
    new Date();

  await payment.save();


  booking.refundStatus =
    "processed";

  await booking.save();


  return {

    message:
      "Refund processed successfully.",

    payment,

    booking,

    refundAmount:
      payment.refundAmount,
  };
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  createPayment,

  processDummyPayment,

  getPaymentById,

  getPaymentByBooking,

  processRefund,

  getOrganizerPayments,

  getAdminPayments,

  getPendingRefunds,

  adminProcessRefund,

  getPlatformFeePercentage,

};