const bookingService = require("../services/booking.service");
const ticketService = require("../services/ticket.service");
const catchAsync = require("../utils/catchAsync");

// ======================================================
// CREATE BOOKING
// ======================================================
// POST /api/v1/bookings
//
// Paid Event:
// Booking pending
//      ↓
// Seats reserved
//      ↓
// (No payment created — payment is created later
//  when user proceeds from Event Details)
//
// Free Event:
// Booking pending
//      ↓
// (No OTP generated — OTP is generated later
//  when user confirms from Event Details)
// ======================================================

const createBooking = catchAsync(async (req, res) => {
  const result = await bookingService.createBooking(
    req.user.id,
    req.body
  );

  return res.status(201).json({
    success: true,

    message:
      result.message || "Booking created successfully.",

    data: result,
  });
});


// ======================================================
// GENERATE FREE BOOKING OTP
// ======================================================
// POST /api/v1/bookings/free-otp
// Body: { bookingId }
//
// For free events: generates OTP, sends email,
// and prepares booking for OTP verification.
// ======================================================

const generateFreeBookingOtp = catchAsync(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required.",
    });
  }

  const result =
    await bookingService.generateFreeBookingOtp(
      bookingId,
      req.user.id
    );

  return res.status(200).json({
    success: true,

    message: result.message,

    data: {
      booking: result.booking,

      otp: result.otp,

      otpExpiresAt: result.otpExpiresAt,
    },
  });
});

// ======================================================
// VERIFY BOOKING OTP
// ======================================================
// POST /api/v1/bookings/verify-otp
//
// Paid Event:
// Payment paid
//      ↓
// OTP generated
//      ↓
// OTP verified
//      ↓
// Booking confirmed
// ======================================================

const verifyBookingOtp = catchAsync(async (req, res) => {
  const {
    bookingId,
    otp,
  } = req.body;

  // --------------------------------------------------
  // BOOKING ID CHECK
  // --------------------------------------------------

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required.",
    });
  }

  // --------------------------------------------------
  // OTP CHECK
  // --------------------------------------------------

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required.",
    });
  }

  // --------------------------------------------------
  // VERIFY OTP
  // --------------------------------------------------

  const result =
    await bookingService.verifyBookingOtp(
      bookingId,
      req.user.id,
      otp
    );

  return res.status(200).json({
    success: true,

    message: result.message,

    data: {
      booking: result.booking,
    },
  });
});

// ======================================================
// CANCEL BOOKING
// ======================================================
// PATCH /api/v1/bookings/:id/cancel
//
// Booking cancelled
//      ↓
// Seats restored
//      ↓
// Refund calculated
// ======================================================

const cancelBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.id;

  // --------------------------------------------------
  // BOOKING ID CHECK
  // --------------------------------------------------

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required.",
    });
  }

  // --------------------------------------------------
  // CANCEL BOOKING
  // --------------------------------------------------

  const result =
    await bookingService.cancelBooking(
      bookingId,
      req.user.id,
      req.user.role
    );

  return res.status(200).json({
    success: true,

    message: result.message,

    data: {
      refundPercentage:
        result.refundPercentage,

      refundAmount:
        result.refundAmount,

      refundStatus:
        result.refundStatus,
    },
  });
});

// ======================================================
// GET MY CONFIRMED BOOKINGS
// ======================================================
// GET /api/v1/bookings/my/confirmed
// ======================================================

const getMyConfirmedBookings = catchAsync(
  async (req, res) => {
    const result =
      await bookingService.getMyConfirmedBookings(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Your confirmed bookings fetched successfully.",

      data: result,
    });
  }
);

// ======================================================
// GET MY BOOKINGS
// ======================================================
// GET /api/v1/bookings/my
// ======================================================

const getMyBookings = catchAsync(async (req, res) => {
  const result =
    await bookingService.getMyBookings(
      req.user.id
    );

  return res.status(200).json({
    success: true,

    message:
      "Your bookings fetched successfully.",

    data: result,
  });
});

// ======================================================
// GET ORGANIZER / ADMIN BOOKINGS
// ======================================================
//
// Organizer:
// GET /api/v1/bookings/organizer
//
// Admin:
// GET /api/v1/bookings/admin
// ======================================================

const getOrganizerBookings = catchAsync(
  async (req, res) => {
    const result =
      await bookingService.getOrganizerBookings(
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,

      message:
        "Bookings fetched successfully.",

      data: result,
    });
  }
);

// ======================================================
// GET BOOKINGS FOR SPECIFIC EVENT
// ======================================================
// GET /api/v1/bookings/event/:eventId
// ======================================================

const getEventBookings = catchAsync(
  async (req, res) => {
    const result =
      await bookingService.getEventBookings(
        req.params.eventId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,

      message:
        "Event bookings fetched successfully.",

      data: result,
    });
  }
);

// ======================================================
// GET BOOKING BY ID
// ======================================================
// GET /api/v1/bookings/:id
// ======================================================

const getBookingById = catchAsync(
  async (req, res) => {
    const result =
      await bookingService.getBookingById(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,

      message:
        "Booking fetched successfully.",

      data: result,
    });
  }
);

// ======================================================
// UPDATE BOOKING STATUS
// ======================================================
// PATCH /api/v1/bookings/:id/status
//
// Body:
//
// {
//   "status": "completed"
// }
// ======================================================

const updateBookingStatus = catchAsync(
  async (req, res) => {
    const { status } = req.body;

    // --------------------------------------------------
    // STATUS CHECK
    // --------------------------------------------------

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required.",
      });
    }

    // --------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------

    const result =
      await bookingService.updateBookingStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,

      message:
        "Booking status updated successfully.",

      data: result,
    });
  }
);

// ======================================================
// DOWNLOAD TICKET PDF
// ======================================================
// GET /api/v1/bookings/:id/ticket/pdf
// ======================================================

const downloadTicketPdf = catchAsync(
  async (req, res) => {
    const bookingId = req.params.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    const pdfBuffer =
      await ticketService.getTicketPdfBuffer(
        bookingId,
        req.user.id
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="EventEase-Ticket-${bookingId}.pdf"`
    );

    res.setHeader(
      "Content-Length",
      pdfBuffer.length
    );

    return res.send(pdfBuffer);
  }
);


// ======================================================
// GET BOOKING HISTORY
// ======================================================
// GET /api/v1/bookings/history
// ======================================================

const getBookingHistory = catchAsync(
  async (req, res) => {
    const result =
      await bookingService.getBookingHistory(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Event history fetched successfully.",

      data: {
        bookings: result,
      },
    });
  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBooking,
  generateFreeBookingOtp,
  verifyBookingOtp,
  cancelBooking,
  getMyBookings,
  getMyConfirmedBookings,
  getOrganizerBookings,
  getEventBookings,
  getBookingById,
  updateBookingStatus,
  downloadTicketPdf,
  getBookingHistory,
};