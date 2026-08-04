const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");

// Create Payment
const createPayment = async (bookingId) => {

  const booking = await Booking.findById(bookingId);

  if (!booking) 
    {
    throw new AppError("Booking not found.",404);
  }

  if (booking.paymentStatus === "paid") 
    {
    throw new AppError("Payment already completed.",409);
  }

  if (booking.bookingStatus === "cancelled") 
    {
    throw new AppError("Cancelled booking cannot be paid.",400);
  }

  const existingPayment = await Payment.findOne({booking: booking._id,});

  if (existingPayment) 
    {
    return existingPayment;
  }

  const payment = await Payment.create(
    {
    booking: booking._id,

    user: booking.user,

    amount: booking.totalAmount,

    paymentMethod: "online",

    paymentStatus: "pending",

    transactionId: `TXN-${Date.now()}`,
  });

  return payment;
};

// Verify Payment
const verifyPayment = async (paymentId) => {

  const payment = await Payment.findById(paymentId);

  if (!payment) 
    {
    throw new AppError("Payment not found.",404);
  }

  return payment;
};



// Payment Success****

const paymentSuccess = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment)
    {
    throw new AppError("Payment not found.",404);
  }

  if (payment.paymentStatus === "paid") 
    {
    throw new AppError("Payment is already completed.",409);
  }

  payment.paymentStatus = "paid";

  await payment.save();

  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus: "paid",
      bookingStatus: "confirmed",
    },
    {
      new: true,
    }
  );

  return {
    message: "Payment completed successfully.",
  };
};


// Payment Failed
const paymentFailed = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) 
    {
    throw new AppError("Payment not found.",404);
  }

  if (payment.paymentStatus === "failed")
    {
    throw new AppError("Payment is already marked as failed.",409);
  }

  payment.paymentStatus = "failed";

  await payment.save();

  return {
    message: "Payment failed.",
  };
};


// Payment Cancelled***

const paymentCancelled = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) 
    {
    throw new AppError("Payment not found.",404);
  }

  if (payment.paymentStatus === "cancelled") 
    {
    throw new AppError("Payment is already cancelled.",409);
  }

  payment.paymentStatus = "cancelled";

  await payment.save();

  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus: "cancelled",
    },
    {
      new: true,
    }
  );

  return {message: "Payment cancelled successfully.",};
};



// Get Payment By ID****

const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate("booking")
    .populate("user", "name email");

  if (!payment) 
    {
    throw new AppError("Payment not found.",404);
  }
  return payment;
};

// Get My Payments
    
const getMyPayments = async (userId) => {
  const payments = await Payment.find({
    user: userId,
  })
  .sort({
    createdAt: -1,
  });

  return payments;
};


// Update Payment Status
const updatePaymentStatus = async (paymentId,payload) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) 
    {
    throw new AppError("Payment not found.",404);
  }

  const allowedStatus = [
    "pending",
    "paid",
    "failed",
    "cancelled",
    "refunded",
  ];

  if (!allowedStatus.includes(payload.paymentStatus)) 
    {
    throw new AppError("Invalid payment status.",400);
  }

  payment.paymentStatus = payload.paymentStatus;

  await payment.save();

  // Booking paymentStatus sync
  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus: payload.paymentStatus,
    }
  );

  return payment;
};
module.exports = {
  createPayment,
  verifyPayment,
  paymentSuccess,
  paymentFailed,
  paymentCancelled,
  getPaymentById,
  getMyPayments,
  updatePaymentStatus,
};