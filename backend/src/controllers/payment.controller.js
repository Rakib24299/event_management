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
        "Payment created successfully.",

      data:
        result,

    });

  });


// ======================================================
// PROCESS DUMMY PAYMENT
// ======================================================
//
// Payment pending
//      ↓
// Payment paid
//      ↓
// OTP generated
//      ↓
// OTP sent through Brevo
// ======================================================

const processDummyPayment =
  catchAsync(async (req, res) => {

    const result =
      await paymentService.processDummyPayment(

        req.params.id,

        req.user.id,

        req.body

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

        otp:
          result.otp,

        otpExpiresAt:
          result.otpExpiresAt,

      },

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
// USER REFUND
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