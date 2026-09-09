const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const AppError = require("../utils/AppError");


// ======================================================
// Scan QR Code & Mark Attendance
// ======================================================

const scanQRCode = async (qrData) => {

  if (!qrData) {
    throw new AppError(
      "QR code data is required.",
      400
    );
  }


  // Parse QR data
  let data;

  try {
    data =
      typeof qrData === "string"
        ? JSON.parse(qrData)
        : qrData;

  } catch (error) {
    throw new AppError(
      "Invalid QR code data.",
      400
    );
  }


  // Check booking ID
  if (!data.bookingId) {
    throw new AppError(
      "Invalid QR code. Booking ID is missing.",
      400
    );
  }


  // Find Booking
  const booking = await Booking.findById(
    data.bookingId
  )
    .populate("user", "name email")
    .populate("event", "title eventDate startTime endTime");


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // Check booking status
  if (booking.bookingStatus !== "confirmed") {
    throw new AppError(
      "This booking is not confirmed.",
      400
    );
  }


  // Check payment status
  const payment =
    await Payment.findById(
      booking.payment
    );



  if (
    !payment ||
    payment.status !== "paid"
  ) {
    throw new AppError(
      "Payment has not been completed.",
      400
    );

  }


  // Check already attended
  if (booking.isAttended) {
    throw new AppError(
      "Attendance has already been recorded for this booking.",
      409
    );
  }


  // Mark attendance
  booking.isAttended = true;

  booking.attendanceTime = new Date();

  await booking.save();


  return {
    bookingId: booking._id,
    user: booking.user,
    event: booking.event,
    isAttended: booking.isAttended,
    attendanceTime: booking.attendanceTime,
  };
};


module.exports = {
  scanQRCode,
};