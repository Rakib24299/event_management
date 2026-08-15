const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");

const {createSSLSession,validateSSLPayment,} = require("./ssl.service");

const {generateBookingQRCode,} = require("./booking.service");

const {createNotification,} = require("./notification.service");


// Create Payment****


const createPayment = async (bookingId) => {

  const booking = await Booking.findById(bookingId)
    .populate("user")
    .populate("event");


  if (!booking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  if (booking.paymentStatus === "paid") {
    throw new AppError(
      "Payment already completed.",
      409
    );
  }


  if (booking.bookingStatus === "cancelled") {
    throw new AppError(
      "Cancelled booking cannot be paid.",
      400
    );
  }


  // ======================================================
  // Check Existing Payment
  // ======================================================

  const existingPayment = await Payment.findOne({
    booking: booking._id,
  });


  if (existingPayment) {

    // Already paid

    if (
      existingPayment.paymentStatus === "paid"
    ) {
      throw new AppError(
        "Payment already completed.",
        409
      );
    }


    // Existing pending payment

    if (
      existingPayment.paymentStatus === "pending"
    ) {

      const sslSession =
        await createSSLSession({
          payment: existingPayment,
          booking,
        });


      return {
        payment: existingPayment,
        gatewayUrl:
          sslSession.GatewayPageURL,
      };
    }


    // Failed or cancelled payment

    if (
      existingPayment.paymentStatus === "failed" ||
      existingPayment.paymentStatus === "cancelled"
    ) {

      await Payment.findByIdAndDelete(
        existingPayment._id
      );
    }
  }


  // ======================================================
  // Create Payment
  // ======================================================

  const payment = await Payment.create({

    booking: booking._id,

    user: booking.user,

    amount: booking.totalAmount,

    paymentMethod: "sslcommerz",

    paymentStatus: "pending",

    transactionId:
      `TXN-${Date.now()}`,
  });


  // ======================================================
  // Link Payment With Booking
  // ======================================================

  booking.payment =
    payment._id;

  await booking.save();


  // ======================================================
  // Create SSLCommerz Session
  // ======================================================

  let sslSession;


  try {

    sslSession =
      await createSSLSession({
        payment,
        booking,
      });

  } catch (error) {

    // Remove payment if SSL session creation fails

    await Payment.findByIdAndDelete(
      payment._id
    );


    // Remove payment reference from booking

    booking.payment = null;

    await booking.save();


    throw error;
  }


  // ======================================================
  // Return Payment + Gateway URL
  // ======================================================

  return {
    payment,
    gatewayUrl:
      sslSession.GatewayPageURL,
  };
};



// ======================================================
// Verify Payment
// ======================================================

const verifyPayment = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  return payment;
};



// ======================================================
// Payment Success
// ======================================================

const paymentSuccess = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.paymentStatus === "paid"
  ) {
    throw new AppError(
      "Payment is already completed.",
      409
    );
  }


  // Update Payment

  payment.paymentStatus = "paid";

  payment.paidAt = new Date();

  await payment.save();


  // Update Booking

  const confirmedBooking =
    await Booking.findByIdAndUpdate(
      payment.booking,
      {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        payment: payment._id,
      },
      {
        new: true,
      }
    );


  if (!confirmedBooking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // Generate QR Code

  await generateBookingQRCode(
    confirmedBooking._id
  );


  // ======================================================
  // Payment Success Notification
  // ======================================================

  await createNotification({

    user: payment.user,

    title: "Payment Successful",

    message:
      `Your payment of ${payment.amount} BDT was completed successfully.`,

    type: "payment",
  });


  return {
    message:
      "Payment completed successfully.",
  };
};



// ======================================================
// Payment Failed
// ======================================================

const paymentFailed = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.paymentStatus === "failed"
  ) {
    throw new AppError(
      "Payment is already marked as failed.",
      409
    );
  }


  payment.paymentStatus =
    "failed";

  await payment.save();


  // Payment failed notification

  await createNotification({

    user: payment.user,

    title: "Payment Failed",

    message:
      `Your payment of ${payment.amount} BDT could not be completed.`,

    type: "payment",
  });


  return {
    message:
      "Payment failed.",
  };
};



// ======================================================
// Payment Cancelled
// ======================================================

const paymentCancelled = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.paymentStatus ===
    "cancelled"
  ) {
    throw new AppError(
      "Payment is already cancelled.",
      409
    );
  }


  payment.paymentStatus =
    "cancelled";

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


  // Payment cancelled notification

  await createNotification({

    user: payment.user,

    title: "Payment Cancelled",

    message:
      `Your payment of ${payment.amount} BDT was cancelled.`,

    type: "payment",
  });


  return {
    message:
      "Payment cancelled successfully.",
  };
};



// ======================================================
// Get Payment By ID
// ======================================================

const getPaymentById = async (
  paymentId
) => {

  const payment =
    await Payment.findById(
      paymentId
    )
      .populate("booking")
      .populate(
        "user",
        "name email"
      );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  return payment;
};



// ======================================================
// Get My Payments
// ======================================================

const getMyPayments = async (
  userId
) => {

  const payments =
    await Payment.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });


  return payments;
};



// ======================================================
// Update Payment Status
// ======================================================

