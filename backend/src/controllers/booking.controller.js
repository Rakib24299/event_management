const bookingService = require("../services/booking.service");

// Create Booking

const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBooking(
      req.user.id,
      req.body
    );

    return res.status(201).json(
    {
      success: true,
      message: "Booking created successfully.",
      data: result,
    });
  } 
  catch (error)
   {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Verify Booking OTP

const verifyBookingOtp = async (req, res) => {
  try {
    const result = await bookingService.verifyBookingOtp(
      req.body.bookingId,
      req.body.otp
    );

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  catch (error)
   {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// Cancel Booking

const cancelBooking = async (req, res) => {
  try {
    const result = await bookingService.cancelBooking(
      req.params.id,
      req.user.id
    );

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};
// Get My Bookings

const getMyBookings = async (req, res) => {
  try {
    const result = await bookingService.getMyBookings(req.user.id);

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  }

  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Get Booking By ID
const getBookingById = async (req, res) => {
  try {
    const result = await bookingService.getBookingById(req.params.id);

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  } 
  catch (error) 
  {
    return res.status(404).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Update Booking Status

const updateBookingStatus = async (req, res) => {
  try {
    const result = await bookingService.updateBookingStatus(
      req.params.id,
      req.body
    );

    return res.status(200).json(
    {
      success: true,
      message: "Booking status updated successfully.",
      data: result,
    });
  } 
  catch (error)
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  verifyBookingOtp,
  cancelBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};