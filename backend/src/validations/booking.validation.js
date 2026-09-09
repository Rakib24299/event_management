const Joi = require("joi");

// ======================================================
// CREATE BOOKING
// ======================================================

const createBookingSchema = Joi.object({
  eventId: Joi.string()
    .required()
    .messages({
      "string.empty": "Event ID is required.",
      "any.required": "Event ID is required.",
    }),

  ticketQuantity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      "number.base": "Ticket quantity must be a number.",
      "number.integer":
        "Ticket quantity must be a whole number.",
      "number.min":
        "At least 1 ticket is required.",
      "number.max":
        "You cannot buy more than 10 tickets at once.",
      "any.required":
        "Ticket quantity is required.",
    }),
});

// ======================================================
// VERIFY BOOKING OTP
// ======================================================

const verifyBookingOtpSchema = Joi.object({
  bookingId: Joi.string()
    .required()
    .messages({
      "string.empty":
        "Booking ID is required.",
      "any.required":
        "Booking ID is required.",
    }),

  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty":
        "OTP is required.",
      "string.pattern.base":
        "OTP must be a 6-digit number.",
      "any.required":
        "OTP is required.",
    }),
});

// ======================================================
// GENERATE FREE BOOKING OTP
// ======================================================

const freeBookingOtpSchema = Joi.object({
  bookingId: Joi.string()
    .required()
    .messages({
      "string.empty": "Booking ID is required.",
      "any.required": "Booking ID is required.",
    }),
});

// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "cancelled",
      "completed"
    )
    .required()
    .messages({
      "any.only":
        "Invalid booking status.",
      "any.required":
        "Booking status is required.",
    }),
});

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBookingSchema,
  verifyBookingOtpSchema,
  updateBookingStatusSchema,
  freeBookingOtpSchema,
};