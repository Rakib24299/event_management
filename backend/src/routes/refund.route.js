const express = require("express");

const refundController = require("../controllers/refund.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateRequest = require("../middlewares/validateRequest");

const {refundPaymentSchema,} = require("../validations/payment.validation");

const router = express.Router();



// Process Refund***

router.patch("/:paymentId",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(refundPaymentSchema),
  refundController.processRefund
);


module.exports = router;