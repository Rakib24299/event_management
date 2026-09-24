const mongoose = require("mongoose");

const { Schema } = mongoose;

// BOOKING SCHEMA

const bookingSchema = new Schema(
  {
    // 
    // USER
    // 

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // EVENT

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },

    // TICKET QUANTITY

    ticketQuantity: {
      type: Number,

      required: [
        true,
        "Ticket quantity is required",
      ],

      min: [
        1,
        "At least 1 ticket is required.",
      ],
// max 5 (ticket)
      max: [
        5,
        "You cannot buy more than 5 tickets at once.",
      ],
    },

    // TOTAL AMOUNT

    totalAmount: {
      type: Number,

      required: [
        true,
        "Total amount is required",
      ],

      min: [
        0,
        "Total amount cannot be negative.",
      ],
    },

    // BOOKING STATUS

    bookingStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],

      default: "pending",
    },

    // BOOKING OTP

    bookingOtp: {
      type: String,
      default: null,
    },

    // BOOKING OTP EXPIRY

    bookingOtpExpires: {
      type: Date,
      default: null,
    },

    // OTP VERIFIED

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // ATTENDANCE

    isAttended: {
      type: Boolean,
      default: false,
    },

    // ATTENDANCE TIME

    attendanceTime: {
      type: Date,
      default: null,
    },

    // REFUND PERCENTAGE

    refundPercentage: {
      type: Number,

      default: 0,

      min: 0,

      max: 100,
    },

    // REFUND AMOUNT

    refundAmount: {
      type: Number,

      default: 0,

      min: 0,
    },

    // REFUND STATUS

    refundStatus: {
      type: String,

      enum: [
        "none",
        "pending",
        "processed",
        "failed",
      ],

      default: "none",
    },

    // CANCELLED AT

    cancelledAt: {
      type: Date,
      default: null,
    },

    // PAYMENT

    payment: {
      type: Schema.Types.ObjectId,

      ref: "Payment",

      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// MODEL

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

module.exports = Booking;