const paymentService =
  require("../services/payment.service");

const catchAsync =
  require("../utils/catchAsync");


// ======================================================
// CREATE PAYMENT
// ======================================================

const createPayment =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.createPayment(
        req.user.id,
        req.body
      );

    return res.status(201).json({

      success: true,

      message:
        "Payment session created successfully.",

      data:
        result,

    });

  });


// ======================================================
// SSL PAYMENT SUCCESS
// ======================================================
//
// SSLCommerz:
// Hosted Checkout
//      ↓
// Success URL
//      ↓
// Validate Payment
//      ↓
// Payment = Paid
//      ↓
// OTP Generate
//
// ======================================================

const sslPaymentSuccess =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.finalizeSSLPayment(
        req.body
      );

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://127.0.0.1:5500";

    const bookingId =
      result.booking?._id;

    const paymentId =
      result.payment?._id;

    if (
        result.booking?.isOtpVerified &&
        result.booking?.bookingStatus ===
          "confirmed"
    ) {

      return res.redirect(
        `${frontendUrl}/frontend/pages/user/payment-success.html`
      );

    }


    if (bookingId && paymentId) {

      const otpPage =
        `${frontendUrl}/frontend/pages/user/otp-verification.html?bookingId=${encodeURIComponent(bookingId)}&paymentId=${encodeURIComponent(paymentId)}`;

      return res.redirect(
        otpPage
      );

    }


    return res.redirect(
      `${frontendUrl}/frontend/pages/user/otp-verification.html`
    );

  });


// ======================================================
// SSL PAYMENT FAILED
// ======================================================

const sslPaymentFail =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.handleSSLFail(
        req.body
      );

    return res.status(200).json({

      success: false,

      message:
        "SSLCommerz payment failed.",

      data: {

        payment:
          result,

      },

    });

  });


// ======================================================
// SSL PAYMENT CANCELLED
// ======================================================

const sslPaymentCancel =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.handleSSLCancel(
        req.body
      );

    return res.status(200).json({

      success: false,

      message:
        "SSLCommerz payment was cancelled.",

      data: {

        payment:
          result,

      },

    });

  });


// ======================================================
// SSL IPN
// ======================================================
//
// SSLCommerz IPN
//      ↓
// Receive Gateway Data
//      ↓
// Validate Payment
//      ↓
// Update Payment
//      ↓
// Generate OTP
//
// ======================================================

const sslPaymentIPN =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.handleSSLIPN(
        req.body
      );

    return res.status(200).json({

      success: true,

      message:
        "SSLCommerz IPN processed successfully.",

      data:
        result,

    });

  });


// ======================================================
// GET PAYMENT BY ID
// ======================================================

const getPaymentById =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getPaymentById(

        req.params.id,

        req.user.id

      );

    return res.status(200).json({

      success: true,

      message:
        "Payment fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// GET PAYMENT BY BOOKING
// ======================================================

const getPaymentByBooking =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getPaymentByBooking(

        req.params.bookingId,

        req.user.id

      );

    return res.status(200).json({

      success: true,

      message:
        "Payment fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// USER REFUND REQUEST
// ======================================================

const processRefund =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.processRefund(

        req.params.id,

        req.user.id

      );

    return res.status(200).json({

      success: true,

      message:
        result.message,

      data: {

        payment:
          result.payment,

        booking:
          result.booking,

      },

    });

  });


// ======================================================
// ORGANIZER PAYMENTS
// ======================================================

const getOrganizerPayments =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getOrganizerPayments(

        req.user.id

      );

    return res.status(200).json({

      success: true,

      message:
        "Organizer payments fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// ADMIN PAYMENTS
// ======================================================

const getAdminPayments =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getAdminPayments();

    return res.status(200).json({

      success: true,

      message:
        "All payments fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// GET PENDING REFUNDS
// ======================================================

const getPendingRefunds =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getPendingRefunds();

    return res.status(200).json({

      success: true,

      message:
        "Pending refunds fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// ADMIN PROCESS REFUND
// ======================================================

const adminProcessRefund =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.adminProcessRefund(

        req.params.id

      );

    return res.status(200).json({

      success: true,

      message:
        result.message,

      data: {

        payment:
          result.payment,

        booking:
          result.booking,

        refundAmount:
          result.refundAmount,

      },

    });

  });


// ======================================================
// GET PLATFORM FEE PERCENTAGE
// ======================================================

const getPlatformFeePercentage =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.getPlatformFeePercentage();

    return res.status(200).json({

      success: true,

      message:
        "Platform fee percentage fetched successfully.",

      data: {

        platformFeePercentage:
          result,

      },

    });

  });


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  createPayment,

  sslPaymentSuccess,

  sslPaymentFail,

  sslPaymentCancel,

  sslPaymentIPN,

  getPaymentById,

  getPaymentByBooking,

  processRefund,

  getOrganizerPayments,

  getAdminPayments,

  getPendingRefunds,

  adminProcessRefund,

  getPlatformFeePercentage,

};