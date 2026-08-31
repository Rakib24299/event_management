const express = require("express");

const paymentController =
  require("../controllers/payment.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");

const roleMiddleware =
  require("../middlewares/role.middleware");

const validateRequest =
  require("../middlewares/validateRequest");

const {
  createPaymentSchema,
  processDummyPaymentSchema,
} =
  require("../validations/payment.validation");


const router =
  express.Router();


// ======================================================
// USER PAYMENT
// ======================================================


// ------------------------------------------------------
// CREATE PAYMENT
// POST /api/v1/payments
// ------------------------------------------------------

router.post(
  "/",
  authMiddleware,
  validateRequest(createPaymentSchema),
  paymentController.createPayment
);


// ------------------------------------------------------
// PROCESS DUMMY PAYMENT
// PATCH /api/v1/payments/:id/dummy
// ------------------------------------------------------

router.patch(
  "/:id/dummy",
  authMiddleware,
  validateRequest(processDummyPaymentSchema),
  paymentController.processDummyPayment
);


// ------------------------------------------------------
// GET PAYMENT BY BOOKING
// GET /api/v1/payments/booking/:bookingId
// ------------------------------------------------------

router.get(
  "/booking/:bookingId",
  authMiddleware,
  paymentController.getPaymentByBooking
);


// ------------------------------------------------------
// USER REFUND REQUEST
// PATCH /api/v1/payments/:id/refund
// ------------------------------------------------------

router.patch(
  "/:id/refund",
  authMiddleware,
  paymentController.processRefund
);


// ======================================================
// ORGANIZER
// ======================================================


// ------------------------------------------------------
// GET ORGANIZER PAYMENTS
// GET /api/v1/payments/organizer
// ------------------------------------------------------

router.get(
  "/organizer",
  authMiddleware,
  roleMiddleware("organizer"),
  paymentController.getOrganizerPayments
);


// ------------------------------------------------------
// GET PLATFORM FEE PERCENTAGE
// GET /api/v1/payments/config/platform-fee
// ------------------------------------------------------

router.get(
  "/config/platform-fee",
  authMiddleware,
  paymentController.getPlatformFeePercentage
);


// ======================================================
// ADMIN
// ======================================================


// ------------------------------------------------------
// GET ALL PAYMENTS
// GET /api/v1/payments/admin
// ------------------------------------------------------

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.getAdminPayments
);


// ------------------------------------------------------
// GET PENDING REFUNDS
// GET /api/v1/payments/admin/pending-refunds
// ------------------------------------------------------

router.get(
  "/admin/pending-refunds",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.getPendingRefunds
);


// ------------------------------------------------------
// PROCESS REFUND
// PATCH /api/v1/payments/admin/:id/refund
// ------------------------------------------------------

router.patch(
  "/admin/:id/refund",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.adminProcessRefund
);


// ======================================================
// GET PAYMENT BY ID
// MUST BE LAST
// ======================================================

// GET /api/v1/payments/:id

router.get(
  "/:id",
  authMiddleware,
  paymentController.getPaymentById
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;