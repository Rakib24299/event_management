const paymentService = require("../services/payment.service");
const catchAsync = require("../utils/catchAsync");


// ======================================================
// Create Payment
// ======================================================

const createPayment = catchAsync(async (req, res) => {

  const result = await paymentService.createPayment(
    req.user.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Payment created successfully.",
    data: result,
  });
});



// ======================================================
// Process Dummy Payment
// ======================================================

const processDummyPayment = catchAsync(async (req, res) => {

  const result =
    await paymentService.processDummyPayment(
      req.params.id,
      req.user.id,
      req.body
    );

  return res.status(200).json({
    success: true,
    message: result.message,
    data: {
      payment: result.payment,
      booking: result.booking,
    },
  });
});



// ======================================================
// Get Payment By ID
// ======================================================

const getPaymentById = catchAsync(async (req, res) => {

  const result =
    await paymentService.getPaymentById(
      req.params.id,
      req.user.id
    );

  return res.status(200).json({
    success: true,
    data: result,
  });
});



// ======================================================
// Get Payment By Booking
// ======================================================

const getPaymentByBooking = catchAsync(async (req, res) => {

  const result =
    await paymentService.getPaymentByBooking(
      req.params.bookingId,
      req.user.id
    );

  return res.status(200).json({
    success: true,
    data: result,
  });
});



// ======================================================
// Process Refund
// ======================================================

const processRefund = catchAsync(async (req, res) => {

  const result =
    await paymentService.processRefund(
      req.params.id,
      req.user.id
    );

  return res.status(200).json({
    success: true,
    message: result.message,
    data: {
      payment: result.payment,
      booking: result.booking,
    },
  });
});



// ======================================================
// Export
// ======================================================

module.exports = {
  createPayment,
  processDummyPayment,
  getPaymentById,
  getPaymentByBooking,
  processRefund,
};