const { z } = require("zod")
const objectIdSchema = require("./objectId.validation");


// create Payment Schema***
const createPaymentSchema = z.object({
  body: z
    .object({
      bookingId: objectIdSchema,
    })
    .strict(),
});


// Update Payment Status Schema***

const updatePaymentStatusSchema = z.object({
  body: z
    .object({
      paymentStatus: z.enum(
        [
          "pending",
          "paid",
          "failed",
          "cancelled",
          "refunded",
        ],
        {
          errorMap: () => ({
            message: "Invalid payment status",
          }),
        }
      ),
    })
    .strict(),
});

// Refund Payment Schema
const refundPaymentSchema = z.object({
  body: z
    .object({
      refundAmount: z
        .number({
          required_error: "Refund amount is required",
        })
        .positive("Refund amount must be greater than 0"),
    })
    .strict(),
});

module.exports = {
    createPaymentSchema,
    updatePaymentStatusSchema,
    refundPaymentSchema,
};