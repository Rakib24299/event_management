const paymentService = require("../services/payment.service");


// Create Payment

const createPayment = async (req, res) => {
  try {
    const result = await paymentService.createPayment(req.body.bookingId);

    return res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Payment

const verifyPayment = async (req, res) => {
  try {
    const result = await paymentService.verifyPayment(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Payment Success
const paymentSuccess = async (req, res) => {
  try {
    const result = await paymentService.paymentSuccess(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Payment Failed
const paymentFailed = async (req, res) => {
  try {
    const result = await paymentService.paymentFailed(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// Payment Cancelled
const paymentCancelled = async (req, res) => {
  try {
    const result = await paymentService.paymentCancelled(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Payment By ID

const getPaymentById = async (req, res) => {
  try {
    const result = await paymentService.getPaymentById(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// Get My Payments


const getMyPayments = async (req, res) => {
  try {
    const result = await paymentService.getMyPayments(req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Payment Status

const updatePaymentStatus = async (req, res) => {
  try {
    const result = await paymentService.updatePaymentStatus(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
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