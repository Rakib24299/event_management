const express = require("express");

const paymentController = require("../controllers/payment.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateRequest = require("../middlewares/validateRequest");

const {
  createPaymentSchema,
  updatePaymentStatusSchema,
} = require("../validations/payment.validation");

const router = express.Router();

// Create Payment

router.post(
  "/",
  authMiddleware,
  validateRequest(createPaymentSchema),
  paymentController.createPayment
);

// Verify Payment

router.get(
  "/:id",
  authMiddleware,
  paymentController.verifyPayment
);

// Payment Success

router.patch(
  "/:id/success",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.paymentSuccess
);

// Payment Failed

router.patch(
  "/:id/failed",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.paymentFailed
);


// Payment Cancelled

router.patch(
  "/:id/cancelled",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.paymentCancelled
);

// Get My Payments

router.get(
  "/my-payments",
  authMiddleware,
  paymentController.getMyPayments
);

// Update Payment Status

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(updatePaymentStatusSchema),
  paymentController.updatePaymentStatus
);

module.exports = router;