const updatePaymentStatus = async (
  paymentId,
  payload
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  const allowedStatus = [
    "pending",
    "paid",
    "failed",
    "cancelled",
    "refunded",
  ];


  if (
    !allowedStatus.includes(
      payload.paymentStatus
    )
  ) {
    throw new AppError(
      "Invalid payment status.",
      400
    );
  }


  payment.paymentStatus =
    payload.paymentStatus;


  await payment.save();


  // Sync Booking Payment Status

  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus:
        payload.paymentStatus,
    }
  );


  return payment;
};



// ======================================================
// Process Refund
// ======================================================

const processRefund = async (
  paymentId,
  refundAmount
) => {

  const payment =
    await Payment.findById(
      paymentId
    );


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  if (
    payment.paymentStatus !== "paid"
  ) {
    throw new AppError(
      "Only paid payments can be refunded.",
      400
    );
  }


  if (
    payment.refundAmount > 0
  ) {
    throw new AppError(
      "Refund has already been processed.",
      409
    );
  }


  if (
    refundAmount <= 0
  ) {
    throw new AppError(
      "Refund amount must be greater than 0.",
      400
    );
  }


  if (
    refundAmount > payment.amount
  ) {
    throw new AppError(
      "Refund amount cannot exceed payment amount.",
      400
    );
  }


  // Update Payment

  payment.refundAmount =
    refundAmount;

  payment.refundDate =
    new Date();

  payment.paymentStatus =
    "refunded";

  await payment.save();


  // Update Booking

  const booking =
    await Booking.findById(
      payment.booking
    );


  if (booking) {

    booking.refundAmount =
      refundAmount;

    booking.refundStatus =
      "refunded";

    await booking.save();
  }


  // Refund notification

  await createNotification({

    user: payment.user,

    title: "Refund Processed",

    message:
      `Your refund of ${refundAmount} BDT has been processed successfully.`,

    type: "refund",
  });


  return {
    payment,
    booking,
  };
};



// ======================================================
// SSL Payment Success
// ======================================================

const sslPaymentSuccess = async (
  payload
) => {

  const payment =
    await Payment.findOne({
      transactionId:
        payload.tran_id,
    });


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  // Validate Payment With SSLCommerz

  const validation =
    await validateSSLPayment(
      payload.val_id
    );


  if (
    validation.status !==
    "VALID"
  ) {
    throw new AppError(
      "Payment validation failed.",
      400
    );
  }


  // Update Payment

  payment.paymentStatus =
    "paid";

  payment.paidAt =
    new Date();

  payment.bankTransactionId =
    validation.bank_tran_id ||
    null;

  payment.valId =
    validation.val_id ||
    null;

  payment.gatewayResponse =
    validation;

  await payment.save();


  // Update Booking

  const confirmedBooking =
    await Booking.findByIdAndUpdate(
      payment.booking,
      {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        payment: payment._id,
      },
      {
        new: true,
      }
    );


  if (!confirmedBooking) {
    throw new AppError(
      "Booking not found.",
      404
    );
  }


  // Generate QR Code

  await generateBookingQRCode(
    confirmedBooking._id
  );


  // ======================================================
  // SSL Payment Success Notification
  // ======================================================

  await createNotification({

    user: payment.user,

    title: "Payment Successful",

    message:
      `Your payment of ${payment.amount} BDT was completed successfully.`,

    type: "payment",
  });


  return payment;
};



// ======================================================
// SSL Payment Failed
// ======================================================

const sslPaymentFail = async (
  payload
) => {

  const payment =
    await Payment.findOne({
      transactionId:
        payload.tran_id,
    });


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  payment.paymentStatus =
    "failed";

  payment.gatewayResponse =
    payload;

  await payment.save();


  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus: "failed",
    }
  );


  // SSL Payment Failed Notification

  await createNotification({

    user: payment.user,

    title: "Payment Failed",

    message:
      `Your payment of ${payment.amount} BDT could not be completed.`,

    type: "payment",
  });


  return payment;
};



// ======================================================
// SSL Payment Cancel
// ======================================================

const sslPaymentCancel = async (
  payload
) => {

  const payment =
    await Payment.findOne({
      transactionId:
        payload.tran_id,
    });


  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404
    );
  }


  payment.paymentStatus =
    "cancelled";

  payment.gatewayResponse =
    payload;

  await payment.save();


  await Booking.findByIdAndUpdate(
    payment.booking,
    {
      paymentStatus:
        "cancelled",
    }
  );


  // SSL Payment Cancel Notification

  await createNotification({

    user: payment.user,

    title: "Payment Cancelled",

    message:
      `Your payment of ${payment.amount} BDT was cancelled.`,

    type: "payment",
  });


  return payment;
};



// ======================================================
// SSL Payment IPN
// ======================================================

const sslPaymentIPN = async (
  payload
) => {

  return payload;
};



// ======================================================
// Export
// ======================================================

module.exports = {

  createPayment,

  verifyPayment,

  paymentSuccess,

  paymentFailed,

  paymentCancelled,

  getPaymentById,

  getMyPayments,

  updatePaymentStatus,

  processRefund,

  sslPaymentSuccess,

  sslPaymentFail,

  sslPaymentCancel,

  sslPaymentIPN,

};