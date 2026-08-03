const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");

const generateOTP = require("../utils/generateOTP");

// Create Booking

const createBooking = async (userId, payload) => {
  
  const event = await Event.findById(payload.event);

  if (!event || event.isDeleted)
 {
    throw new Error("Event not found.");
  }

  
  if (event.status !== "published")
    {
    throw new Error("This event is not available for booking.");
    }

  
  if (event.availableSeats < payload.ticketQuantity)
    {
    throw new Error("Not enough seats available.");
  }

 
  if (payload.ticketQuantity > event.maxTicketsPerUser)
    {
    throw new Error(`You can book maximum ${event.maxTicketsPerUser} tickets.`);
  }

  
  const previousBooking = await Booking.findOne(
    {
        user: userId,
        event: event._id,
        bookingStatus:
        {
        $in: ["pending", "confirmed"],
        },
  });

  if (previousBooking) 
    {
    throw new Error("You have already booked this event.");
  }

  // Generate OTP
  const otp = generateOTP();

  // Create Booking
  const booking = await Booking.create(
    {
        user: userId,
        event: event._id,
        ticketQuantity: payload.ticketQuantity,

        totalAmount:
        event.ticketPrice * payload.ticketQuantity,

        bookingOtp: otp,

        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),

        bookingStatus:
        event.eventType === "free"
            ? "confirmed"
            : "pending",

        paymentStatus:
        event.eventType === "free"
            ? "paid"
            : "pending",
    });

  // Reduce Available Seats
  event.availableSeats -= payload.ticketQuantity;

  await event.save();

  return booking;
};

// Verify Booking OTP

const verifyBookingOtp = async (bookingId, otp) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) 
    {
    throw new Error("Booking not found.");
  }

  if (booking.bookingOtp !== otp) 
    {
    throw new Error("Invalid OTP.");
  }

  if (
    !booking.otpExpiresAt ||
    booking.otpExpiresAt < new Date()
  ) {
    throw new Error("OTP has expired.");
  }

  booking.bookingStatus = "confirmed";
  booking.bookingOtp = null;
  booking.otpExpiresAt = null;

  await booking.save();

  return {
    message: "Booking confirmed successfully.",
  };
};


// Cancel Booking

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.user.toString() !== userId.toString()) 
    {
    throw new Error("Unauthorized.");
  }

  if (booking.bookingStatus === "cancelled") 
    {
    throw new Error("Booking already cancelled.");
  }

  booking.bookingStatus = "cancelled";

  await booking.save();

  const event = await Event.findById(booking.event);

  event.availableSeats += booking.ticketQuantity;

  await event.save();

  return {
    message: "Booking cancelled successfully.",
  };
};

// Get My Bookings

const getMyBookings = async (userId) => {
  return await Booking.find({
    user: userId,
  })
    .populate("event")
    .sort({ createdAt: -1 });
};

// Get Booking By ID

const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("user", "name email")
    .populate("event");

  if (!booking) {
    throw new Error("Booking not found.");
  }

  return booking;
};



// Update Booking Status


const updateBookingStatus = async (
  bookingId,
  payload
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.bookingStatus = payload.bookingStatus;

  await booking.save();

  return booking;
};

module.exports = {
  createBooking,
verifyBookingOtp,
  cancelBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};

