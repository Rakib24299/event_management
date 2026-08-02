const { z } = require("zod")
const objectIdSchema = require("./objectId.validation");


// const objectIdSchema = z
//   .string()
//   .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");


  const createPaymentSchema = z.object(
    {
      body: z.object(
        {
          booking: objectIdSchema,

          user: objectIdSchema,

          amount: z
          
            .number()
            .min(0, "Amount cannot be negative"),

          paymentMethod: z
          .enum(["bkash","nagad","rocket","card","cash",]),
        }),
});



const updatePaymentStatusSchema = z.object(
  {
    body: z.object(
      {
        paymentStatus: z.enum(["pending","paid","failed","refunded",]),
      }),
});

const refundPaymentSchema = z.object(
{
    body: z.object(
      {
        refundAmount: z
          .number()
          .min(0, "Refund amount cannot be negative"),
      }),
});

module.exports = {
    createPaymentSchema,
    updatePaymentStatusSchema,
    refundPaymentSchema,
};