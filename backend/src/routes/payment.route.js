const express = require("express");

const router = express.Router();

const paymentController =
  require("../controllers/payment.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");


// ======================================================
// CREATE PAYMENT
// ======================================================

router.post(
  "/create",
  authMiddleware,
  paymentController.createPayment
);

router.post(
  "/",
  authMiddleware,
  paymentController.createPayment
);


// ======================================================
// SSLCommerz CALLBACKS
// ======================================================
//
// IMPORTANT:
// These routes must NOT require login authentication
// because SSLCommerz calls these URLs directly.
//
// ======================================================


// SSLCommerz SUCCESS
router.post("/sslcommerz/success",
  paymentController.sslPaymentSuccess
);


// SSLCommerz FAILED
router.post( "/sslcommerz/fail", paymentController.sslPaymentFail
);


// SSLCommerz CANCELLED
router.post("/sslcommerz/cancel", paymentController.sslPaymentCancel);


// SSLCommerz IPN
router.post( "/sslcommerz/ipn", paymentController.sslPaymentIPN);


// ======================================================
// DOWNLOAD PAYMENT RECEIPT PDF
// ======================================================

router.get(
  "/booking/:bookingId/receipt",
  authMiddleware,
  paymentController.downloadPaymentReceipt
);


// ======================================================
// GET PAYMENT BY BOOKING
// ======================================================

router.get(
  "/booking/:bookingId",
  authMiddleware,
  paymentController.getPaymentByBooking
);


// ======================================================
// USER REQUEST REFUND
// ======================================================

router.post(
  "/:id/refund",
  authMiddleware,
  paymentController.processRefund
);


// ======================================================
// ORGANIZER PAYMENTS
// ======================================================

router.get(
  "/organizer/all",
  authMiddleware,
  paymentController.getOrganizerPayments
);


// ======================================================
// ADMIN PAYMENTS
// ======================================================

router.get(
  "/admin/all",
  authMiddleware,
  paymentController.getAdminPayments
);


// ======================================================
// ADMIN PENDING REFUNDS
// ======================================================

router.get(
  "/admin/refunds/pending",
  authMiddleware,
  paymentController.getPendingRefunds
);


// ======================================================
// ADMIN PROCESS REFUND
// ======================================================

router.patch(
  "/admin/refunds/:id/process",
  authMiddleware,
  paymentController.adminProcessRefund
);


// ======================================================
// PLATFORM FEE
// ======================================================

router.get(
  "/platform-fee",
  authMiddleware,
  paymentController.getPlatformFeePercentage
);


// ======================================================
// GET PAYMENT BY ID (must be last — generic /:id)
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  paymentController.getPaymentById
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
