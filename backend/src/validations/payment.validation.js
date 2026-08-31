const Joi = require("joi");

// ======================================================
// CREATE PAYMENT
// ======================================================

const createPaymentSchema = Joi.object({
  booking: Joi.string()
    .required()
    .messages({
      "string.empty":
        "Booking ID is required.",
      "any.required":
        "Booking ID is required.",
    }),

  paymentMethod: Joi.string()
    .valid("dummy")
    .default("dummy"),
});

// ======================================================
// PROCESS DUMMY PAYMENT
// ======================================================

const processDummyPaymentSchema = Joi.object({
  paymentResult: Joi.string()
    .valid("success", "failed")
    .default("success")
    .messages({
      "any.only":
        "Payment result must be success or failed.",
    }),
});

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createPaymentSchema,
  processDummyPaymentSchema,
};