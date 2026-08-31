const refundService =
  require("../services/refund.service");

const catchAsync =
  require("../utils/catchAsync");


// ======================================================
// Get Refund Information
// User Only
// ======================================================

const getRefundInformation = catchAsync(
  async (req, res) => {

    const result =
      await refundService.getRefundInformation(

        req.params.bookingId,

        req.user.id

      );


    return res.status(200).json({

      success: true,

      message:
        "Refund information fetched successfully.",

      data: result,

    });

  }
);


// ======================================================
// Get My Refunds
// User Only
// ======================================================

const getMyRefunds = catchAsync(
  async (req, res) => {

    const result =
      await refundService.getMyRefunds(
        req.user.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Refunds fetched successfully.",

      data: result,

    });

  }
);


// ======================================================
// Process Refund
// Admin Only
// ======================================================

const processRefund = catchAsync(
  async (req, res) => {

    const result =
      await refundService.processRefund(

        req.params.paymentId

      );


    return res.status(200).json({

      success: true,

      message: result.message,

      data: {

        payment: result.payment,

        booking: result.booking,

      },

    });

  }
);


// ======================================================
// Export
// ======================================================

module.exports = {

  getRefundInformation,

  getMyRefunds,

  processRefund,

};