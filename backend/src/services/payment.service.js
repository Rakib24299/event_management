const Payment = require("../models/Payment");
const Booking = require("../models/Booking");


// Create Payment
const createPayment = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking)
     {
    throw new Error("Booking not found.");
     }

  if (booking.paymentStatus === "paid")
    {
    throw new Error("Payment already completed.");
    }

  const existingPayment = await Payment.findOne(
    {
    booking: booking._id,
    });

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
        throw new Error("Payment not found.");
        }

    return payment;
};

// Payment Success

const paymentSuccess = async (paymentId) => {
    const payment = await Payment.findById(paymentId);

    if (!payment)
        {
        throw new Error("Payment not found.");
        }

    payment.paymentStatus = "paid";

    await payment.save();

    await Booking.findByIdAndUpdate(
        payment.booking,
        {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        }
    );

    return {message: "Payment successful.",};
};


// Payment Failed

const paymentFailed = async (paymentId) => {
    const payment = await Payment.findById(paymentId);

    if (!payment)
    {
        throw new Error("Payment not found.");
    }

    payment.paymentStatus = "failed";

    await payment.save();

    return {message: "Payment failed.",};
};


// Payment Cancelled
const paymentCancelled = async (paymentId) => {
    const payment = await Payment.findById(paymentId);

    if (!payment) 
    {
        throw new Error("Payment not found.");
    }

    payment.paymentStatus = "cancelled";

    await payment.save();

    return {message: "Payment cancelled.",};
};

// Get Payment By ID

const getPaymentById = async (paymentId) => {
    const payment = await Payment.findById(paymentId)
        .populate("booking")
        .populate("user", "name email");

    if (!payment) 
    {
        throw new Error("Payment not found.");
    }

    return payment;
};

// Get My Payments
    
const getMyPayments = async (userId) => {
    return await Payment
        .find(
            {
            user: userId,
            })
        .sort({
            createdAt: -1,
            });
};


// Update Payment Status
const updatePaymentStatus = async (
  paymentId,
  payload
) => {
  const payment = await Payment.findById(paymentId);

  if (!payment)
    {
    throw new Error("Payment not found.");
    }

  payment.paymentStatus = payload.paymentStatus;

  await payment.save();

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