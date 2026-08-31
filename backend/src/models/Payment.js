const mongoose = require("mongoose");

const { Schema } = mongoose;

// ======================================================
// PAYMENT SCHEMA
// ======================================================

const paymentSchema = new Schema(
  {
    // ==================================================
    // USER
    // ==================================================

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // ==================================================
    // BOOKING
    // ==================================================

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
      unique: true,
    },

    // ==================================================
    // EVENT
    // ==================================================

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },

    // ==================================================
    // ORGANIZER
    // ==================================================

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },

    // ==================================================
    // GROSS AMOUNT
    // ==================================================

    grossAmount: {
      type: Number,
      required: [true, "Gross amount is required"],
      min: 0,
    },

    // ==================================================
    // PLATFORM FEE
    // ==================================================

    platformFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ==================================================
    // ORGANIZER AMOUNT
    // ==================================================

    organizerAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ==================================================
    // PAYMENT METHOD
    // ==================================================

    paymentMethod: {
      type: String,

      enum: [
        "sslcommerz",
        "dummy",
      ],

      default: "dummy",
    },

    // ==================================================
    // TRANSACTION ID
    // ==================================================

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    // ==================================================
    // SSL SESSION KEY
    // ==================================================

    sessionKey: {
      type: String,
      default: null,
      trim: true,
    },

    // ==================================================
    // SSL VALIDATION ID
    // ==================================================

    validationId: {
      type: String,
      default: null,
      trim: true,
    },

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    status: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],

      default: "pending",
    },

    // ==================================================
    // PAID AT
    // ==================================================

    paidAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // REFUND AMOUNT
    // ==================================================

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================================================
    // REFUND STATUS
    // ==================================================

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

    // ==================================================
    // REFUNDED AT
    // ==================================================

    refundedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // GATEWAY RESPONSE
    // ==================================================

    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ======================================================
// MODEL
// ======================================================

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

module.exports = Payment;