const paymentService = require("../services/payment.service");
const catchAsync = require("../utils/catchAsync");


// ======================================================
// Process Refund
// ======================================================

const processRefund = catchAsync(async (req, res) => {

  const result = await paymentService.processRefund(
    req.params.paymentId,
    req.body.refundAmount
  );

  return res.status(200).json({
    success: true,
    message: "Refund processed successfully.",
    data: result,
  });
});


module.exports = {
  processRefund,
};