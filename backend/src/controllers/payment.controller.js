const paymentService = require("../services/payment.service");
const catchAsync = require("../utils/catchAsync");





// Create Payment

const createPayment = catchAsync(async (req, res) => {
  const result = await paymentService.createPayment(req.body.bookingId);

  return res.status(201).json({
    success: true,
    message: "Payment created successfully.",
    data: result,
  });
});
// Verify Payment

const verifyPayment = catchAsync(async (req, res) => {
  const result = await paymentService.verifyPayment(req.params.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Payment Success
const paymentSuccess = catchAsync(async (req, res) => {
  const result = await paymentService.paymentSuccess(req.params.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


// Payment Failed
const paymentFailed = catchAsync(async (req, res) => {
  const result = await paymentService.paymentFailed(req.params.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


// Payment Cancelled
const paymentCancelled = catchAsync(async (req, res) => {
  const result = await paymentService.paymentCancelled(req.params.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

// SSL Payment Success***

const sslPaymentSuccess = catchAsync(async (req, res) => {
  const result = await paymentService.sslPaymentSuccess(req.body);

  return res.status(200).json({
    success: true,
    message: "Payment successful.",
    data: result,
  });
});

// SSL Payment Failed**
const sslPaymentFail = catchAsync(async (req, res) => {
  const result = await paymentService.sslPaymentFail(req.body);

  return res.status(200).json({
    success: true,
    message: "Payment failed.",
    data: result,
  });
});


// SSL Payment Cancel***
const sslPaymentCancel = catchAsync(async (req, res) => {
  const result = await paymentService.sslPaymentCancel(req.body);

  return res.status(200).json({
    success: true,
    message: "Payment cancelled.",
    data: result,
  });
});


// SSL Payment IPN****
const sslPaymentIPN = catchAsync(async (req, res) => {
  const result = await paymentService.sslPaymentIPN(req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Get Payment By ID

const getPaymentById = catchAsync(async (req, res) => {
  const result = await paymentService.getPaymentById(req.params.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// Get My Payments


const getMyPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getMyPayments(req.user.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// Update Payment Status

const updatePaymentStatus = catchAsync(async (req, res) => {
  const result = await paymentService.updatePaymentStatus(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Payment status updated successfully.",
    data: result,
  });
});

module.exports = {
  createPayment,
  verifyPayment,
  paymentSuccess,
  paymentFailed,
  paymentCancelled,
  getPaymentById,
  getMyPayments,
  updatePaymentStatus,

  sslPaymentSuccess,
  sslPaymentFail,
  sslPaymentCancel,
  sslPaymentIPN,
};