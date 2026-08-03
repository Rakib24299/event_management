const express = require("express");

const bookingController = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createBookingSchema,
  verifyBookingOtpSchema,
  updateBookingStatusSchema,
} = require("../validations/booking.validation");

const router = express.Router();


// Create Booking

router.post("/",authMiddleware,validateRequest(createBookingSchema),
  bookingController.createBooking
);

// Verify Booking OTP

router.post("/verify-otp",authMiddleware,validateRequest(verifyBookingOtpSchema),
  bookingController.verifyBookingOtp
);

// Get My Bookings

router.get( "/my-bookings",authMiddleware,
    bookingController.getMyBookings
);

// Get Booking By ID

router.get("/:id",authMiddleware,
  bookingController.getBookingById
);

// Cancel Booking
router.patch("/:id/cancel",authMiddleware,
  bookingController.cancelBooking
);


// Update Booking Status

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "organizer"),
  validateRequest(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

module.exports = router;