const express = require("express");

const refundController =
  require("../controllers/refund.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");

const roleMiddleware =
  require("../middlewares/role.middleware");


const router = express.Router();


// ======================================================
// Get Refund Information For Booking
// USER ONLY
// ======================================================

router.get(

  "/booking/:bookingId",

  authMiddleware,

  refundController.getRefundInformation

);


// ======================================================
// Get My Refunds
// USER ONLY
// ======================================================

router.get(

  "/my-refunds",

  authMiddleware,

  refundController.getMyRefunds

);


// ======================================================
// Process Refund
// ADMIN ONLY
// ======================================================

router.patch(

  "/:paymentId",

  authMiddleware,

  roleMiddleware("admin"),

  refundController.processRefund

);


module.exports = router;