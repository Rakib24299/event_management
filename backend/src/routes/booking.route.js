const express = require("express");

const bookingController =
  require("../controllers/booking.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");

const roleMiddleware =
  require("../middlewares/role.middleware");

const validateRequest =
  require("../middlewares/validateRequest");

const {
  createBookingSchema,
  verifyBookingOtpSchema,
  updateBookingStatusSchema,
  freeBookingOtpSchema,
} =
  require("../validations/booking.validation");


const router =
  express.Router();


// GENERATE FREE BOOKING OTP
// POST /api/v1/bookings/free-otp

router.post(
  "/free-otp",
  authMiddleware,
  validateRequest(freeBookingOtpSchema),
  bookingController.generateFreeBookingOtp
);

// SEND / RESEND BOOKING OTP (Free & Paid Events)
// POST /api/v1/bookings/send-otp
// POST /api/v1/bookings/:id/resend-otp

router.post(
  "/send-otp",
  authMiddleware,
  bookingController.sendBookingOtp
);

router.post(
  "/:id/resend-otp",
  authMiddleware,
  bookingController.sendBookingOtp
);


// USER


// CREATE BOOKING
// POST /api/v1/bookings

router.post(
  "/",
  authMiddleware,
  validateRequest(createBookingSchema),
  bookingController.createBooking
);


// VERIFY BOOKING OTP
// POST /api/v1/bookings/verify-otp

router.post(
  "/verify-otp",
  authMiddleware,
  validateRequest(verifyBookingOtpSchema),
  bookingController.verifyBookingOtp
);


// GET MY BOOKINGS
// GET /api/v1/bookings/my

router.get(
  "/my",
  authMiddleware,
  bookingController.getMyBookings
);


// GET MY CONFIRMED BOOKINGS
// GET /api/v1/bookings/my/confirmed

router.get(
  "/my/confirmed",
  authMiddleware,
  bookingController.getMyConfirmedBookings
);


// CANCEL BOOKING
// PATCH /api/v1/bookings/:id/cancel

router.patch(
  "/:id/cancel",
  authMiddleware,
  bookingController.cancelBooking
);


// ORGANIZER


// GET ORGANIZER BOOKINGS
// GET /api/v1/bookings/organizer

router.get(
  "/organizer",
  authMiddleware,
  roleMiddleware("organizer"),
  bookingController.getOrganizerBookings
);


// GET EVENT BOOKINGS
// GET /api/v1/bookings/event/:eventId

router.get(
  "/event/:eventId",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  bookingController.getEventBookings
);


// ADMIN


// GET ALL BOOKINGS
// GET /api/v1/bookings/admin

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  bookingController.getOrganizerBookings
);


// UPDATE BOOKING STATUS


// PATCH /api/v1/bookings/:id/status

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  validateRequest(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);


// DOWNLOAD TICKET PDF
// GET /api/v1/bookings/:id/ticket/pdf

router.get(
  "/:id/ticket/pdf",
  authMiddleware,
  bookingController.downloadTicketPdf
);


// GET BOOKING HISTORY
// GET /api/v1/bookings/history

router.get(
  "/history",
  authMiddleware,
  bookingController.getBookingHistory
);


// GET PUBLIC BOOKING BY ID

// GET /api/v1/bookings/public/:id
router.get(
  "/public/:id",
  bookingController.getPublicBookingById
);

// GET BOOKING BY ID
// MUST BE LAST

// GET /api/v1/bookings/:id
router.get(
  "/:id",
  authMiddleware,
  bookingController.getBookingById
);


// EXPORT

module.exports = router;