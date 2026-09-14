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
      "http://localhost:3000";

    const bookingId =
      result.booking?._id || "";

    const paymentId =
      result.payment?._id || "";

    const eventId =
      result.booking?.event?._id ||
      result.booking?.event ||
      "";

    const basePath = frontendUrl.includes("5500")
      ? `${frontendUrl}/frontend/pages/user/payment-success.html`
      : `${frontendUrl}/pages/user/payment-success.html`;

    const redirectUrl = `${basePath}?bookingId=${encodeURIComponent(bookingId)}&paymentId=${encodeURIComponent(paymentId)}&eventId=${encodeURIComponent(eventId)}`;

    return res.redirect(redirectUrl);

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

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    const bookingId =
      result?.booking?._id || result?.booking || "";

    const basePath = frontendUrl.includes("5500")
      ? `${frontendUrl}/frontend/pages/user/my-bookings.html`
      : `${frontendUrl}/pages/user/my-bookings.html`;

    return res.redirect(
      `${basePath}?paymentStatus=failed&bookingId=${encodeURIComponent(bookingId)}`
    );

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

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    const bookingId =
      result?.booking?._id || result?.booking || "";

    const basePath = frontendUrl.includes("5500")
      ? `${frontendUrl}/frontend/pages/user/my-bookings.html`
      : `${frontendUrl}/pages/user/my-bookings.html`;

    return res.redirect(
      `${basePath}?paymentStatus=cancelled&bookingId=${encodeURIComponent(bookingId)}`
    );

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
// DOWNLOAD PAYMENT RECEIPT PDF
// ======================================================

const downloadPaymentReceipt = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required.",
    });
  }

  const result = await paymentService.getPaymentReceiptPdfBuffer(
    bookingId,
    req.user.id
  );

  const pdfBuffer = result.buffer;
  const transactionId = result.transactionId || "receipt";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="payment-receipt-${transactionId}.pdf"`
  );
  res.setHeader("Content-Length", pdfBuffer.length);

  return res.send(pdfBuffer);
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

  downloadPaymentReceipt,

};