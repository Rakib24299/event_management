const mongoose = require("mongoose");

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    // Booking Reference
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },

    // User Reference
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // Payment Amount
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 0,
    },

    // Dummy Transaction ID
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    // Dummy Payment Method
    paymentMethod: {
      type: String,
      enum: [
        "bkash",
        "nagad",
        "rocket",
        "card",
      ],
      required: [true, "Payment method is required"],
    },

    // Currency
    currency: {
      type: String,
      default: "BDT",
      uppercase: true,
      trim: true,
    },

    // Payment Gateway
    paymentGateway: {
      type: String,
      default: "Dummy",
      trim: true,
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // Refund Information
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundDate: {
      type: Date,
      default: null,
    },

    // Payment Date
    paymentDate: {
      type: Date,
      default: Date.now,
    },

    // Successful Payment Time
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;