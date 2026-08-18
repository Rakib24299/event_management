const express = require("express");

const paymentController = require("../controllers/payment.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const validateRequest = require("../middlewares/validateRequest");

const {
  createPaymentSchema,
} = require("../validations/payment.validation");

const router = express.Router();


// ======================================================
// Create Payment
// ======================================================

router.post(
  "/",
  authMiddleware,
  validateRequest(createPaymentSchema),
  paymentController.createPayment
);


// ======================================================
// Process Dummy Payment
// ======================================================

router.patch(
  "/:id/process",
  authMiddleware,
  paymentController.processDummyPayment
);


// ======================================================
// Get Payment By Booking
// ======================================================

router.get(
  "/booking/:bookingId",
  authMiddleware,
  paymentController.getPaymentByBooking
);


// ======================================================
// Get Payment By ID
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  paymentController.getPaymentById
);


// ======================================================
// Process Refund
// ======================================================

router.patch(
  "/:id/refund",
  authMiddleware,
  paymentController.processRefund
);


module.exports = router;