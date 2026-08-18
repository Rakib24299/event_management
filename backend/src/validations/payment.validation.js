const { z } = require("zod");

const objectIdSchema = require("./objectId.validation");


// ======================================================
// Create Payment Schema
// ======================================================

const createPaymentSchema = z.object({

  body: z
    .object({

      booking: objectIdSchema,

      paymentMethod: z.enum(
        [
          "bkash",
          "nagad",
          "rocket",
          "card",
        ],
        {
          errorMap: () => ({
            message: "Invalid payment method.",
          }),
        }
      ),

    })
    .strict(),

});



// ======================================================
// Dummy Payment Process Schema
// ======================================================

const processDummyPaymentSchema = z.object({

  body: z
    .object({

      paymentResult: z.enum(
        [
          "success",
          "failed",
        ],
        {
          errorMap: () => ({
            message:
              "Payment result must be success or failed.",
          }),
        }
      ),

    })
    .strict(),

});



// ======================================================
// Update Payment Status Schema
// ======================================================

const updatePaymentStatusSchema = z.object({

  body: z
    .object({

      paymentStatus: z.enum(
        [
          "pending",
          "processing",
          "paid",
          "failed",
          "cancelled",
          "refunded",
        ],
        {
          errorMap: () => ({
            message: "Invalid payment status.",
          }),
        }
      ),

    })
    .strict(),

});



// ======================================================
// Refund Payment Schema
// ======================================================

const refundPaymentSchema = z.object({

  body: z
    .object({

      refundAmount: z
        .number({
          required_error: "Refund amount is required.",
        })
        .positive(
          "Refund amount must be greater than 0."
        ),

    })
    .strict(),

});



// ======================================================
// Export
// ======================================================

module.exports = {

  createPaymentSchema,

  processDummyPaymentSchema,

  updatePaymentStatusSchema,

  refundPaymentSchema,

};