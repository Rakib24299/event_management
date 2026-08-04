const bookingService = require("../services/booking.service");
const catchAsync = require("../utils/catchAsync");




// Create Booking

const createBooking = catchAsync(async (req, res) => {
  const result = await bookingService.createBooking(
    req.user.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Booking created successfully.",
    data: result,
  });
});



// Verify Booking OTP

const verifyBookingOtp = catchAsync(async (req, res) => {
  const result = await bookingService.verifyBookingOtp(
    req.body.bookingId,
    req.body.otp
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


// Cancel Booking

const cancelBooking = catchAsync(async (req, res) => {
  const result = await bookingService.cancelBooking(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// Get My Bookings

const getMyBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getMyBookings(req.user.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Get Booking By ID
const getBookingById = catchAsync(async (req, res) => {
  const result = await bookingService.getBookingById(req.params.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Update Booking Status

const updateBookingStatus = catchAsync(async (req, res) => {
  const result = await bookingService.updateBookingStatus(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Booking status updated successfully.",
    data: result,
  });
});

module.exports = {
  createBooking,
  verifyBookingOtp,
  cancelBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};